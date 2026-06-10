const Attendance = require('./attendance.model');
const FacultyAttendance = require('./facultyAttendance.model');
const Student = require('../students/student.model');
const Faculty = require('../faculty/faculty.model');
const Timetable = require('../timetables/timetable.model');
const ApiError = require('../../utils/apiError');
const ApiResponse = require('../../utils/apiResponse');
const jwt = require('jsonwebtoken');

// Mark attendance (bulk) — Faculty/Admin
const markAttendance = async (req, res, next) => {
  try {
    const { subject, date, records, lectureType } = req.body;
    if (!subject || !date || !records?.length) throw new ApiError(400, 'Subject, date and records required');

    const faculty = await require('../faculty/faculty.model').findOne({ user: req.user._id });
    if (!faculty && req.user.role.name === 'Faculty') throw new ApiError(403, 'Faculty profile not found');

    const attendanceDate = new Date(date);
    const ops = records.map(r => {
      const updateDoc = {
        student: r.student, subject, date: attendanceDate,
        status: r.status, markedBy: req.user._id,
        lectureType: lectureType || 'Theory',
        remarks: r.remarks || '',
        selfMarked: false
      };
      if (faculty && faculty._id) updateDoc.faculty = faculty._id;
      if (req.user.collegeId) updateDoc.collegeId = req.user.collegeId;

      return {
        updateOne: {
          filter: { student: r.student, subject, date: attendanceDate },
          update: { $set: updateDoc },
          upsert: true
        }
      };
    });

    await Attendance.bulkWrite(ops);

    const Notification = require('../notifications/notification.model');
    const subjectDoc = await require('../subjects/subject.model').findById(subject);
    const subjectName = subjectDoc ? subjectDoc.name : 'Class';
    const dateFormatted = new Date(date).toLocaleDateString();

    const notification = await Notification.create({
      recipient: req.user._id,
      title: 'Attendance Marked',
      message: `Attendance for ${subjectName} on ${dateFormatted} has been successfully recorded for ${records.length} students.`,
      type: 'System',
      category: 'Academic',
      collegeId: req.user.collegeId
    });

    const io = req.app.get('io');
    if (io) {
      io.to(req.user._id.toString()).emit('notification', notification);
    }

    return res.status(200).json(new ApiResponse(200, null, `Attendance marked for ${records.length} students`));
  } catch (error) {
    console.error('ATTENDANCE ERROR:', error);
    return res.status(500).json({ success: false, message: error.message, stack: error.stack });
  }
};

// GET attendance by subject + date
const getAttendanceBySubjectDate = async (req, res, next) => {
  try {
    const { subject, date } = req.query;
    if (!subject || !date) throw new ApiError(400, 'Subject and date are required');
    const records = await Attendance.find({ subject, date: new Date(date) })
      .populate('student', 'rollNumber personalDetails.fullName')
      .sort({ 'student.rollNumber': 1 });
    return res.json(new ApiResponse(200, records, 'Attendance fetched'));
  } catch (error) { next(error); }
};

// GET student attendance summary (%)
const getStudentAttendance = async (req, res, next) => {
  try {
    const { studentId, subject } = req.query;
    const targetStudent = studentId || (await require('../students/student.model').findOne({ user: req.user._id }))?._id;
    if (!targetStudent) throw new ApiError(404, 'Student not found');

    const filter = { student: targetStudent };
    if (subject) filter.subject = subject;

    const records = await Attendance.find(filter).populate('subject', 'name code');

    // Group by subject
    const summary = {};
    records.forEach(r => {
      const key = r.subject?._id?.toString() || 'self';
      if (!summary[key]) summary[key] = { subject: r.subject, total: 0, present: 0, absent: 0, late: 0 };
      summary[key].total++;
      if (r.status === 'Present') summary[key].present++;
      else if (r.status === 'Absent') summary[key].absent++;
      else if (r.status === 'Late') { summary[key].late++; summary[key].present++; }
    });

    const result = Object.values(summary).map(s => ({
      ...s, percentage: s.total > 0 ? ((s.present / s.total) * 100).toFixed(2) : '0.00'
    }));

    return res.json(new ApiResponse(200, result, 'Attendance summary fetched'));
  } catch (error) { next(error); }
};

