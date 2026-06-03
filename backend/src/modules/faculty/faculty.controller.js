const Faculty = require('./faculty.model');
const User = require('../users/user.model');
const Role = require('../roles/role.model');
const ApiError = require('../../utils/apiError');
const ApiResponse = require('../../utils/apiResponse');

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
    const { email, password, employeeId, fullName, designation, department, joiningDate, collegeId } = req.body;
    if (!email || !password || !employeeId || !fullName || !department) throw new ApiError(400, 'Required fields missing');

    const existingUser = await User.findOne({ email });
    if (existingUser) throw new ApiError(400, 'Email already exists');
    const existingEmp = await Faculty.findOne({ employeeId });
    if (existingEmp) throw new ApiError(400, 'Employee ID already exists');

    const facultyRole = await Role.findOne({ name: 'Faculty' });
    if (!facultyRole) throw new ApiError(500, 'Faculty role not configured');

    const user = await User.create({
      email, password,
      role: facultyRole._id,
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

    return res.status(201).json(new ApiResponse(201, faculty, 'Faculty created'));
  } catch (error) { next(error); }
};

const updateFaculty = async (req, res, next) => {
  try {
    const faculty = await Faculty.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
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

module.exports = { getFaculty, getFacultyMember, createFaculty, updateFaculty, deleteFaculty, getMyFacultyProfile };
