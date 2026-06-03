const GatePass = require('./gatepass.model');
const ApiError = require('../../utils/apiError');
const ApiResponse = require('../../utils/apiResponse');

const getGatePasses = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = { collegeId: req.user.collegeId };
    if (status) filter.status = status;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [passes, total] = await Promise.all([
      GatePass.find(filter).populate('host', 'email').populate('approvedBy', 'email').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      GatePass.countDocuments(filter)
    ]);
    return res.json(new ApiResponse(200, { passes, pagination: { total, pages: Math.ceil(total / parseInt(limit)) } }, 'Gate passes fetched'));
  } catch (error) { next(error); }
};

const createGatePass = async (req, res, next) => {
  try {
    const pass = await GatePass.create({ ...req.body, host: req.body.host || req.user._id, collegeId: req.user.collegeId });
    return res.status(201).json(new ApiResponse(201, pass, 'Gate pass created'));
  } catch (error) { next(error); }
};

const approveGatePass = async (req, res, next) => {
  try {
    const { action } = req.body; // 'Approved' or 'Rejected'
    const pass = await GatePass.findByIdAndUpdate(req.params.id, {
      status: action, approvedBy: req.user._id, approvedAt: new Date()
    }, { new: true });
    if (!pass) throw new ApiError(404, 'Gate pass not found');
    return res.json(new ApiResponse(200, pass, `Gate pass ${action}`));
  } catch (error) { next(error); }
};

const checkIn = async (req, res, next) => {
  try {
    const pass = await GatePass.findByIdAndUpdate(req.params.id, { status: 'CheckedIn', entryTime: new Date() }, { new: true });
    if (!pass) throw new ApiError(404, 'Gate pass not found');
    return res.json(new ApiResponse(200, pass, 'Checked in'));
  } catch (error) { next(error); }
};

const checkOut = async (req, res, next) => {
  try {
    const pass = await GatePass.findByIdAndUpdate(req.params.id, { status: 'CheckedOut', exitTime: new Date() }, { new: true });
    if (!pass) throw new ApiError(404, 'Gate pass not found');
    return res.json(new ApiResponse(200, pass, 'Checked out'));
  } catch (error) { next(error); }
};

module.exports = { getGatePasses, createGatePass, approveGatePass, checkIn, checkOut };
