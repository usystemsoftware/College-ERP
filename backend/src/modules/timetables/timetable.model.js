const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
  semester: { type: mongoose.Schema.Types.ObjectId, ref: 'Semester', required: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  division: { type: String, required: true },
  dayOfWeek: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    required: true
  },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true },
  roomNumber: { type: String, required: true },
  isLab: { type: Boolean, default: false },
  startTime: { type: String, required: true }, // '09:00'
  endTime: { type: String, required: true },   // '10:00'
  academicYear: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

timetableSchema.index({ semester: 1, department: 1, division: 1, dayOfWeek: 1 });
timetableSchema.index({ faculty: 1, dayOfWeek: 1 });

module.exports = mongoose.model('Timetable', timetableSchema);
