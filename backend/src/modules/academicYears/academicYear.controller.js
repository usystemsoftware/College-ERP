const AcademicYear = require('./academicYear.model');
const ApiError = require('../../utils/apiError');
const ApiResponse = require('../../utils/apiResponse');
const pick = require('../../utils/pick');

const getAcademicYears = async (req, res, next) => {
  try {
    const years = await AcademicYear.find({}).sort({ startDate: -1 });
    return res.json(new ApiResponse(200, years, 'Academic years fetched'));
  } catch (error) { next(error); }
};

const getCurrentAcademicYear = async (req, res, next) => {
  try {
    const year = await AcademicYear.findOne({ isCurrent: true });
    if (!year) throw new ApiError(404, 'No current academic year set');
    return res.json(new ApiResponse(200, year, 'Current academic year fetched'));
  } catch (error) { next(error); }
};

const createAcademicYear = async (req, res, next) => {
  try {
    const { name, startDate, endDate, isCurrent } = req.body;
    if (!name || !startDate || !endDate) throw new ApiError(400, 'Name, start date and end date are required');
    // If marking as current, unset previous current
    if (isCurrent) await AcademicYear.updateMany({}, { isCurrent: false });
    const year = await AcademicYear.create({ name, startDate, endDate, isCurrent: isCurrent || false });
    return res.status(201).json(new ApiResponse(201, year, 'Academic year created'));
  } catch (error) { next(error); }
};

const updateAcademicYear = async (req, res, next) => {
  try {
    if (req.body.isCurrent) await AcademicYear.updateMany({ _id: { $ne: req.params.id } }, { isCurrent: false });
    const allowedUpdates = pick(req.body, ['name', 'startDate', 'endDate', 'isCurrent']);
    const year = await AcademicYear.findByIdAndUpdate(req.params.id, allowedUpdates, { new: true, runValidators: true });
    if (!year) throw new ApiError(404, 'Academic year not found');
    return res.json(new ApiResponse(200, year, 'Academic year updated'));
  } catch (error) { next(error); }
};

const deleteAcademicYear = async (req, res, next) => {
  try {
    const year = await AcademicYear.findByIdAndDelete(req.params.id);
    if (!year) throw new ApiError(404, 'Academic year not found');
    return res.json(new ApiResponse(200, null, 'Academic year deleted'));
  } catch (error) { next(error); }
};

module.exports = { getAcademicYears, getCurrentAcademicYear, createAcademicYear, updateAcademicYear, deleteAcademicYear };
