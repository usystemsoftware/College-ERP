const Course = require('./course.model');
const ApiError = require('../../utils/apiError');
const ApiResponse = require('../../utils/apiResponse');
const pick = require('../../utils/pick');

const getCourses = async (req, res, next) => {
  try {
    const filter = {};
    if (req.user.role.name !== 'Super Admin') filter.collegeId = req.user.collegeId;
    if (req.query.department) filter.department = req.query.department;
    const courses = await Course.find(filter).populate('department', 'name code').sort({ name: 1 });
    return res.json(new ApiResponse(200, courses, 'Courses fetched'));
  } catch (error) { next(error); }
};

const getCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id).populate('department', 'name code');
    if (!course) throw new ApiError(404, 'Course not found');
    return res.json(new ApiResponse(200, course, 'Course fetched'));
  } catch (error) { next(error); }
};

const createCourse = async (req, res, next) => {
  try {
    const { name, code, department, durationSemesters, collegeId } = req.body;
    if (!name || !code || !department) throw new ApiError(400, 'Name, code, and department are required');
    const exists = await Course.findOne({ code: code.toUpperCase() });
    if (exists) throw new ApiError(400, 'Course code already exists');
    const course = await Course.create({ name, code: code.toUpperCase(), department, durationSemesters: durationSemesters || 8, collegeId: collegeId || req.user.collegeId });
    return res.status(201).json(new ApiResponse(201, course, 'Course created'));
  } catch (error) { next(error); }
};

const updateCourse = async (req, res, next) => {
  try {
    const allowedUpdates = pick(req.body, ['name', 'code', 'department', 'durationSemesters']);
    const course = await Course.findByIdAndUpdate(req.params.id, allowedUpdates, { new: true, runValidators: true });
    if (!course) throw new ApiError(404, 'Course not found');
    return res.json(new ApiResponse(200, course, 'Course updated'));
  } catch (error) { next(error); }
};

const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) throw new ApiError(404, 'Course not found');
    return res.json(new ApiResponse(200, null, 'Course deleted'));
  } catch (error) { next(error); }
};

module.exports = { getCourses, getCourse, createCourse, updateCourse, deleteCourse };
