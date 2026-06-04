const Student = require('./student.model');
const User = require('../users/user.model');
const Role = require('../roles/role.model');
const ApiError = require('../../utils/apiError');
const ApiResponse = require('../../utils/apiResponse');

// GET all students (with pagination + filters)
const getStudents = async (req, res, next) => {
  try {
    const { department, course, semester, division, batch, search, page = 1, limit = 20 } = req.query;
    const filter = { collegeId: req.user.collegeId };
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
      .populate('parent', 'fullName phone')
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
      .populate('parent', 'fullName phone email relation');
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
      personalDetails, collegeId
    } = req.body;

    if (!email || !password || !rollNumber || !enrollmentNumber || !personalDetails?.fullName) {
      throw new ApiError(400, 'Missing required fields');
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
        personalDetails,
        collegeId: collegeId || req.user.collegeId
      });

      const populated = await Student.findById(student._id)
        .populate('user', 'email status')
        .populate('department', 'name')
        .populate('course', 'name');

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
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('user', 'email status')
      .populate('department', 'name')
      .populate('course', 'name');
    if (!student) throw new ApiError(404, 'Student not found');
    return res.json(new ApiResponse(200, student, 'Student updated'));
  } catch (error) { next(error); }
};

// DELETE student
const deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) throw new ApiError(404, 'Student not found');
    await User.findByIdAndDelete(student.user);
    await Student.findByIdAndDelete(req.params.id);
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
      .populate('parent', 'fullName phone');
    if (!student) throw new ApiError(404, 'Student profile not found');
    return res.json(new ApiResponse(200, student, 'Profile fetched'));
  } catch (error) { next(error); }
};

module.exports = { getStudents, getStudent, createStudent, updateStudent, deleteStudent, getMyProfile };
