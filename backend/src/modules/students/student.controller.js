const Student = require('./student.model');
const User = require('../users/user.model');
const Role = require('../roles/role.model');
const Notification = require('../notifications/notification.model');
const Parent = require('../parents/parent.model');
const ApiError = require('../../utils/apiError');
const ApiResponse = require('../../utils/apiResponse');
const { emitNotification } = require('../../services/notification.service');
const pick = require('../../utils/pick');
// GET all students (with pagination + filters)
const getStudents = async (req, res, next) => {
  try {
    const { department, course, semester, division, batch, search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (req.user.role.name !== 'Super Admin') filter.collegeId = req.user.collegeId;
    if (department) filter.department = department;
    if (course) filter.course = course;
    if (semester) filter.semester = semester;
    if (division) filter.division = division;
    if (batch) filter.batch = batch;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    let query = Student.find(filter)
      .populate('user', 'email status profileImage')
      .populate('department', 'name code')
      .populate('course', 'name code')
      .populate('semester', 'name')
      .populate('parent', 'fullName phone email relation')
      .populate('parents', 'fullName phone email relation')
      .populate('mentor', 'fullName employeeId')
      .sort({ 'personalDetails.fullName': 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const [students, total] = await Promise.all([query, Student.countDocuments(filter)]);

    return res.json(new ApiResponse(200, {
      students,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) }
    }, 'Students fetched'));
  } catch (error) { next(error); }
};

// GET single student
const getStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('user', 'email status profileImage lastLogin')
      .populate('department', 'name code')
      .populate('course', 'name code durationSemesters')
      .populate('semester', 'name startDate endDate')
      .populate('parent', 'fullName phone email relation')
      .populate('parents', 'fullName phone email relation')
      .populate('mentor', 'fullName employeeId');
    if (!student) throw new ApiError(404, 'Student not found');
    return res.json(new ApiResponse(200, student, 'Student fetched'));
  } catch (error) { next(error); }
};

// POST create student (creates user account + student profile)
const createStudent = async (req, res, next) => {
  try {
    const {
      email, password, rollNumber, enrollmentNumber,
      department, course, semester, division, batch,
      personalDetails, collegeId, fatherEmail, fatherPassword, motherEmail, motherPassword, mentor
    } = req.body;

    if (!email || !password || !rollNumber || !enrollmentNumber || !personalDetails?.fullName) {
      throw new ApiError(400, 'Missing required fields');
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ApiError(400, 'Invalid email format');
    }

    // Mobile number validation (10-digit Indian format)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (personalDetails?.phone && !phoneRegex.test(personalDetails.phone)) {
      throw new ApiError(400, 'Invalid mobile number. Must be a 10-digit number starting with 6-9');
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) throw new ApiError(400, 'Email already exists');

    const existingRoll = await Student.findOne({ rollNumber });
    if (existingRoll) throw new ApiError(400, 'Roll number already exists');

    const studentRole = await Role.findOne({ name: 'Student' });
    if (!studentRole) throw new ApiError(500, 'Student role not configured');

    let user;
    try {
      user = await User.create({
        email, password,
        role: studentRole._id,
        collegeId: collegeId || req.user.collegeId,
        isVerified: true,
        status: 'Active'
      });

      const student = await Student.create({
        user: user._id,
        rollNumber, enrollmentNumber,
        department, course, semester, division, batch,
        personalDetails, mentor,
        collegeId: collegeId || req.user.collegeId
      });

      if (parentEmail) {
        const parentRole = await Role.findOne({ name: 'Parent' });
        if (parentRole) {
          let parentUser = await User.findOne({ email: parentEmail });
          if (!parentUser) {
            if (!parentPassword) {
              throw new ApiError(400, 'Password is required to create a new parent account');
            }
            parentUser = await User.create({
              email: parentEmail,
              password: parentPassword,
              role: parentRole._id,
              collegeId: collegeId || req.user.collegeId,
              isVerified: true,
              status: 'Active'
            });
            
            await Parent.create({
              user: pUser._id,
              fullName: `${pRelation} of ${personalDetails.fullName}`,
              phone: personalDetails.phone || '0000000000',
              email: pEmail,
              relation: pRelation,
              students: [student._id],
              collegeId: collegeId || req.user.collegeId
            });
          } else {
            const pProfile = await Parent.findOne({ user: pUser._id });
            if (pProfile && !pProfile.students.includes(student._id)) {
              pProfile.students.push(student._id);
              await pProfile.save();
            }
          }
          const pProfile = await Parent.findOne({ user: pUser._id });
          return pProfile ? pProfile._id : null;
        };

        const fatherId = await processParent(fatherEmail, fatherPassword, 'Father');
        const motherId = await processParent(motherEmail, motherPassword, 'Mother');
        
        if (fatherId || motherId) {
          student.parents = [];
          if (fatherId) student.parents.push(fatherId);
          if (motherId) student.parents.push(motherId);
          await student.save();
        }
      }

      const populated = await Student.findById(student._id)
        .populate('user', 'email status')
        .populate('department', 'name')
        .populate('course', 'name')
        .populate('parent', 'fullName phone email relation')
        .populate('parents', 'fullName phone email relation')
        .populate('mentor', 'fullName employeeId');

      await emitNotification({
        title: 'New Student Added',
        message: `${populated.personalDetails.fullName || 'A new student'} has been added to ${populated.department?.name || 'their department'}`,
        type: 'Academic',
        category: 'Academic'
      });

      return res.status(201).json(new ApiResponse(201, populated, 'Student created'));
    } catch (err) {
      if (user) {
        await User.findByIdAndDelete(user._id);
      }
      console.error("Student creation failed:", err);
      throw err;
    }
  } catch (error) { next(error); }
};

