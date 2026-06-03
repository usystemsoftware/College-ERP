const Attendance = require('./attendance.model');
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
