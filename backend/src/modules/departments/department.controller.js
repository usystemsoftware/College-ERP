const Department = require('./department.model');
const Notification = require('../notifications/notification.model');
const ApiError = require('../../utils/apiError');
const ApiResponse = require('../../utils/apiResponse');
const pick = require('../../utils/pick');

// GET all departments
const getDepartments = async (req, res, next) => {
  try {
    const { collegeId } = req.query;
    const filter = {};
    if (req.user.role.name !== 'Super Admin') filter.collegeId = req.user.collegeId;
    if (collegeId) filter.collegeId = collegeId;

    const departments = await Department.find(filter)
      .populate('hod', 'fullName employeeId')
      .populate('collegeId', 'name code')
      .sort({ name: 1 });

    return res.json(new ApiResponse(200, departments, 'Departments fetched'));
  } catch (error) { next(error); }
};

// GET single department
const getDepartment = async (req, res, next) => {
  try {
    const dept = await Department.findById(req.params.id)
      .populate('hod', 'fullName employeeId')
      .populate('collegeId', 'name code');
    if (!dept) throw new ApiError(404, 'Department not found');
    return res.json(new ApiResponse(200, dept, 'Department fetched'));
  } catch (error) { next(error); }
};

// POST create department
const createDepartment = async (req, res, next) => {
  try {
    const { name, code, hod, collegeId } = req.body;
    if (!name || !code) throw new ApiError(400, 'Name and code are required');

    const exists = await Department.findOne({ code: code.toUpperCase() });
    if (exists) throw new ApiError(400, 'Department code already exists');

    const dept = await Department.create({
      name, code: code.toUpperCase(),
      hod: hod || null,
      collegeId: collegeId || req.user.collegeId
    });

    const notification = await Notification.create({
      recipient: req.user._id,
      title: 'Department Created',
      message: `Department ${name} (${code.toUpperCase()}) has been successfully created.`,
      type: 'System',
      category: 'General',
      collegeId: collegeId || req.user.collegeId
    });

    const io = req.app.get('io');
    if (io) {
      io.to(req.user._id.toString()).emit('notification', notification);
    }

    return res.status(201).json(new ApiResponse(201, dept, 'Department created'));
  } catch (error) { next(error); }
};

// PUT update department
const updateDepartment = async (req, res, next) => {
  try {
    const allowedUpdates = pick(req.body, ['name', 'code', 'hod']);
    const dept = await Department.findByIdAndUpdate(req.params.id, allowedUpdates, { new: true, runValidators: true });
    if (!dept) throw new ApiError(404, 'Department not found');
    return res.json(new ApiResponse(200, dept, 'Department updated'));
  } catch (error) { next(error); }
};

// DELETE department
const deleteDepartment = async (req, res, next) => {
  try {
    const dept = await Department.findByIdAndDelete(req.params.id);
    if (!dept) throw new ApiError(404, 'Department not found');
    return res.json(new ApiResponse(200, null, 'Department deleted'));
  } catch (error) { next(error); }
};

module.exports = { getDepartments, getDepartment, createDepartment, updateDepartment, deleteDepartment };