// PUT update student
const updateStudent = async (req, res, next) => {
  try {
    const { email, password, personalDetails } = req.body;

    const existingStudent = await Student.findById(req.params.id).populate('user');
    if (!existingStudent) throw new ApiError(404, 'Student not found');

    // Email validation and update
    if (email && email !== existingStudent.user.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new ApiError(400, 'Invalid email format');
      }
      const existingUser = await User.findOne({ email, _id: { $ne: existingStudent.user._id } });
      if (existingUser) throw new ApiError(400, 'Email already in use');
      
      existingStudent.user.email = email;
    }

    // Password update
    if (password) {
      existingStudent.user.password = password;
    }

    // Save user if credentials changed
    if (email !== existingStudent.user.email || password) {
      await existingStudent.user.save();
    }

    // Mobile number validation (if being updated)
    if (personalDetails?.phone !== undefined) {
      const phoneRegex = /^[6-9]\d{9}$/;
      if (!phoneRegex.test(personalDetails.phone)) {
        throw new ApiError(400, 'Invalid mobile number. Must be a 10-digit number starting with 6-9');
      }
    }

    const allowedUpdates = pick(req.body, [
      'rollNumber', 'enrollmentNumber', 'department', 'course', 'semester', 
      'division', 'batch', 'personalDetails', 'mentor'
    ]);

    const student = await Student.findByIdAndUpdate(req.params.id, allowedUpdates, { new: true, runValidators: true })
      .populate('user', 'email status')
      .populate('department', 'name')
      .populate('course', 'name')
      .populate('mentor', 'fullName employeeId');

    const { parentEmail, parentPassword } = req.body;
    if (parentEmail) {
      const parentRole = await Role.findOne({ name: 'Parent' });
      if (parentRole) {
        let parentUser = await User.findOne({ email: parentEmail });
        if (!parentUser) {
          if (!parentPassword) {
             throw new ApiError(400, 'Password is required to create a new parent account');
          }
          parentUser = await User.create({
            email: parentEmail,
            password: parentPassword,
            role: parentRole._id,
            collegeId: student.collegeId,
            isVerified: true,
            status: 'Active'
          });
          
          await Parent.create({
            user: pUser._id,
            fullName: `${pRelation} of ${student.personalDetails?.fullName || 'Student'}`,
            phone: student.personalDetails?.phone || '0000000000',
            email: pEmail,
            relation: pRelation,
            students: [student._id],
            collegeId: student.collegeId
          });
        } else {
          // Parent user already exists
          if (parentPassword) {
            parentUser.password = parentPassword;
            await parentUser.save();
          }
          // check profile
          const parentProfile = await Parent.findOne({ user: parentUser._id });
          if (parentProfile && !parentProfile.students.includes(student._id)) {
            parentProfile.students.push(student._id);
            await parentProfile.save();
          }
        }
        const pProfile = await Parent.findOne({ user: pUser._id });
        return pProfile ? pProfile._id : null;
      };

      const fatherId = await processParent(fatherEmail, fatherPassword, 'Father');
      const motherId = await processParent(motherEmail, motherPassword, 'Mother');
      
      let updatedParents = false;
      if (!student.parents) student.parents = [];
      
      if (fatherId && !student.parents.includes(fatherId)) {
        student.parents.push(fatherId);
        updatedParents = true;
      }
      if (motherId && !student.parents.includes(motherId)) {
        student.parents.push(motherId);
        updatedParents = true;
      }
      if (updatedParents) {
        await student.save();
      }
    }

    const populatedStudent = await Student.findById(student._id)
      .populate('user', 'email status')
      .populate('department', 'name')
      .populate('course', 'name')
      .populate('parent', 'fullName phone email relation')
      .populate('parents', 'fullName phone email relation')
      .populate('mentor', 'fullName employeeId');

    await emitNotification({
      title: 'Student Updated',
      message: `${populatedStudent.personalDetails?.fullName || 'A student'}'s profile was updated`,
      type: 'Academic',
      category: 'Academic'
    });

    return res.json(new ApiResponse(200, populatedStudent, 'Student updated'));
  } catch (error) { next(error); }
};

