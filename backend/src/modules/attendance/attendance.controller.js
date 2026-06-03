const Attendance = require('./attendance.model');
<<<<<<< HEAD
const ApiError = require('../../utils/apiError');
const ApiResponse = require('../../utils/apiResponse');

// Mark attendance for a class
const markAttendance = async (req, res, next) => {
  try {
    const { batchId, subjectId, facultyId, date, slotTime, records } = req.body;

    let attendance = await Attendance.findOne({ batchId, subjectId, date, slotTime });

    if (attendance) {
      // Update existing record
      attendance.records = records;
      await attendance.save();
      return res.status(200).json(new ApiResponse(200, { attendance }, 'Attendance updated successfully'));
    }

    // Create new record
    attendance = await Attendance.create({
      batchId, subjectId, facultyId, date, slotTime, records
    });

    return res.status(201).json(new ApiResponse(201, { attendance }, 'Attendance marked successfully'));
  } catch (error) {
    if (error.code === 11000) {
      next(new ApiError(400, 'Attendance for this slot has already been marked.'));
    } else {
      next(error);
    }
  }
};

// Get attendance for a batch/subject
const getAttendance = async (req, res, next) => {
  try {
    const { batchId, subjectId, startDate, endDate } = req.query;
    let filter = {};

    if (batchId) filter.batchId = batchId;
    if (subjectId) filter.subjectId = subjectId;
    
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const attendance = await Attendance.find(filter)
      .populate('facultyId', 'fullName employeeId')
      .populate('subjectId', 'name code')
      .populate('records.studentId', 'fullName rollNumber enrollmentNumber')
      .sort({ date: -1 });

    return res.status(200).json(new ApiResponse(200, { attendance }, 'Attendance fetched successfully'));
  } catch (error) {
    next(error);
  }
};

// Get student specific attendance (For student portal)
const getStudentAttendance = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    
    // Find all attendance documents where this student's ID exists in the records array
    const attendanceRecords = await Attendance.find({ 'records.studentId': studentId })
      .populate('subjectId', 'name code')
      .populate('facultyId', 'fullName')
      .sort({ date: -1 });

    // Format the response to show only the relevant student's status
    const studentHistory = attendanceRecords.map(doc => {
      const studentRecord = doc.records.find(r => r.studentId.toString() === studentId);
      return {
        _id: doc._id,
        date: doc.date,
        slotTime: doc.slotTime,
        subject: doc.subjectId,
        faculty: doc.facultyId,
        status: studentRecord ? studentRecord.status : 'Unknown',
        remarks: studentRecord ? studentRecord.remarks : ''
      };
    });

    return res.status(200).json(new ApiResponse(200, { history: studentHistory }, 'Student attendance fetched successfully'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  markAttendance,
  getAttendance,
  getStudentAttendance
};
=======
const Student = require('../students/student.model');
const ApiError = require('../../utils/apiError');
const ApiResponse = require('../../utils/apiResponse');

// Mark attendance (bulk)
const markAttendance = async (req, res, next) => {
  try {
    const { subject, date, records, lectureType } = req.body;
    // records = [{ student: id, status: 'Present'/'Absent' }]
    if (!subject || !date || !records?.length) throw new ApiError(400, 'Subject, date and records required');

    const faculty = await require('../faculty/faculty.model').findOne({ user: req.user._id });
    if (!faculty && req.user.role.name === 'Faculty') throw new ApiError(403, 'Faculty profile not found');

    const attendanceDate = new Date(date);
    const ops = records.map(r => ({
      updateOne: {
        filter: { student: r.student, subject, date: attendanceDate },
        update: {
          $set: {
            student: r.student, subject, date: attendanceDate,
            status: r.status, markedBy: req.user._id,
            faculty: faculty?._id,
            lectureType: lectureType || 'Theory',
            collegeId: req.user.collegeId,
            remarks: r.remarks || ''
          }
        },
        upsert: true
      }
    }));

    await Attendance.bulkWrite(ops);
    return res.status(200).json(new ApiResponse(200, null, `Attendance marked for ${records.length} students`));
  } catch (error) { next(error); }
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
      const key = r.subject?._id?.toString();
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

module.exports = { markAttendance, getAttendanceBySubjectDate, getStudentAttendance, getAttendanceReport };
>>>>>>> 7b4a3a7751aa63252c46edeef69f5e1c88a642af
