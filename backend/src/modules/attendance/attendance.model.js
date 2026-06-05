const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' },
  date: { type: Date, required: true, index: true },
  status: { type: String, enum: ['Present', 'Absent', 'Late', 'Excused'], required: true },
  markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lectureType: { type: String, enum: ['Theory', 'Practical', 'Tutorial'], default: 'Theory' },
  remarks: { type: String },
  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true }
}, { timestamps: true });

attendanceSchema.index({ student: 1, subject: 1, date: 1 }, { unique: true });
attendanceSchema.index({ faculty: 1, date: 1 });
attendanceSchema.index({ subject: 1, date: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema, 'student_attendances');
