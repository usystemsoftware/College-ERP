const Semester = require('./semester.model');
const ApiError = require('../../utils/apiError');
const ApiResponse = require('../../utils/apiResponse');

const getSemesters = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.academicYear) filter.academicYear = req.query.academicYear;
    const semesters = await Semester.find(filter).populate('academicYear', 'name').sort({ name: 1 });
    return res.json(new ApiResponse(200, semesters, 'Semesters fetched'));
  } catch (error) { next(error); }
};

const getCurrentSemester = async (req, res, next) => {
  try {
    const sem = await Semester.findOne({ isCurrent: true }).populate('academicYear', 'name');
    if (!sem) throw new ApiError(404, 'No current semester set');
    return res.json(new ApiResponse(200, sem, 'Current semester fetched'));
  } catch (error) { next(error); }
};

const createSemester = async (req, res, next) => {
  try {
    const { name, academicYear, startDate, endDate, isCurrent } = req.body;
    if (!name || !academicYear || !startDate || !endDate) throw new ApiError(400, 'All fields required');
    if (isCurrent) await Semester.updateMany({}, { isCurrent: false });
    const sem = await Semester.create({ name, academicYear, startDate, endDate, isCurrent: isCurrent || false });
    return res.status(201).json(new ApiResponse(201, sem, 'Semester created'));
  } catch (error) { next(error); }
};

const updateSemester = async (req, res, next) => {
  try {
    if (req.body.isCurrent) await Semester.updateMany({ _id: { $ne: req.params.id } }, { isCurrent: false });
    const sem = await Semester.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!sem) throw new ApiError(404, 'Semester not found');
    return res.json(new ApiResponse(200, sem, 'Semester updated'));
  } catch (error) { next(error); }
};

const deleteSemester = async (req, res, next) => {
  try {
    const sem = await Semester.findByIdAndDelete(req.params.id);
    if (!sem) throw new ApiError(404, 'Semester not found');
    return res.json(new ApiResponse(200, null, 'Semester deleted'));
  } catch (error) { next(error); }
};

module.exports = { getSemesters, getCurrentSemester, createSemester, updateSemester, deleteSemester };
