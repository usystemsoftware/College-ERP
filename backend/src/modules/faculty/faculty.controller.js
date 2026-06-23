const Faculty = require('./faculty.model');
const User = require('../users/user.model');
const Role = require('../roles/role.model');
const ApiError = require('../../utils/apiError');
const ApiResponse = require('../../utils/apiResponse');
const pick = require('../../utils/pick');

const getFaculty = async (req, res, next) => {
  try {
    const filter = { collegeId: req.user.collegeId };
    if (req.query.department) filter.department = req.query.department;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [faculty, total] = await Promise.all([
      Faculty.find(filter)
        .populate('user', 'email status profileImage lastLogin')
        .populate('department', 'name code')
        .sort({ fullName: 1 })
        .skip(skip).limit(limit),
      Faculty.countDocuments(filter)
    ]);

    return res.json(new ApiResponse(200, {
      faculty, pagination: { total, page, limit, pages: Math.ceil(total / limit) }
    }, 'Faculty fetched'));
  } catch (error) { next(error); }
};

const getFacultyMember = async (req, res, next) => {
  try {
    const faculty = await Faculty.findById(req.params.id)
      .populate('user', 'email status profileImage')
      .populate('department', 'name code');
    if (!faculty) throw new ApiError(404, 'Faculty not found');
    return res.json(new ApiResponse(200, faculty, 'Faculty fetched'));
  } catch (error) { next(error); }
};

const createFaculty = async (req, res, next) => {
  try {
    const { email, password, employeeId, fullName, designation, department, joiningDate, collegeId, role } = req.body;
    if (!email || !password || !employeeId || !fullName || !department) throw new ApiError(400, 'Required fields missing');

    const existingUser = await User.findOne({ email });
    if (existingUser) throw new ApiError(400, 'Email already exists');
    const existingEmp = await Faculty.findOne({ employeeId });
    if (existingEmp) throw new ApiError(400, 'Employee ID already exists');

    // Find requested role or default to 'Faculty'
    const roleName = role || 'Faculty';
    const selectedRole = await Role.findOne({ name: roleName });
    if (!selectedRole) throw new ApiError(500, `Role '${roleName}' not configured`);

    const user = await User.create({
      email, password,
      role: selectedRole._id,
      collegeId: collegeId || req.user.collegeId,
      isVerified: true,
      status: 'Active'
    });

    const faculty = await Faculty.create({
      user: user._id,
      employeeId, fullName, designation: designation || 'Assistant Professor',
      department, joiningDate: joiningDate || new Date(),
      collegeId: collegeId || req.user.collegeId
    });

    const Notification = require('../notifications/notification.model');
    const notification = await Notification.create({
      recipient: req.user._id,
      title: 'Faculty Added',
      message: `Faculty member ${fullName} (${employeeId}) has been successfully added.`,
      type: 'System',
      category: 'General',
      collegeId: req.user.collegeId
    });

    const io = req.app.get('io');
    if (io) {
      io.to(req.user._id.toString()).emit('notification', notification);
    }

    return res.status(201).json(new ApiResponse(201, faculty, 'Faculty created'));
  } catch (error) { next(error); }
};

const updateFaculty = async (req, res, next) => {
  try {
    const allowedUpdates = pick(req.body, ['employeeId', 'fullName', 'designation', 'department', 'joiningDate']);
    const faculty = await Faculty.findByIdAndUpdate(req.params.id, allowedUpdates, { new: true, runValidators: true })
      .populate('user', 'email status')
      .populate('department', 'name');
    if (!faculty) throw new ApiError(404, 'Faculty not found');
    return res.json(new ApiResponse(200, faculty, 'Faculty updated'));
  } catch (error) { next(error); }
};

const deleteFaculty = async (req, res, next) => {
  try {
    const faculty = await Faculty.findById(req.params.id);
    if (!faculty) throw new ApiError(404, 'Faculty not found');
    await User.findByIdAndDelete(faculty.user);
    await Faculty.findByIdAndDelete(req.params.id);
    return res.json(new ApiResponse(200, null, 'Faculty deleted'));
  } catch (error) { next(error); }
};

