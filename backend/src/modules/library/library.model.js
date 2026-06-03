const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  isbn: { type: String, required: true, unique: true },
  publisher: { type: String },
  category: { type: String }, // e.g., Engineering, Management, Fiction
  totalCopies: { type: Number, required: true, default: 1 },
  availableCopies: { type: Number, required: true, default: 1 },
  location: { type: String }, // e.g., Shelf A-4
  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true }
}, { timestamps: true });

const issueRecordSchema = new mongoose.Schema({
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Can be student or faculty
  issueDate: { type: Date, default: Date.now },
  dueDate: { type: Date, required: true },
  returnDate: { type: Date },
  status: { type: String, enum: ['Issued', 'Returned', 'Overdue'], default: 'Issued' },
  fineAmount: { type: Number, default: 0 }, // Calculated upon return if late
  issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Librarian
  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true }
}, { timestamps: true });

// Pre-save hook to update status if overdue
issueRecordSchema.pre('save', function(next) {
  if (this.status === 'Issued' && this.dueDate && new Date() > this.dueDate) {
    this.status = 'Overdue';
  }
  next();
});

const Book = mongoose.model('Book', bookSchema);
const IssueRecord = mongoose.model('IssueRecord', issueRecordSchema);

module.exports = { Book, IssueRecord };