// GET attendance report for admin
const getAttendanceReport = async (req, res, next) => {
  try {
    const { department, subject, startDate, endDate } = req.query;
    const filter = { collegeId: req.user.collegeId };
    if (subject) filter.subject = subject;
    if (startDate && endDate) filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };

    const records = await Attendance.find(filter)
      .populate('student', 'rollNumber personalDetails.fullName')
      .populate('subject', 'name code')
      .sort({ date: -1 })
      .limit(500);

    return res.json(new ApiResponse(200, records, 'Attendance report fetched'));
  } catch (error) { next(error); }
};

// ─────────────────────────────────────────────────
// STUDENT SELF ATTENDANCE
// ─────────────────────────────────────────────────

// POST /attendance/student-checkin
const studentCheckIn = async (req, res, next) => {
  try {
    const { location, selfieBase64 } = req.body;

    // Find the Student profile for this user
    const student = await Student.findOne({ user: req.user._id })
      .populate('department', 'name')
      .populate('course', 'name');
    if (!student) throw new ApiError(404, 'Student profile not found');

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Check if already checked in today
    const existing = await Attendance.findOne({
      student: student._id,
      selfMarked: true,
      date: { $gte: today, $lt: tomorrow }
    });

    if (existing && existing.checkInTime) {
      return res.status(400).json(new ApiResponse(400, null, 'Already checked in today'));
    }

    const now = new Date();

    let record;
    if (existing) {
      existing.checkInTime = now;
      existing.status = 'Present';
      if (location) existing.location = location;
      if (selfieBase64) existing.selfieBase64 = selfieBase64;
      await existing.save();
      record = existing;
    } else {
      record = await Attendance.create({
        student: student._id,
        date: today,
        status: 'Present',
        markedBy: req.user._id,
        collegeId: req.user.collegeId,
        selfMarked: true,
        checkInTime: now,
        location: location || {},
        selfieBase64: selfieBase64 || ''
      });
    }

    // Emit real-time event to admin/faculty rooms
    const io = req.app.get('io');
    if (io) {
      const payload = {
        type: 'student_checkin',
        student: {
          id: student._id,
          name: student.personalDetails?.fullName,
          rollNumber: student.rollNumber,
          department: student.department?.name,
          course: student.course?.name
        },
        checkInTime: now,
        location: location || {},
        timestamp: new Date()
      };
      // Broadcast to all connected admins/faculty
      io.emit('student_checkin', payload);

      // Also create a notification for admins
      try {
        const Notification = require('../notifications/notification.model');
        const Role = require('../roles/role.model');
        const User = require('../users/user.model');
        
        const targetRoles = await Role.find({ name: { $in: ['College Admin', 'Super Admin'] } });
        const adminUsers = await User.find({ role: { $in: targetRoles.map(r => r._id) } });

        const notifOps = adminUsers.map(admin => ({
          insertOne: {
            document: {
              recipient: admin._id,
              title: 'Student Check-In',
              message: `${student.personalDetails?.fullName || 'A student'} (${student.rollNumber}) has checked in at ${now.toLocaleTimeString()}`,
              type: 'System',
              category: 'Academic',
              collegeId: req.user.collegeId
            }
          }
        }));

        if (notifOps.length > 0) {
          await Notification.bulkWrite(notifOps);
          adminUsers.forEach(admin => {
            io.to(admin._id.toString()).emit('notification', {
              title: 'Student Check-In',
              message: `${student.personalDetails?.fullName || 'A student'} (${student.rollNumber}) has checked in at ${now.toLocaleTimeString()}`
            });
          });
        }
      } catch (notifErr) {
        console.error('Notification error:', notifErr.message);
      }
    }

    return res.status(200).json(new ApiResponse(200, {
      checkInTime: now,
      status: 'Present',
      recordId: record._id
    }, 'Check-in successful'));
  } catch (error) {
    console.error('STUDENT CHECKIN ERROR:', error);
    next(error);
  }
};

// POST /attendance/student-checkout
const studentCheckOut = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) throw new ApiError(404, 'Student profile not found');

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const record = await Attendance.findOne({
      student: student._id,
      selfMarked: true,
      date: { $gte: today, $lt: tomorrow }
    });

    if (!record || !record.checkInTime) {
      return res.status(400).json(new ApiResponse(400, null, 'No check-in found for today'));
    }
    if (record.checkOutTime) {
      return res.status(400).json(new ApiResponse(400, null, 'Already checked out today'));
    }

    const now = new Date();
    record.checkOutTime = now;
    await record.save();

    // Emit checkout event
    const io = req.app.get('io');
    if (io) {
      io.emit('student_checkout', {
        type: 'student_checkout',
        student: {
          id: student._id,
          name: student.personalDetails?.fullName,
          rollNumber: student.rollNumber
        },
        checkOutTime: now,
        timestamp: new Date()
      });
    }

    return res.status(200).json(new ApiResponse(200, {
      checkOutTime: now,
      recordId: record._id
    }, 'Check-out successful'));
  } catch (error) {
    console.error('STUDENT CHECKOUT ERROR:', error);
    next(error);
  }
};

