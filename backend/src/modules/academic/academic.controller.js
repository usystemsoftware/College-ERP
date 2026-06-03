const Department = require('./department.model');
const Course = require('./course.model');
const Batch = require('./batch.model');
const ApiError = require('../../utils/apiError');
const ApiResponse = require('../../utils/apiResponse');

// --- Departments ---
const getDepartments = async (req, res, next) => {
  try {
    const filter = req.user.role.name !== 'Super Admin' ? { collegeId: req.user.collegeId } : {};
    const departments = await Department.find(filter).populate('collegeId', 'name code');
    return res.status(200).json(new ApiResponse(200, { departments }, 'Departments fetched successfully'));
  } catch (error) {
    next(error);
  }
};

const createDepartment = async (req, res, next) => {
  try {
    const { name, code, description } = req.body;
    const collegeId = req.user.role.name !== 'Super Admin' ? req.user.collegeId : req.body.collegeId;

    if (!collegeId) throw new ApiError(400, 'College ID is required');

    const department = await Department.create({ name, code, description, collegeId });
    return res.status(201).json(new ApiResponse(201, { department }, 'Department created successfully'));
  } catch (error) {
    next(error);
  }
};

// --- Courses ---
const getCourses = async (req, res, next) => {
  try {
    const { departmentId } = req.query;
    const filter = departmentId ? { departmentId } : {};
    // For a fully secure app, we should ensure the department belongs to the user's college.
    const courses = await Course.find(filter).populate('departmentId', 'name code');
    return res.status(200).json(new ApiResponse(200, { courses }, 'Courses fetched successfully'));
  } catch (error) {
    next(error);
  }
};

const createCourse = async (req, res, next) => {
  try {
    const { name, code, departmentId, durationYears } = req.body;
    if (!departmentId) throw new ApiError(400, 'Department ID is required');

    const course = await Course.create({ name, code, departmentId, durationYears });
    return res.status(201).json(new ApiResponse(201, { course }, 'Course created successfully'));
  } catch (error) {
    next(error);
  }
};

// --- Batches ---
const getBatches = async (req, res, next) => {
  try {
    const { courseId } = req.query;
    const filter = courseId ? { courseId } : {};
    const batches = await Batch.find(filter).populate('courseId', 'name code');
    return res.status(200).json(new ApiResponse(200, { batches }, 'Batches fetched successfully'));
  } catch (error) {
    next(error);
  }
};

const createBatch = async (req, res, next) => {
  try {
    const { name, courseId, startYear, endYear } = req.body;
    if (!courseId) throw new ApiError(400, 'Course ID is required');

    const batch = await Batch.create({ name, courseId, startYear, endYear });
    return res.status(201).json(new ApiResponse(201, { batch }, 'Batch created successfully'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDepartments, createDepartment,
  getCourses, createCourse,
  getBatches, createBatch
};
