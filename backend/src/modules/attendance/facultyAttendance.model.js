const mongoose = require('mongoose');

const facultyAttendanceSchema = new mongoose.Schema({
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true },
  timetableId: { type: mongoose.Schema.Types.ObjectId, ref: 'Timetable', required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ['Present', 'Absent', 'Pending'], default: 'Pending' }, // Changed to allow pending
  markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional until completed
  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true },
  remarks: { type: String },
  // Session tracking fields
  sessionStatus: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' },
  actualStartTime: { type: Date },
  actualEndTime: { type: Date },
  durationMinutes: { type: Number, default: 0 },
  lateFlag: { type: Boolean, default: false },
  shortFlag: { type: Boolean, default: false }
}, { timestamps: true });

// Ensure unique record per faculty, timetable slot, and date
facultyAttendanceSchema.index({ faculty: 1, timetableId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('FacultyAttendance', facultyAttendanceSchema, 'faculty_attendances');
