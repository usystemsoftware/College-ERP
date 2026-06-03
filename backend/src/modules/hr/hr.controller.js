const { Leave, Payroll } = require('./hr.model');
const ApiError = require('../../utils/apiError');
const ApiResponse = require('../../utils/apiResponse');

// --- Leave Management ---
const applyLeave = async (req, res, next) => {
  try {
    const { facultyId, leaveType, startDate, endDate, reason } = req.body;
    const leave = await Leave.create({ facultyId, leaveType, startDate, endDate, reason });
    return res.status(201).json(new ApiResponse(201, { leave }, 'Leave applied successfully'));
  } catch (error) {
    next(error);
  }
};

const getLeaves = async (req, res, next) => {
  try {
    const { facultyId, status } = req.query;
    let filter = {};
    if (facultyId) filter.facultyId = facultyId;
    if (status) filter.status = status;

    // Faculty only see their own
    if (req.user && req.user.role && req.user.role.name === 'Faculty') {
       // Logic to use req.user._id instead if strictly enforced
    }

    const leaves = await Leave.find(filter).populate('facultyId', 'fullName department').sort({ createdAt: -1 });
    return res.status(200).json(new ApiResponse(200, { leaves }, 'Leaves fetched successfully'));
  } catch (error) {
    next(error);
  }
};

const updateLeaveStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const leave = await Leave.findByIdAndUpdate(id, { status, approvedBy: req.user._id }, { new: true });
    if (!leave) throw new ApiError(404, 'Leave request not found');

    return res.status(200).json(new ApiResponse(200, { leave }, `Leave ${status.toLowerCase()} successfully`));
  } catch (error) {
    next(error);
  }
};

// --- Payroll Management ---
const generatePayroll = async (req, res, next) => {
  try {
    const { facultyId, month, basicSalary, allowances, deductions } = req.body;
    const netSalary = basicSalary + allowances - deductions;

    const payroll = await Payroll.create({
      facultyId, month, basicSalary, allowances, deductions, netSalary
    });

    return res.status(201).json(new ApiResponse(201, { payroll }, 'Payroll generated successfully'));
  } catch (error) {
    next(error);
  }
};

const getPayroll = async (req, res, next) => {
  try {
    const { facultyId, month } = req.query;
    let filter = {};
    if (facultyId) filter.facultyId = facultyId;
    if (month) filter.month = month;

    const payrolls = await Payroll.find(filter).populate('facultyId', 'fullName department').sort({ createdAt: -1 });
    return res.status(200).json(new ApiResponse(200, { payrolls }, 'Payroll fetched successfully'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  applyLeave,
  getLeaves,
  updateLeaveStatus,
  generatePayroll,
  getPayroll
};
