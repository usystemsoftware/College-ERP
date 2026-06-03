const mongoose = require('mongoose');

const leaveRequestSchema = new mongoose.Schema({
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  requesterType: { type: String, enum: ['Student', 'Faculty', 'Staff'], required: true },
  leaveType: { type: String, enum: ['Casual', 'Medical', 'Earned', 'Duty', 'Maternity', 'Emergency'], required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  totalDays: { type: Number },
  reason: { type: String, required: true },
  documentUrl: { type: String }, // Medical cert / supporting doc
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Cancelled'], default: 'Pending' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: { type: Date },
  rejectionReason: { type: String },
  remarks: { type: String },
  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true }
}, { timestamps: true });

leaveRequestSchema.pre('save', function(next) {
  if (this.startDate && this.endDate) {
    const diffTime = Math.abs(this.endDate - this.startDate);
    this.totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }
  next();
});

leaveRequestSchema.index({ requester: 1, status: 1 });
leaveRequestSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('LeaveRequest', leaveRequestSchema);
