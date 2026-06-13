const Checkpoint = require('./checkpoint.model');
const Student = require('../students/student.model');
const ApiError = require('../../utils/apiError');
const ApiResponse = require('../../utils/apiResponse');
const jwt = require('jsonwebtoken');

// Generate a checkpoint QR code (Admin/Faculty)
const generateCheckpointQR = async (req, res, next) => {
  try {
    const { type } = req.body; // left_home, arrived_school, left_school
    if (!type || !['left_home', 'arrived_school', 'left_school'].includes(type)) {
      throw new ApiError(400, 'Valid checkpoint type required: left_home, arrived_school, left_school');
    }

    const payload = {
      type,
      generatedBy: req.user._id,
      collegeId: req.user.collegeId,
      date: new Date().toISOString().split('T')[0]
    };

    const token = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: '2h' });

    return res.status(200).json(new ApiResponse(200, {
      token,
      type,
      expiresIn: 7200 // 2 hours in seconds
    }, 'Checkpoint QR generated'));
  } catch (error) { next(error); }
};

// Student scans a checkpoint QR
const scanCheckpoint = async (req, res, next) => {
  try {
    const { token, location } = req.body;
    if (!token) throw new ApiError(400, 'Checkpoint QR token is required');

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    } catch (err) {
      throw new ApiError(400, 'Invalid or expired checkpoint QR code');
    }

    const student = await Student.findOne({ user: req.user._id });
    if (!student) throw new ApiError(404, 'Student profile not found');

    // Prevent duplicate scans within 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentScan = await Checkpoint.findOne({
      student: student._id,
      type: decoded.type,
      scannedAt: { $gte: fiveMinutesAgo }
    });

    if (recentScan) {
      return res.status(400).json(new ApiResponse(400, null, 'You already scanned this checkpoint recently'));
    }

    const checkpoint = await Checkpoint.create({
      student: student._id,
      user: req.user._id,
      type: decoded.type,
      location: location || {},
      scannedAt: new Date(),
      collegeId: req.user.collegeId
    });

    // Emit real-time event
    const io = req.app.get('io');
    if (io) {
      const typeLabels = {
        left_home: 'Left Home',
        arrived_school: 'Arrived at School',
        left_school: 'Left School'
      };

      io.emit('checkpoint_scan', {
        studentId: student._id,
        studentName: student.personalDetails?.fullName,
        rollNumber: student.rollNumber,
        type: decoded.type,
        typeLabel: typeLabels[decoded.type],
        scannedAt: checkpoint.scannedAt
      });

      // Notify parent
      try {
        const Parent = require('../parents/parent.model');
        const Notification = require('../notifications/notification.model');
        const parents = await Parent.find({ students: student._id });

        for (const parent of parents) {
          const notification = await Notification.create({
            recipient: parent.user,
            title: `Checkpoint: ${typeLabels[decoded.type]}`,
            message: `${student.personalDetails?.fullName || 'Your child'} has ${typeLabels[decoded.type].toLowerCase()} at ${checkpoint.scannedAt.toLocaleTimeString()}.`,
            type: 'System',
            category: 'Tracking',
            collegeId: req.user.collegeId
          });
          io.to(parent.user.toString()).emit('new_notification', notification);
        }
      } catch (notifErr) {
        console.error('Checkpoint notification error:', notifErr.message);
      }
    }

    return res.status(200).json(new ApiResponse(200, checkpoint, 'Checkpoint scanned successfully'));
  } catch (error) { next(error); }
};

// Get student's checkpoints for a date
const getStudentCheckpoints = async (req, res, next) => {
  try {
    const { studentId, date } = req.query;

    let targetStudentId = studentId;
    if (!targetStudentId) {
      const student = await Student.findOne({ user: req.user._id });
      if (student) targetStudentId = student._id;
    }

    if (!targetStudentId) throw new ApiError(400, 'Student ID is required');

    const queryDate = date ? new Date(date) : new Date();
    queryDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(queryDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const checkpoints = await Checkpoint.find({
      student: targetStudentId,
      scannedAt: { $gte: queryDate, $lt: nextDay }
    }).sort({ scannedAt: 1 });

    return res.json(new ApiResponse(200, checkpoints, 'Checkpoints fetched'));
  } catch (error) { next(error); }
};

// Admin dashboard — today's checkpoint summary
const getCheckpointDashboard = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const filter = { scannedAt: { $gte: today, $lt: tomorrow } };
    if (req.user.collegeId) filter.collegeId = req.user.collegeId;

    const checkpoints = await Checkpoint.find(filter)
      .populate('student', 'personalDetails.fullName rollNumber')
      .sort({ scannedAt: -1 })
      .limit(100);

    // Stats
    const stats = {
      totalScans: checkpoints.length,
      leftHome: checkpoints.filter(c => c.type === 'left_home').length,
      arrivedSchool: checkpoints.filter(c => c.type === 'arrived_school').length,
      leftSchool: checkpoints.filter(c => c.type === 'left_school').length,
    };

    // Unique students who have scanned today
    const uniqueStudents = new Set(checkpoints.map(c => c.student?._id?.toString()));
    stats.uniqueStudents = uniqueStudents.size;

    return res.json(new ApiResponse(200, { checkpoints, stats }, 'Checkpoint dashboard fetched'));
  } catch (error) { next(error); }
};

module.exports = { generateCheckpointQR, scanCheckpoint, getStudentCheckpoints, getCheckpointDashboard };
