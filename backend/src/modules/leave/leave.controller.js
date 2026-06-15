const LeaveRequest = require('./leaveRequest.model');
const ApiError = require('../../utils/apiError');
const ApiResponse = require('../../utils/apiResponse');

const getLeaveRequests = async (req, res, next) => {
  try {
    const { status, requesterType, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (req.user.role.name !== 'Super Admin') filter.collegeId = req.user.collegeId;
    if (status) filter.status = status;
    
    const isAdmin = ['Super Admin', 'College Admin', 'Principal', 'HOD'].includes(req.user.role.name);
    const isFaculty = req.user.role.name === 'Faculty' || req.user.role.name === 'Class Coordinator';
    
    let mentoredStudentUserIds = [];
    
    if (isAdmin) {
      if (requesterType && requesterType !== 'Student') {
        filter.requesterType = requesterType;
      } else {
        filter.requesterType = { $ne: 'Student' };
      }
    } else if (isFaculty) {
      if (requesterType) filter.requesterType = requesterType;
      const Faculty = require('../faculty/faculty.model');
      const Student = require('../students/student.model');
      const Timetable = require('../timetables/timetable.model');
      
      const faculty = await Faculty.findOne({ user: req.user._id });
      let taughtStudentUserIds = [];
      if (faculty) {
        // Mentored students
        const mentoredStudents = await Student.find({ mentor: faculty._id }).select('user');
        mentoredStudentUserIds = mentoredStudents.map(s => s.user.toString());
        
        // Taught students (from Timetable)
        const timetables = await Timetable.find({ faculty: faculty._id, isActive: true });
        if (timetables.length > 0) {
          const classesTaught = timetables.map(t => ({ course: t.course, semester: t.semester, division: t.division }));
          const taughtStudents = await Student.find({ $or: classesTaught }).select('user');
          taughtStudentUserIds = taughtStudents.map(s => s.user.toString());
        }
      }
      filter.$or = [
        { requester: req.user._id },
        { requester: { $in: [...new Set([...mentoredStudentUserIds, ...taughtStudentUserIds])] }, requesterType: 'Student' }
      ];
    } else {
      if (requesterType) filter.requesterType = requesterType;
      filter.requester = req.user._id;
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [leavesRaw, total] = await Promise.all([
      LeaveRequest.find(filter).populate('requester', 'email').populate('approvedBy', 'email').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).lean(),
      LeaveRequest.countDocuments(filter)
    ]);

    const leaves = leavesRaw.map(leave => {
      leave.canApprove = false;
      if (isAdmin && leave.requesterType !== 'Student') {
        leave.canApprove = true;
      } else if (isFaculty && leave.requesterType === 'Student') {
        if (leave.requester && mentoredStudentUserIds.includes(leave.requester._id.toString())) {
          leave.canApprove = true;
        }
      }
      return leave;
    });

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
    
    const leave = await LeaveRequest.findById(req.params.id).populate('requester', 'email');
    if (!leave) throw new ApiError(404, 'Leave request not found');

    const isAdmin = ['Super Admin', 'College Admin', 'Principal', 'HOD'].includes(req.user.role.name);
    const isFaculty = req.user.role.name === 'Faculty' || req.user.role.name === 'Class Coordinator';
    
    if (leave.requesterType === 'Student') {
      if (!isFaculty) throw new ApiError(403, 'Only faculty mentors can approve student leaves');
      const Faculty = require('../faculty/faculty.model');
      const Student = require('../students/student.model');
      const faculty = await Faculty.findOne({ user: req.user._id });
      const student = await Student.findOne({ user: leave.requester._id });
      if (!student || !student.mentor || !student.mentor.equals(faculty._id)) {
        throw new ApiError(403, 'You can only approve leaves for students you mentor');
      }
    } else {
      if (!isAdmin) throw new ApiError(403, 'Only admins can approve faculty/staff leaves');
    }

    leave.status = status;
    leave.approvedBy = req.user._id;
    leave.approvedAt = new Date();
    leave.remarks = remarks;
    await leave.save();

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
