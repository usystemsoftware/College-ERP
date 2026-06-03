const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  semester: { type: mongoose.Schema.Types.ObjectId, ref: 'Semester', required: true },
  academicYear: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
  feeType: {
    type: String,
    enum: ['Tuition', 'Hostel', 'Transport', 'Library', 'Laboratory', 'Exam', 'Development', 'Other'],
    required: true
  },
  totalAmount: { type: Number, required: true },
  paidAmount: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  scholarshipAmount: { type: Number, default: 0 },
  dueDate: { type: Date, required: true },
  status: { type: String, enum: ['Paid', 'Partial', 'Unpaid', 'Waived'], default: 'Unpaid' },
  lateFeePenalty: { type: Number, default: 0 },
  generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true }
}, { timestamps: true });

feeSchema.index({ student: 1, semester: 1, feeType: 1 });
feeSchema.index({ status: 1, dueDate: 1 });

module.exports = mongoose.model('Fee', feeSchema);
