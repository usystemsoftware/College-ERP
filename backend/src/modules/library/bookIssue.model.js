const mongoose = require('mongoose');

const bookIssueSchema = new mongoose.Schema({
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'LibraryBook', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' },
  issueDate: { type: Date, default: Date.now, required: true },
  dueDate: { type: Date, required: true },
  returnDate: { type: Date },
  fineAmount: { type: Number, default: 0 },
  finePaid: { type: Boolean, default: false },
  status: { type: String, enum: ['Issued', 'Returned', 'Overdue', 'Lost'], default: 'Issued' },
  issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  remarks: { type: String },
  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true }
}, { timestamps: true });

bookIssueSchema.index({ user: 1, status: 1 });
bookIssueSchema.index({ book: 1, status: 1 });
bookIssueSchema.index({ dueDate: 1, status: 1 });

module.exports = mongoose.model('BookIssue', bookIssueSchema);
