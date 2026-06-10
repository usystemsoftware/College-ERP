const mongoose = require('mongoose');

const feeStructureSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., 'B.Tech CS 2024-28 Full Fees'
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  batch: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
  academicYear: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
  heads: [{
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'FeeCategory', required: true },
    amount: { type: Number, required: true, min: 0 }
  }],
  totalAmount: { type: Number, required: true, min: 0 },
  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true }
}, { timestamps: true });

// Pre-validate hook to calculate total amount automatically based on heads
feeStructureSchema.pre('validate', function(next) {
  if (this.heads && this.heads.length > 0) {
    this.totalAmount = this.heads.reduce((sum, head) => sum + head.amount, 0);
  } else {
    this.totalAmount = 0;
  }
  next();
});

feeStructureSchema.index({ course: 1, batch: 1, academicYear: 1 });
feeStructureSchema.index({ collegeId: 1 });

module.exports = mongoose.model('FeeStructure', feeStructureSchema);