// GET /attendance/student-today — Get today's self-attendance status
const getStudentTodayAttendance = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) throw new ApiError(404, 'Student profile not found');

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const record = await Attendance.findOne({
      student: student._id,
      selfMarked: true,
      date: { $gte: today, $lt: tomorrow }
    });

    return res.json(new ApiResponse(200, record || null, 'Today attendance fetched'));
  } catch (error) { next(error); }
};

// GET /attendance/admin-live-feed — Admin live self-check-in feed (today)
const getAdminLiveFeed = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const records = await Attendance.find({
      collegeId: req.user.collegeId,
      selfMarked: true,
      date: { $gte: today, $lt: tomorrow }
    })
      .populate('student', 'rollNumber personalDetails department course')
      .populate({ path: 'student', populate: [{ path: 'department', select: 'name' }, { path: 'course', select: 'name' }] })
      .sort({ checkInTime: -1 })
      .limit(50);

    return res.json(new ApiResponse(200, records, 'Live feed fetched'));
  } catch (error) { next(error); }
};

const getAttendanceDashboardStats = async (req, res, next) => {
  try {
    const isStudent = req.user.role.name === 'Student';

    if (isStudent) {
      let studentId = req.user._id;
      try {
        const student = await Student.findOne({ user: req.user._id });
        if (student) studentId = student._id;
      } catch (e) { }

      const records = await Attendance.find({ student: studentId });
      let present = 0;
      let absent = 0;
      let late = 0;

      records.forEach(r => {
        if (r.status === 'Present') present++;
        else if (r.status === 'Absent') absent++;
        else if (r.status === 'Late') { late++; present++; }
      });

      const total = present + absent;
      const overallAttendance = total > 0 ? Math.round((present / total) * 100) : 0;

      return res.json(new ApiResponse(200, {
        overallAttendance,
        classesAttended: present,
        classesMissed: absent
      }, 'Student attendance dashboard stats fetched'));
    } else {
      // Faculty view: return some students for the initial view
      const studentsList = await Student.find({ collegeId: req.user.collegeId }).limit(10).lean();

      const formattedStudents = studentsList.map(s => ({
        id: s._id,
        name: s.personalDetails?.fullName || 'Unknown Student',
        roll: s.rollNumber || 'N/A',
        status: 'Present' // Default selection
      }));

      return res.json(new ApiResponse(200, {
        students: formattedStudents
      }, 'Faculty attendance dashboard stats fetched'));
    }
  } catch (error) { next(error); }
};

// ─────────────────────────────────────────────────
// FACULTY LECTURE ATTENDANCE
// ─────────────────────────────────────────────────

const markFacultyLectureAttendance = async (req, res, next) => {
  try {
    let { facultyId, timetableId, date, status, remarks } = req.body;

    // Auto-resolve facultyId for logged-in faculty
    if (!facultyId) {
      const faculty = await Faculty.findOne({ user: req.user._id });
      if (faculty) facultyId = faculty._id;
    }

    if (!facultyId || !timetableId || !date || !status) {
      throw new ApiError(400, 'facultyId, timetableId, date, and status are required');
    }

    const [year, month, day] = date.split('-');
    const attendanceDate = new Date(year, month - 1, day);

    let record = await FacultyAttendance.findOne({ faculty: facultyId, timetableId, date: attendanceDate });
    if (record) {
      record.status = status;
      record.remarks = remarks || record.remarks;
      record.markedBy = req.user._id;
      await record.save();
    } else {
      record = await FacultyAttendance.create({
        faculty: facultyId,
        timetableId,
        date: attendanceDate,
        status,
        markedBy: req.user._id,
        collegeId: req.user.collegeId,
        remarks: remarks || ''
      });
    }

    return res.status(200).json(new ApiResponse(200, record, 'Faculty lecture attendance marked successfully'));
  } catch (error) {
    next(error);
  }
};