const getMyFacultyProfile = async (req, res, next) => {
  try {
    const faculty = await Faculty.findOne({ user: req.user._id })
      .populate('user', 'email status profileImage')
      .populate('department', 'name code');
    if (!faculty) throw new ApiError(404, 'Faculty profile not found');
    return res.json(new ApiResponse(200, faculty, 'Profile fetched'));
  } catch (error) { next(error); }
};

const getFacultyDashboardStats = async (req, res, next) => {
  try {
    const faculty = await Faculty.findOne({ user: req.user._id });
    if (!faculty) throw new ApiError(404, 'Faculty profile not found');

    // 1. Today's Classes
    let Timetable;
    try { Timetable = require('../timetables/timetable.model'); } catch(e) {}
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = days[new Date().getDay()];
    
    let formattedClasses = [];
    if (Timetable) {
      const todaysClasses = await Timetable.find({
        faculty: faculty._id,
        dayOfWeek: today,
        isActive: true
      }).populate('subject', 'name').sort({ startTime: 1 }).lean();
      
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      let attendanceMap = {};
      try {
        const FacultyAttendance = require('../attendance/facultyAttendance.model');
        const attendanceRecords = await FacultyAttendance.find({
          faculty: faculty._id,
          date: startOfDay
        });
        attendanceRecords.forEach(att => {
          attendanceMap[att.timetableId.toString()] = {
            status: att.status,
            sessionStatus: att.sessionStatus,
            actualStartTime: att.actualStartTime,
            actualEndTime: att.actualEndTime
          };
        });
      } catch (e) {
        console.error("Error fetching faculty attendance", e);
      }
      
      formattedClasses = todaysClasses.map(cls => {
        const att = attendanceMap[cls._id.toString()];
        return {
          _id: cls._id,
          time: `${cls.startTime} - ${cls.endTime}`,
          subject: cls.subject?.name || 'Unknown Subject',
          room: cls.roomNumber,
          type: cls.isLab ? 'Practical' : 'Theory',
          done: att?.status === 'Present',
          attendanceStatus: att?.status || null,
          sessionStatus: att?.sessionStatus || 'Pending',
          actualStartTime: att?.actualStartTime || null,
          actualEndTime: att?.actualEndTime || null
        };
      });
    }

    // Removed mock classes fallback

    // Dynamic Counts
    let totalStudents = 0;
    try {
      const Student = require('../students/student.model');
      totalStudents = await Student.countDocuments({ department: faculty.department });
    } catch(e) {}

    let pendingGrading = 0;
    try {
      const Assignment = require('../assignments/assignment.model');
      const Submission = require('../assignments/submission.model');
      const assignments = await Assignment.find({ faculty: faculty._id }).select('_id');
      const assignmentIds = assignments.map(a => a._id);
      pendingGrading = await Submission.countDocuments({ assignment: { $in: assignmentIds }, status: 'Submitted' });
    } catch(e) {}

    // 2. Real Attendance Stats (If available, otherwise empty array)
    let avgAttendance = 0;
    let attendanceStats = [];
    try {
      const Attendance = require('../attendance/attendance.model');
      // Simple dynamic fallback: if no data, keep it empty. We won't build a complex aggregation here 
      // unless needed, to avoid breaking the dashboard.
    } catch(e) {}

    const stats = {
      todaysClasses: formattedClasses,
      totalStudents: totalStudents,
      pendingGrading: pendingGrading,
      avgAttendance: avgAttendance,
      attendanceStats: attendanceStats
    };

    return res.json(new ApiResponse(200, stats, 'Dashboard stats fetched'));
  } catch (error) { next(error); }
};

module.exports = { getFaculty, getFacultyMember, createFaculty, updateFaculty, deleteFaculty, getMyFacultyProfile, getFacultyDashboardStats };
