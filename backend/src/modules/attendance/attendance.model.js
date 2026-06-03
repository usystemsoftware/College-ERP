const mongoose = require('mongoose');

<<<<<<< HEAD
const attendanceRecordSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Late'],
    required: true
  },
  remarks: {
    type: String
  }
});

const attendanceSchema = new mongoose.Schema({
  batchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
    required: true
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  facultyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  slotTime: {
    type: String // e.g. "09:00 AM - 10:00 AM"
  },
  records: [attendanceRecordSchema]
}, { timestamps: true });

// Ensure a faculty member can only mark attendance once per subject per batch per date/slot
attendanceSchema.index({ batchId: 1, subjectId: 1, date: 1, slotTime: 1 }, { unique: true });
=======
const attendanceSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true },
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
>>>>>>> 7b4a3a7751aa63252c46edeef69f5e1c88a642af

module.exports = mongoose.model('Attendance', attendanceSchema);
