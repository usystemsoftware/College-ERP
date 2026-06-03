const mongoose = require('mongoose');

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
  records: [attendanceRecordSchema],
  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true }
}, { timestamps: true });

// Ensure a faculty member can only mark attendance once per subject per batch per date/slot
attendanceSchema.index({ batchId: 1, subjectId: 1, date: 1, slotTime: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