const getFacultyLecturesWithAttendance = async (req, res, next) => {
  try {
    const { facultyId, date } = req.query;
    if (!facultyId || !date) throw new ApiError(400, 'facultyId and date are required');

    const [year, month, day] = date.split('-');
    const queryDate = new Date(year, month - 1, day);

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = days[queryDate.getDay()];

    // 1. Get all timetable slots for this faculty on this day
    const timetables = await Timetable.find({
      faculty: facultyId,
      dayOfWeek: dayOfWeek,
      isActive: true
    }).populate('subject', 'name code').populate('course', 'name');

    // 2. Get attendance records for these slots on this date
    const attendanceRecords = await FacultyAttendance.find({
      faculty: facultyId,
      date: queryDate
    });

    const attendanceMap = {};
    attendanceRecords.forEach(record => {
      attendanceMap[record.timetableId.toString()] = record;
    });

    // 3. Combine them
    const result = timetables.map(t => {
      const att = attendanceMap[t._id.toString()];
      return {
        timetable: t,
        attendance: att ? { 
          status: att.status, 
          remarks: att.remarks,
          sessionStatus: att.sessionStatus,
          actualStartTime: att.actualStartTime,
          actualEndTime: att.actualEndTime,
          durationMinutes: att.durationMinutes
        } : null
      };
    });

    // Sort by startTime
    result.sort((a, b) => a.timetable.startTime.localeCompare(b.timetable.startTime));

    return res.status(200).json(new ApiResponse(200, result, 'Faculty lectures and attendance fetched'));
  } catch (error) {
    next(error);
  }
};

const getFacultyAttendanceSummary = async (req, res, next) => {
  try {
    const { facultyId } = req.query;
    if (!facultyId) throw new ApiError(400, 'facultyId is required');

    const records = await FacultyAttendance.find({ faculty: facultyId })
      .populate({ path: 'timetableId', populate: { path: 'subject', select: 'name code' } })
      .sort({ date: -1 });

    const summary = {
      totalLectures: records.length,
      present: 0,
      absent: 0,
      history: []
    };

    summary.history = records.map(r => {
      if (r.status === 'Present') summary.present++;
      else if (r.status === 'Absent') summary.absent++;
      return {
        date: r.date,
        status: r.status,
        subject: r.timetableId?.subject?.name || 'Unknown',
        time: r.timetableId ? `${r.timetableId.startTime} - ${r.timetableId.endTime}` : 'Unknown'
      };
    });

    return res.status(200).json(new ApiResponse(200, summary, 'Faculty attendance summary fetched'));
  } catch (error) {
    next(error);
  }
};

const startLectureSession = async (req, res, next) => {
  try {
    const { timetableId, date } = req.body;
    
    const faculty = await Faculty.findOne({ user: req.user._id });
    if (!faculty) throw new ApiError(403, 'Faculty profile not found');
    
    const timetable = await Timetable.findById(timetableId);
    if (!timetable) throw new ApiError(404, 'Timetable slot not found');

    const [year, month, day] = date.split('-');
    const attendanceDate = new Date(year, month - 1, day);

    let record = await FacultyAttendance.findOne({ faculty: faculty._id, timetableId, date: attendanceDate });
    
    const now = new Date();
    
    // Check if late (5 minutes grace period)
    const [hours, minutes] = timetable.startTime.split(':');
    const scheduledStartTime = new Date(year, month - 1, day, hours, minutes);
    const diffMinutes = (now - scheduledStartTime) / (1000 * 60);
    const lateFlag = diffMinutes > 5;

    if (record) {
      if (record.sessionStatus !== 'Pending') {
        throw new ApiError(400, `Lecture session is already ${record.sessionStatus}`);
      }
      record.sessionStatus = 'In Progress';
      record.actualStartTime = now;
      record.lateFlag = lateFlag;
      record.markedBy = req.user._id;
      await record.save();
    } else {
      record = await FacultyAttendance.create({
        faculty: faculty._id,
        timetableId,
        date: attendanceDate,
        status: 'Pending',
        markedBy: req.user._id,
        collegeId: req.user.collegeId,
        sessionStatus: 'In Progress',
        actualStartTime: now,
        lateFlag: lateFlag
      });
    }

    return res.status(200).json(new ApiResponse(200, record, 'Lecture session started successfully'));
  } catch (error) {
    next(error);
  }
};

