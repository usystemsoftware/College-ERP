const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['Cash', 'Card', 'UPI', 'Bank Transfer'], required: true },
  transactionId: { type: String }, // For online/bank transfers
  date: { type: Date, default: Date.now },
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Admin who recorded offline payment
});

const invoiceSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  title: { type: String, required: true }, // e.g., "Tuition Fee Fall 2023"
  description: { type: String },
  totalAmount: { type: Number, required: true },
  paidAmount: { type: Number, default: 0 },
  dueDate: { type: Date, required: true },
  status: { type: String, enum: ['Pending', 'Partial', 'Paid', 'Overdue'], default: 'Pending' },
  feeType: { type: String, enum: ['Tuition', 'Hostel', 'Transport', 'Library Fine', 'Other'], required: true },
  payments: [paymentSchema]
}, { timestamps: true });

// Pre-save hook to update status based on paid amount
invoiceSchema.pre('save', function(next) {
  if (this.paidAmount >= this.totalAmount) {
    this.status = 'Paid';
  } else if (this.paidAmount > 0) {
    this.status = 'Partial';
  } else if (this.dueDate && new Date() > this.dueDate) {
    this.status = 'Overdue';
  } else {
    this.status = 'Pending';
  }
  next();
});

module.exports = mongoose.model('Invoice', invoiceSchema);