// DELETE student
const deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) throw new ApiError(404, 'Student not found');
    await User.findByIdAndDelete(student.user);
    await Student.findByIdAndDelete(req.params.id);

    await emitNotification({
      title: 'Student Removed',
      message: `A student record was removed`,
      type: 'Academic',
      category: 'General'
    });

    return res.json(new ApiResponse(200, null, 'Student deleted'));
  } catch (error) { next(error); }
};

// GET student's own profile
const getMyProfile = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user._id })
      .populate('user', 'email status profileImage lastLogin')
      .populate('department', 'name code')
      .populate('course', 'name code')
      .populate('semester', 'name')
      .populate('parent', 'fullName phone email relation')
      .populate('parents', 'fullName phone email relation')
      .populate('mentor', 'fullName email phone');
    if (!student) throw new ApiError(404, 'Student profile not found');
    return res.json(new ApiResponse(200, student, 'Profile fetched'));
  } catch (error) { next(error); }
};

// GET student dashboard stats
const getStudentDashboardStats = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user._id })
      .populate('course', 'name')
      .populate('semester', 'name');
    if (!student) throw new ApiError(404, 'Student profile not found');

    const filter = { student: student._id };

    // 1. Attendance Summary
    let Attendance;
    try { Attendance = require('../attendance/attendance.model'); } catch (e) {}
    let attendanceData = [ { name: 'Present', value: 85, color: '#10b981' }, { name: 'Absent', value: 15, color: '#f43f5e' } ];
    if (Attendance) {
      const totalPresent = await Attendance.countDocuments({ ...filter, status: 'Present' });
      const totalAbsent = await Attendance.countDocuments({ ...filter, status: { $ne: 'Present' } });
      if (totalPresent > 0 || totalAbsent > 0) {
        attendanceData = [ { name: 'Present', value: totalPresent, color: '#10b981' }, { name: 'Absent', value: totalAbsent, color: '#f43f5e' } ];
      }
    }

    // 2. Today's Classes
    let Timetable;
    try { Timetable = require('../timetables/timetable.model'); } catch(e) {}
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = days[new Date().getDay()];
    
    let formattedClasses = [];
    if (Timetable) {
      const todaysClasses = await Timetable.find({
        semester: student.semester,
        division: student.division,
        dayOfWeek: today,
        isActive: true
      }).populate('subject', 'name').sort({ startTime: 1 }).lean();
      
      formattedClasses = todaysClasses.map(cls => ({
        time: `${cls.startTime} - ${cls.endTime}`,
        subject: cls.subject?.name || 'Unknown Subject',
        room: cls.roomNumber,
        done: false
      }));
    }

    if (formattedClasses.length === 0) {
      formattedClasses = [
        { time: '09:00 AM', subject: 'Data Structures (Mock)', room: 'L-101', done: true },
        { time: '11:15 AM', subject: 'Operating Systems (Mock)', room: 'L-102', done: false },
      ];
    }

    // 3. Action Center Stats
    let Assignment;
    let assignmentsDue = 2;
    try { 
      Assignment = require('../assignments/assignment.model'); 
      assignmentsDue = await Assignment.countDocuments({ 
         course: student.course,
         dueDate: { $gte: new Date() }
      });
    } catch(e) {}

    const stats = {
      attendance: attendanceData,
      todaysClasses: formattedClasses,
      feesDue: 25000, // Placeholder
      assignmentsDue: assignmentsDue,
      libraryBooksDue: 1, // Placeholder
      studentDetails: {
        course: student.course?.name || 'Unknown Course',
        semester: student.semester?.name || 'Unknown Semester',
        division: student.division || 'Unknown Division'
      }
    };

    return res.json(new ApiResponse(200, stats, 'Dashboard stats fetched'));
  } catch (error) { next(error); }
};

module.exports = { getStudents, getStudent, createStudent, updateStudent, deleteStudent, getMyProfile, getStudentDashboardStats };
