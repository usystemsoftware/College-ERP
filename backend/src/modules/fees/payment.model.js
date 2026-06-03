const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  fee: { type: mongoose.Schema.Types.ObjectId, ref: 'Fee', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  amount: { type: Number, required: true },
  transactionId: { type: String, required: true, unique: true, index: true },
  paymentMethod: { type: String, enum: ['Cash', 'UPI', 'NetBanking', 'Card', 'Cheque', 'DD'], required: true },
  paymentGateway: { type: String }, // 'Razorpay', 'Paytm'
  gatewayOrderId: { type: String },
  status: { type: String, enum: ['Success', 'Pending', 'Failed', 'Refunded'], default: 'Pending' },
  receiptUrl: { type: String },
  receiptNumber: { type: String },
  paymentDate: { type: Date, default: Date.now },
  collectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  remarks: { type: String },
  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true }
}, { timestamps: true });

paymentSchema.index({ student: 1, paymentDate: -1 });
paymentSchema.index({ status: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