const endLectureSession = async (req, res, next) => {
  try {
    const { timetableId, date } = req.body;

    const faculty = await Faculty.findOne({ user: req.user._id });
    if (!faculty) throw new ApiError(403, 'Faculty profile not found');

    const timetable = await Timetable.findById(timetableId);
    if (!timetable) throw new ApiError(404, 'Timetable slot not found');

    const [year, month, day] = date.split('-');
    const attendanceDate = new Date(year, month - 1, day);

    let record = await FacultyAttendance.findOne({ faculty: faculty._id, timetableId, date: attendanceDate });

    if (!record || record.sessionStatus !== 'In Progress') {
      throw new ApiError(400, 'Lecture session is not in progress');
    }

    const now = new Date();
    record.actualEndTime = now;
    
    // Calculate duration
    const durationMinutes = Math.round((now - record.actualStartTime) / (1000 * 60));
    record.durationMinutes = durationMinutes;

    // Check if short (more than 10 minutes early)
    const [startH, startM] = timetable.startTime.split(':');
    const [endH, endM] = timetable.endTime.split(':');
    const scheduledStartTime = new Date(year, month - 1, day, startH, startM);
    const scheduledEndTime = new Date(year, month - 1, day, endH, endM);
    const scheduledDuration = Math.round((scheduledEndTime - scheduledStartTime) / (1000 * 60));
    
    const shortFlag = durationMinutes < (scheduledDuration - 10);
    record.shortFlag = shortFlag;

    record.sessionStatus = 'Completed';
    record.status = 'Present'; // Automatically mark present
    await record.save();

    // Alert HOD/Admin if there's an anomaly
    if (record.lateFlag || record.shortFlag) {
      const User = require('../users/user.model');
      const Notification = require('../notifications/notification.model');
      
      const Role = require('../roles/role.model');
      const targetRoles = await Role.find({ name: { $in: ['HOD', 'College Admin', 'Super Admin'] } });
      const targetRoleIds = targetRoles.map(r => r._id);

      const query = { 
        role: { $in: targetRoleIds },
        $or: [
          { collegeId: req.user.collegeId },
          { collegeId: { $exists: false } },
          { collegeId: null }
        ]
      };

      const adminsAndHods = await User.find(query).populate('role', 'name');

      // For HODs, only alert if they belong to the same department
      const relevantAdminsAndHods = [];
      for (const admin of adminsAndHods) {
        if (admin.role?.name === 'College Admin' || admin.role?.name === 'Super Admin') {
          relevantAdminsAndHods.push(admin);
        } else if (admin.role?.name === 'HOD') {
          const hodProfile = await Faculty.findOne({ user: admin._id });
          if (hodProfile && hodProfile.department && faculty && faculty.department) {
            if (hodProfile.department.toString() === faculty.department.toString()) {
              relevantAdminsAndHods.push(admin);
            }
          } else {
            // Fallback for mock data missing departments
            relevantAdminsAndHods.push(admin);
          }
        }
      }
      
      let issueMessage = '';
      if (record.lateFlag && record.shortFlag) issueMessage = 'started late and finished early';
      else if (record.lateFlag) issueMessage = 'started late';
      else issueMessage = 'finished early';

      const subject = await require('../subjects/subject.model').findById(timetable.subject);
      
      const notifOps = relevantAdminsAndHods.map(admin => ({
        insertOne: {
          document: {
            recipient: admin._id,
            title: 'Lecture Anomaly Detected',
            message: `Prof. ${faculty.personalDetails?.fullName || faculty.fullName || ''} ${issueMessage} for ${subject?.name || 'Class'} on ${attendanceDate.toLocaleDateString()}. Duration: ${durationMinutes} mins.`,
            type: 'Alert',
            category: 'Academic',
            collegeId: req.user.collegeId
          }
        }
      }));
      
      if (notifOps.length > 0) {
        await Notification.bulkWrite(notifOps);
        const io = req.app.get('io');
        if (io) {
          relevantAdminsAndHods.forEach(admin => {
            io.to(admin._id.toString()).emit('notification_alert', { title: 'Lecture Anomaly', timestamp: new Date() });
          });
        }
      }
    }

    return res.status(200).json(new ApiResponse(200, record, 'Lecture session ended successfully'));
  } catch (error) {
    next(error);
  }
};

