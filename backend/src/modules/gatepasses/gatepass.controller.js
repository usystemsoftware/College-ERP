const GatePass = require('./gatepass.model');
const Student = require('../students/student.model');
const Department = require('../departments/department.model');
const Faculty = require('../faculty/faculty.model');
const ApiError = require('../../utils/apiError');
const ApiResponse = require('../../utils/apiResponse');
const { emitNotification } = require('../../services/notification.service');

const populateOptions = [
  { path: 'host', select: 'email' },
  { path: 'student', select: 'rollNumber personalDetails.fullName', populate: { path: 'department', select: 'name code' } },
  { path: 'department', select: 'name code' },
  { path: 'assignedTo', select: 'email' },
  { path: 'approvedBy', select: 'email' }
];

const getHodUserForDepartment = async (departmentId) => {
  const department = await Department.findById(departmentId).populate('hod');
  if (!department?.hod) return null;
  const hodFaculty = await Faculty.findById(department.hod);
  return hodFaculty?.user || null;
};

const getGatePasses = async (req, res, next) => {
  try {
    const { status, requestType, page = 1, limit = 20 } = req.query;
    const filter = {};
    const role = req.user.role.name;

    if (role !== 'Super Admin') filter.collegeId = req.user.collegeId;
    if (status) filter.status = status;
    if (requestType) filter.requestType = requestType;

    if (role === 'Student') {
      const student = await Student.findOne({ user: req.user._id });
      if (!student) throw new ApiError(404, 'Student profile not found');
      filter.student = student._id;
    } else if (role === 'HOD') {
      filter.assignedTo = req.user._id;
    } else if (!['Security Officer', 'College Admin', 'Principal', 'Super Admin'].includes(role)) {
      filter.host = req.user._id;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [passes, total] = await Promise.all([
      GatePass.find(filter).populate(populateOptions).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      GatePass.countDocuments(filter)
    ]);
    return res.json(new ApiResponse(200, { passes, pagination: { total, pages: Math.ceil(total / parseInt(limit)) } }, 'Gate passes fetched'));
  } catch (error) { next(error); }
};

const createGatePass = async (req, res, next) => {
  try {
    const role = req.user.role.name;

    if (role === 'Student') {
      const { purpose, outDateTime, expectedReturnDateTime, vehicleNumber } = req.body;
      if (!purpose || !outDateTime) throw new ApiError(400, 'Purpose and out date/time are required');

      const student = await Student.findOne({ user: req.user._id });
      if (!student) throw new ApiError(404, 'Student profile not found');

      const assignedTo = await getHodUserForDepartment(student.department);
      if (!assignedTo) throw new ApiError(400, 'No HOD assigned to your department. Contact administration.');

      const pass = await GatePass.create({
        requestType: 'Student',
        student: student._id,
        host: req.user._id,
        department: student.department,
        assignedTo,
        visitorName: student.personalDetails?.fullName || req.user.email,
        visitorPhone: student.personalDetails?.phone || 'N/A',
        purpose,
        outDateTime,
        expectedReturnDateTime,
        vehicleNumber,
        collegeId: req.user.collegeId
      });

      const populated = await GatePass.findById(pass._id).populate(populateOptions);

      await emitNotification({
        title: 'New Gate Pass Request',
        message: `${student.personalDetails?.fullName || 'A student'} has requested a gate pass for approval.`,
        type: 'System',
        category: 'Alert',
        recipient: assignedTo,
        metadata: { gatePassId: pass._id, type: 'GATE_PASS_REQUEST' }
      });

      return res.status(201).json(new ApiResponse(201, populated, 'Gate pass request submitted to department HOD'));
    }

    const { visitorName, visitorPhone, purpose } = req.body;
    if (!visitorName || !visitorPhone || !purpose) {
      throw new ApiError(400, 'Visitor name, phone, and purpose are required');
    }

    const pass = await GatePass.create({
      ...req.body,
      requestType: 'Visitor',
      host: req.body.host || req.user._id,
      collegeId: req.user.collegeId
    });

    const populated = await GatePass.findById(pass._id).populate(populateOptions);
    return res.status(201).json(new ApiResponse(201, populated, 'Gate pass created'));
  } catch (error) { next(error); }
};

const approveGatePass = async (req, res, next) => {
  try {
    const { action, remarks } = req.body;
    if (!['Approved', 'Rejected'].includes(action)) throw new ApiError(400, 'Action must be Approved or Rejected');

    const pass = await GatePass.findById(req.params.id);
    if (!pass) throw new ApiError(404, 'Gate pass not found');
    if (pass.status !== 'Pending') throw new ApiError(400, 'Only pending gate passes can be processed');

    const role = req.user.role.name;
    const isAdmin = ['Super Admin', 'College Admin', 'Principal'].includes(role);

    if (pass.requestType === 'Student') {
      if (!isAdmin) {
        if (role !== 'HOD') throw new ApiError(403, 'Only department HOD can approve student gate pass requests');
        if (pass.assignedTo?.toString() !== req.user._id.toString()) {
          throw new ApiError(403, 'This gate pass is not assigned to you');
        }
      }
    } else if (!isAdmin && role !== 'Security Officer') {
      throw new ApiError(403, 'Not authorized to approve visitor gate passes');
    }

    pass.status = action;
    pass.approvedBy = req.user._id;
    pass.approvedAt = new Date();
    if (remarks) pass.remarks = remarks;
    await pass.save();

    const populated = await GatePass.findById(pass._id).populate(populateOptions);
    const recipient = pass.host;

    if (recipient) {
      await emitNotification({
        title: 'Gate Pass Update',
        message: `Your gate pass request has been ${action.toLowerCase()}${remarks ? `: ${remarks}` : ''}`,
        type: 'System',
        category: 'Alert',
        recipient,
        metadata: { gatePassId: pass._id, type: 'GATE_PASS_UPDATE' }
      });
    }

    return res.json(new ApiResponse(200, populated, `Gate pass ${action.toLowerCase()}`));
  } catch (error) { next(error); }
};

const checkIn = async (req, res, next) => {
  try {
    const pass = await GatePass.findById(req.params.id);
    if (!pass) throw new ApiError(404, 'Gate pass not found');
    if (pass.status !== 'Approved') throw new ApiError(400, 'Only approved gate passes can be checked in');

    pass.status = 'CheckedIn';
    pass.entryTime = new Date();
    await pass.save();

    const populated = await GatePass.findById(pass._id).populate(populateOptions);
    return res.json(new ApiResponse(200, populated, 'Checked in'));
  } catch (error) { next(error); }
};

const checkOut = async (req, res, next) => {
  try {
    const pass = await GatePass.findById(req.params.id);
    if (!pass) throw new ApiError(404, 'Gate pass not found');
    if (pass.status !== 'CheckedIn') throw new ApiError(400, 'Only checked-in gate passes can be checked out');

    pass.status = 'CheckedOut';
    pass.exitTime = new Date();
    await pass.save();

    const populated = await GatePass.findById(pass._id).populate(populateOptions);
    return res.json(new ApiResponse(200, populated, 'Checked out'));
  } catch (error) { next(error); }
};

module.exports = { getGatePasses, createGatePass, approveGatePass, checkIn, checkOut };
