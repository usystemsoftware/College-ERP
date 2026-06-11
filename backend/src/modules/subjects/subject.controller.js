const Subject = require('./subject.model');
const ApiError = require('../../utils/apiError');
const ApiResponse = require('../../utils/apiResponse');
const pick = require('../../utils/pick');

const getSubjects = async (req, res, next) => {
  try {
    const filter = {};
    if (req.user.role.name !== 'Super Admin') filter.collegeId = req.user.collegeId;
    if (req.query.course) filter.course = req.query.course;
    if (req.query.semester) filter.semester = req.query.semester;
    if (req.query.department) filter.department = req.query.department;
    const subjects = await Subject.find(filter)
      .populate('course', 'name code')
      .populate('semester', 'name')
      .populate('department', 'name code')
      .sort({ name: 1 });
    return res.json(new ApiResponse(200, subjects, 'Subjects fetched'));
  } catch (error) { next(error); }
};

const getSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id)
      .populate('course', 'name code')
      .populate('semester', 'name')
      .populate('department', 'name code');
    if (!subject) throw new ApiError(404, 'Subject not found');
    return res.json(new ApiResponse(200, subject, 'Subject fetched'));
  } catch (error) { next(error); }
};

const createSubject = async (req, res, next) => {
  try {
    const { name, code, course, semester, department, credits, type, collegeId } = req.body;
    if (!name || !code || !course || !semester || !department || !credits) throw new ApiError(400, 'All required fields must be provided');
    const exists = await Subject.findOne({ code: code.toUpperCase() });
    if (exists) throw new ApiError(400, 'Subject code already exists');
    const subject = await Subject.create({ name, code: code.toUpperCase(), course, semester, department, credits, type, collegeId: collegeId || req.user.collegeId });
    return res.status(201).json(new ApiResponse(201, subject, 'Subject created'));
  } catch (error) { next(error); }
};

const updateSubject = async (req, res, next) => {
  try {
    const allowedUpdates = pick(req.body, ['name', 'code', 'course', 'semester', 'department', 'credits', 'type']);
    const subject = await Subject.findByIdAndUpdate(req.params.id, allowedUpdates, { new: true, runValidators: true });
    if (!subject) throw new ApiError(404, 'Subject not found');
    return res.json(new ApiResponse(200, subject, 'Subject updated'));
  } catch (error) { next(error); }
};

const deleteSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findByIdAndDelete(req.params.id);
    if (!subject) throw new ApiError(404, 'Subject not found');
    return res.json(new ApiResponse(200, null, 'Subject deleted'));
  } catch (error) { next(error); }
};

module.exports = { getSubjects, getSubject, createSubject, updateSubject, deleteSubject };
