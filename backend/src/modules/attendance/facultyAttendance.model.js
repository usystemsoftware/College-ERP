const mongoose = require('mongoose');

const facultyAttendanceSchema = new mongoose.Schema({
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true },
  timetableId: { type: mongoose.Schema.Types.ObjectId, ref: 'Timetable', required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ['Present', 'Absent'], required: true },
  markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true },
  remarks: { type: String }
}, { timestamps: true });

// Ensure unique record per faculty, timetable slot, and date
facultyAttendanceSchema.index({ faculty: 1, timetableId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('FacultyAttendance', facultyAttendanceSchema, 'faculty_attendances');
