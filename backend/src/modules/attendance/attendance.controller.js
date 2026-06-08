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
        const notification = await Notification.create({
          recipient: req.user._id,
          title: 'Student Check-In',
          message: `${student.personalDetails?.fullName || 'A student'} (${student.rollNumber}) has checked in at ${now.toLocaleTimeString()}`,
          type: 'System',
          category: 'Academic',
          collegeId: req.user.collegeId
        });
        io.to(req.user._id.toString()).emit('notification', notification);
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
      } catch (e) {}

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

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

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

    const queryDate = new Date(date);
    queryDate.setHours(0, 0, 0, 0);

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
        attendance: att ? { status: att.status, remarks: att.remarks } : null
      };
    });

    // Sort by startTime
    result.sort((a, b) => a.timetable.startTime.localeCompare(b.timetable.startTime));

    return res.status(200).json(new ApiResponse(200, result, 'Faculty lectures and attendance fetched'));
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
  markFacultyLectureAttendance,
  getFacultyLecturesWithAttendance
};