// --- QR FUNCTIONS ---
const generateQRToken = async (req, res, next) => {
  try {
    const { subject, date, lectureType } = req.body;
    if (!subject || !date) throw new ApiError(400, 'Subject and date are required');

    const payload = {
      subject,
      date,
      lectureType: lectureType || 'Theory',
      facultyId: req.user._id,
      collegeId: req.user.collegeId
    };

    const token = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: '10m' });
    
    // Push notification to students via Socket.IO AND save to DB
    try {
      const subjectDoc = await require('../subjects/subject.model').findById(subject);
      const subjectName = subjectDoc ? subjectDoc.name : 'Lecture';
      
      const expiresAt = new Date(Date.now() + 10 * 60000); // 10 minutes
      const Student = require('../students/student.model');
      const Notification = require('../notifications/notification.model');

      const students = await Student.find({ collegeId: req.user.collegeId }).select('_id user');

      const notifOps = students.map(student => ({
        insertOne: {
          document: {
            recipient: student.user,
            title: 'QR Attendance Available',
            message: `QR Attendance is now active for ${subjectName}`,
            type: 'System',
            category: 'Academic',
            metadata: {
              type: 'STUDENT_QR_ATTENDANCE',
              subjectName: subjectName,
              qrSessionId: token,
              expiresAt: expiresAt
            },
            collegeId: req.user.collegeId,
            createdAt: new Date(),
            isRead: false
          }
        }
      }));

      if (notifOps.length > 0) {
        await Notification.bulkWrite(notifOps);
      }

      const io = req.app.get('io');
      if (io) {
        const notificationPayload = {
          title: 'QR Attendance Available',
          message: `QR Attendance is now active for ${subjectName}`,
          metadata: {
            type: 'STUDENT_QR_ATTENDANCE',
            subjectName: subjectName,
            qrSessionId: token,
            expiresAt: expiresAt
          },
          createdAt: new Date(),
          isRead: false
        };
        // Broadcast to everyone
        io.emit('new_notification', notificationPayload);
      }
    } catch (err) {
      console.error('Failed to emit QR notification:', err);
    }
    
    return res.status(200).json(new ApiResponse(200, { token }, 'QR Token generated'));
  } catch (error) {
    next(error);
  }
};

const verifyQRToken = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) throw new ApiError(400, 'QR Token is required');

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    } catch (err) {
      throw new ApiError(400, 'Invalid or expired QR Token');
    }

    const { subject, date, lectureType, facultyId } = decoded;
    const subjectDoc = await require('../subjects/subject.model').findById(subject);
    
    const details = {
      subjectName: subjectDoc ? subjectDoc.name : 'Unknown Subject',
      date,
      lectureType
    };

    return res.status(200).json(new ApiResponse(200, details, 'QR Token verified'));
  } catch (error) {
    next(error);
  }
};

const markQRAttendance = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) throw new ApiError(400, 'QR Token is required');

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    } catch (err) {
      throw new ApiError(400, 'Invalid or expired QR Token');
    }

    const { subject, date, lectureType, facultyId } = decoded;
    
    const student = await Student.findOne({ user: req.user._id });
    if (!student) throw new ApiError(404, 'Student profile not found');

    const attendanceDate = new Date(date);

    // Check if already marked
    const existing = await Attendance.findOne({
      student: student._id,
      subject,
      date: attendanceDate
    });

    if (existing) {
      return res.status(400).json(new ApiResponse(400, null, 'Attendance already marked for this lecture'));
    }

    const record = await Attendance.create({
      student: student._id,
      subject,
      date: attendanceDate,
      status: 'Present',
      markedBy: facultyId,
      collegeId: req.user.collegeId,
      lectureType,
      selfMarked: false
    });

    return res.status(200).json(new ApiResponse(200, record, 'Attendance marked successfully via QR'));
  } catch (error) {
    next(error);
  }
};

const sendQRToFaculty = async (req, res, next) => { res.status(501).json({ message: 'Not implemented' }); };

