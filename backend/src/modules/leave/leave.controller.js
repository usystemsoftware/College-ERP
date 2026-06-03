const LeaveRequest = require('./leaveRequest.model');
const ApiError = require('../../utils/apiError');
const ApiResponse = require('../../utils/apiResponse');

const getLeaveRequests = async (req, res, next) => {
  try {
    const { status, requesterType, page = 1, limit = 20 } = req.query;
    const filter = { collegeId: req.user.collegeId };
    if (status) filter.status = status;
    if (requesterType) filter.requesterType = requesterType;
    const isAdmin = ['Super Admin', 'College Admin', 'Principal', 'HOD'].includes(req.user.role.name);
    if (!isAdmin) filter.requester = req.user._id;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [leaves, total] = await Promise.all([
      LeaveRequest.find(filter).populate('requester', 'email').populate('approvedBy', 'email').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      LeaveRequest.countDocuments(filter)
    ]);
    return res.json(new ApiResponse(200, { leaves, pagination: { total, pages: Math.ceil(total / parseInt(limit)) } }, 'Leave requests fetched'));
  } catch (error) { next(error); }
};

const createLeaveRequest = async (req, res, next) => {
  try {
    const leave = await LeaveRequest.create({ ...req.body, requester: req.user._id, collegeId: req.user.collegeId });
    return res.status(201).json(new ApiResponse(201, leave, 'Leave request submitted'));
  } catch (error) { next(error); }
};

const processLeaveRequest = async (req, res, next) => {
  try {
    const { status, remarks } = req.body;
    if (!['Approved', 'Rejected'].includes(status)) throw new ApiError(400, 'Status must be Approved or Rejected');
    const leave = await LeaveRequest.findByIdAndUpdate(req.params.id, {
      status, approvedBy: req.user._id, approvedAt: new Date(), remarks
    }, { new: true }).populate('requester', 'email');
    if (!leave) throw new ApiError(404, 'Leave request not found');
    return res.json(new ApiResponse(200, leave, `Leave request ${status}`));
  } catch (error) { next(error); }
};

const cancelLeaveRequest = async (req, res, next) => {
  try {
    const leave = await LeaveRequest.findOne({ _id: req.params.id, requester: req.user._id, status: 'Pending' });
    if (!leave) throw new ApiError(404, 'Leave request not found or cannot be cancelled');
    leave.status = 'Cancelled';
    await leave.save();
    return res.json(new ApiResponse(200, null, 'Leave request cancelled'));
  } catch (error) { next(error); }
};

module.exports = { getLeaveRequests, createLeaveRequest, processLeaveRequest, cancelLeaveRequest };
