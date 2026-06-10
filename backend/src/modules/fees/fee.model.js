const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  feeStructure: { type: mongoose.Schema.Types.ObjectId, ref: 'FeeStructure' }, // Optional for ad-hoc fees
  academicYear: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
  
  // Custom title if no structure is provided, else we can fall back to structure's name
  title: { type: String },

  installments: [{
    amount: { type: Number, required: true },
    dueDate: { type: Date, required: true },
    status: { type: String, enum: ['Paid', 'Partial', 'Unpaid', 'Waived'], default: 'Unpaid' },
    paidAmount: { type: Number, default: 0 },
  }],

  totalAmount: { type: Number, required: true },
  paidAmount: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  scholarshipAmount: { type: Number, default: 0 },
  discountRemarks: { type: String },
  
  status: { type: String, enum: ['Paid', 'Partial', 'Unpaid', 'Waived'], default: 'Unpaid' },
  lateFeePenalty: { type: Number, default: 0 },
  
  generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true }
}, { timestamps: true });

feeSchema.index({ student: 1, academicYear: 1 });
feeSchema.index({ status: 1 });
feeSchema.index({ collegeId: 1 });

module.exports = mongoose.model('Fee', feeSchema, 'student_fees_records');
