const { Leave, Payroll } = require('./hr.model');
const ApiError = require('../../utils/apiError');
const ApiResponse = require('../../utils/apiResponse');
const Joi = require('joi');

// --- Leave Management ---
const applyLeave = async (req, res, next) => {
  try {
    const schema = Joi.object({
      facultyId: Joi.string().required(),
      leaveType: Joi.string().required(),
      startDate: Joi.date().iso().required(),
      endDate: Joi.date().iso().min(Joi.ref('startDate')).required(),
      reason: Joi.string().required()
    });

    const { error, value } = schema.validate(req.body);
    if (error) throw new ApiError(400, `Validation Error: ${error.details[0].message}`);

    const { facultyId, leaveType, startDate, endDate, reason } = value;
    const leave = await Leave.create({ facultyId, leaveType, startDate, endDate, reason, collegeId: req.user.collegeId });
    return res.status(201).json(new ApiResponse(201, { leave }, 'Leave applied successfully'));
  } catch (error) {
    next(error);
  }
};

const getLeaves = async (req, res, next) => {
  try {
    const { facultyId, status } = req.query;
    let filter = {};
    if (req.user.role.name !== 'Super Admin') filter.collegeId = req.user.collegeId;
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
    const schema = Joi.object({
      facultyId: Joi.string().required(),
      month: Joi.string().required(),
      basicSalary: Joi.number().min(0).required(),
      allowances: Joi.number().min(0).required(),
      deductions: Joi.number().min(0).required()
    });

    const { error, value } = schema.validate(req.body);
    if (error) throw new ApiError(400, `Validation Error: ${error.details[0].message}`);

    const { facultyId, month, basicSalary, allowances, deductions } = value;
    const netSalary = basicSalary + allowances - deductions;

    const payroll = await Payroll.create({
      facultyId, month, basicSalary, allowances, deductions, netSalary, collegeId: req.user.collegeId
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
    if (req.user.role.name !== 'Super Admin') filter.collegeId = req.user.collegeId;
    if (facultyId) filter.facultyId = facultyId;
    if (month) filter.month = month;

    const payrolls = await Payroll.find(filter).populate('facultyId', 'fullName department').sort({ createdAt: -1 });
    return res.status(200).json(new ApiResponse(200, { payrolls }, 'Payroll fetched successfully'));
  } catch (error) {
    next(error);
  }
};

const getHrDashboardStats = async (req, res, next) => {
  try {
    const isFaculty = req.user.role.name === 'Faculty';
    const filter = {};
    if (req.user.role.name !== 'Super Admin') filter.collegeId = req.user.collegeId;
    
    let stats = {};

    if (isFaculty) {
      const Faculty = require('../faculty/faculty.model');
      const faculty = await Faculty.findOne({ user: req.user._id });
      if (faculty) {
        const leaves = await Leave.find({ facultyId: faculty._id }).sort({ createdAt: -1 }).lean();
        const payroll = await Payroll.find({ facultyId: faculty._id }).sort({ createdAt: -1 }).lean();
        stats = {
          leaves: leaves.map(l => ({ id: l._id, faculty: faculty.fullName, type: l.leaveType, startDate: new Date(l.startDate).toLocaleDateString(), endDate: new Date(l.endDate).toLocaleDateString(), status: l.status })),
          payroll: payroll.map(p => ({ month: p.month, basic: p.basicSalary, allowances: p.allowances, deductions: p.deductions, net: p.netSalary, status: 'Paid' }))
        };
      } else {
        stats = { leaves: [], payroll: [] };
      }
    } else {
      const pendingLeaves = await Leave.find({ ...filter, status: 'Pending' }).populate('facultyId', 'fullName').sort({ createdAt: -1 }).lean();
      
      const d = new Date();
      const currentMonth = d.toLocaleString('default', { month: 'long' }) + ' ' + d.getFullYear();
      
      const currentMonthPayroll = await Payroll.aggregate([
        { $match: { ...filter, month: currentMonth } },
        { $group: { _id: null, total: { $sum: "$netSalary" } } }
      ]);
      const totalPayroll = currentMonthPayroll.length > 0 ? currentMonthPayroll[0].total : 0;

      const today = new Date();
      today.setHours(0,0,0,0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const staffOnLeaveToday = await Leave.countDocuments({
        ...filter,
        status: 'Approved',
        startDate: { $lte: tomorrow },
        endDate: { $gte: today }
      });

      stats = {
        leaves: pendingLeaves.map(l => ({ id: l._id, faculty: l.facultyId?.fullName, type: l.leaveType, startDate: new Date(l.startDate).toLocaleDateString(), endDate: new Date(l.endDate).toLocaleDateString(), status: l.status })),
        totalPayroll,
        staffOnLeaveToday,
        currentMonth
      };
    }

    return res.json(new ApiResponse(200, stats, 'HR Dashboard stats fetched'));
  } catch (error) { next(error); }
};

module.exports = {
  applyLeave,
  getLeaves,
  updateLeaveStatus,
  generatePayroll,
  getPayroll,
  getHrDashboardStats
};