const sendQRToStudents = async (req, res, next) => {
  try {
    const { qrSessionId, subjectId, facultyIds } = req.body;
    if (!qrSessionId || !subjectId || !facultyIds || !facultyIds.length) {
      throw new ApiError(400, 'qrSessionId, subjectId, and facultyIds are required');
    }

    const subjectDoc = await require('../subjects/subject.model').findById(subjectId);
    const subjectName = subjectDoc ? subjectDoc.name : 'Lecture';

    // Try to find matching timetables
    const timetables = await Timetable.find({
      faculty: { $in: facultyIds },
      subject: subjectId,
      isActive: true
    });

    let studentMatch = {};
    if (timetables.length > 0) {
      const orConditions = timetables.map(t => ({
        department: t.department,
        course: t.course,
        semester: t.semester,
        division: t.division
      }));
      studentMatch = { $or: orConditions };
    } else {
      // Fallback: If no timetables found, find departments of these faculties
      const faculties = await require('../faculty/faculty.model').find({ _id: { $in: facultyIds } });
      const departmentIds = faculties.map(f => f.department).filter(Boolean);
      if (departmentIds.length > 0) {
        studentMatch = { department: { $in: departmentIds } };
      } else {
        studentMatch = { collegeId: req.user.collegeId }; // fallback to college students
      }
    }

    const students = await Student.find(studentMatch).select('_id user');

    if (students.length === 0) {
      return res.status(200).json(new ApiResponse(200, { sentTo: 0 }, 'No students found to push QR'));
    }

    const Notification = require('../notifications/notification.model');
    const expiresAt = new Date(Date.now() + 10 * 60000); // 10 minutes

    const notifOps = students.map(student => ({
      insertOne: {
        document: {
          recipient: student.user,
          title: 'Lecture QR Attendance',
          message: `QR Attendance is active for ${subjectName}. Please mark your attendance.`,
          type: 'Academic',
          category: 'Attendance',
          metadata: {
            type: 'STUDENT_QR_ATTENDANCE',
            subjectName: subjectName,
            qrSessionId: qrSessionId,
            expiresAt: expiresAt
          },
          collegeId: req.user.collegeId
        }
      }
    }));

    await Notification.bulkWrite(notifOps);

    // Also emit socket events to specific students
    const io = req.app.get('io');
    if (io) {
      students.forEach(student => {
        const notificationPayload = {
          title: 'Lecture QR Attendance',
          message: `QR Attendance is active for ${subjectName}. Please mark your attendance.`,
          metadata: {
            type: 'STUDENT_QR_ATTENDANCE',
            subjectName: subjectName,
            qrSessionId: qrSessionId,
            expiresAt: expiresAt
          },
          createdAt: new Date(),
          isRead: false
        };
        io.to(student.user.toString()).emit('new_notification', notificationPayload);
      });
    }

    return res.status(200).json(new ApiResponse(200, { sentTo: students.length }, `QR pushed successfully to ${students.length} students`));
  } catch (error) {
    next(error);
  }
};

const getDepartmentLectureAnomalies = async (req, res, next) => {
  try {
    const hod = await Faculty.findOne({ user: req.user._id });
    if (!hod) throw new ApiError(403, 'HOD profile not found');

    const departmentFaculties = await Faculty.find({ department: hod.department }).select('_id fullName');
    const facultyIds = departmentFaculties.map(f => f._id);

    const anomalies = await FacultyAttendance.find({
      faculty: { $in: facultyIds },
      $or: [{ lateFlag: true }, { shortFlag: true }]
    })
    .populate('faculty', 'fullName')
    .populate({ path: 'timetableId', populate: { path: 'subject', select: 'name code' } })
    .sort({ date: -1 })
    .limit(20);

    const formattedAnomalies = anomalies.map(a => {
      let issue = '';
      if (a.lateFlag && a.shortFlag) issue = 'Started late & Finished early';
      else if (a.lateFlag) issue = 'Started late';
      else if (a.shortFlag) issue = 'Finished early';

      return {
        _id: a._id,
        facultyName: a.faculty?.fullName || 'Unknown',
        subject: a.timetableId?.subject?.name || 'Unknown',
        date: a.date,
        duration: a.durationMinutes,
        issue
      };
    });

    return res.status(200).json(new ApiResponse(200, formattedAnomalies, 'Department anomalies fetched successfully'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  markAttendance,
  getAttendanceBySubjectDate,
  getStudentAttendance,
  getAttendanceReport,
  studentCheckIn,
  studentCheckOut,
  getStudentTodayAttendance,
  getAdminLiveFeed,
  getAttendanceDashboardStats,
  generateQRToken,
  verifyQRToken,
  markQRAttendance,
  sendQRToFaculty,
  sendQRToStudents,
  markFacultyLectureAttendance,
  getFacultyLecturesWithAttendance,
  getFacultyAttendanceSummary,
  startLectureSession,
  endLectureSession,
  getDepartmentLectureAnomalies
};
