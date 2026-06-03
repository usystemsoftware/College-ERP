const Placement = require('./placement.model');
const Company = require('./company.model');
const Student = require('../students/student.model');
const ApiError = require('../../utils/apiError');
const ApiResponse = require('../../utils/apiResponse');

// Companies CRUD
const getCompanies = async (req, res, next) => {
  try {
    const companies = await Company.find({ status: 'Active' }).sort({ name: 1 });
    return res.json(new ApiResponse(200, companies, 'Companies fetched'));
  } catch (error) { next(error); }
};

const createCompany = async (req, res, next) => {
  try {
    const company = await Company.create(req.body);
    return res.status(201).json(new ApiResponse(201, company, 'Company created'));
  } catch (error) { next(error); }
};

// Placements CRUD
const getPlacements = async (req, res, next) => {
  try {
    const { status, type, page = 1, limit = 20 } = req.query;
    const filter = { collegeId: req.user.collegeId };
    if (status) filter.status = status;
    if (type) filter.type = type;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [placements, total] = await Promise.all([
      Placement.find(filter).populate('company', 'name industry logoUrl').sort({ driveDate: -1 }).skip(skip).limit(parseInt(limit)),
      Placement.countDocuments(filter)
    ]);
    return res.json(new ApiResponse(200, { placements, pagination: { total, pages: Math.ceil(total / parseInt(limit)) } }, 'Placements fetched'));
  } catch (error) { next(error); }
};

const getPlacement = async (req, res, next) => {
  try {
    const placement = await Placement.findById(req.params.id)
      .populate('company', 'name industry website logoUrl contactPerson')
      .populate('eligibilityCriteria.allowedBranches', 'name code')
      .populate('applications.student', 'rollNumber personalDetails.fullName');
    if (!placement) throw new ApiError(404, 'Placement not found');
    return res.json(new ApiResponse(200, placement, 'Placement fetched'));
  } catch (error) { next(error); }
};

const createPlacement = async (req, res, next) => {
  try {
    const placement = await Placement.create({ ...req.body, postedBy: req.user._id, collegeId: req.user.collegeId });
    return res.status(201).json(new ApiResponse(201, placement, 'Placement drive created'));
  } catch (error) { next(error); }
};

const applyForPlacement = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) throw new ApiError(403, 'Student profile not found');

    const placement = await Placement.findById(req.params.id);
    if (!placement) throw new ApiError(404, 'Placement not found');
    if (placement.status !== 'Open') throw new ApiError(400, 'Applications are closed');
    if (placement.lastApplyDate && new Date() > placement.lastApplyDate) throw new ApiError(400, 'Application deadline passed');

    const alreadyApplied = placement.applications.some(a => a.student.toString() === student._id.toString());
    if (alreadyApplied) throw new ApiError(400, 'Already applied');

    placement.applications.push({ student: student._id });
    await placement.save();
    return res.json(new ApiResponse(200, null, 'Applied successfully'));
  } catch (error) { next(error); }
};

const updateApplicationStatus = async (req, res, next) => {
  try {
    const { studentId, status } = req.body;
    await Placement.updateOne(
      { _id: req.params.id, 'applications.student': studentId },
      { $set: { 'applications.$.status': status } }
    );
    return res.json(new ApiResponse(200, null, 'Application status updated'));
  } catch (error) { next(error); }
};

module.exports = { getCompanies, createCompany, getPlacements, getPlacement, createPlacement, applyForPlacement, updateApplicationStatus };
