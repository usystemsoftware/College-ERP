const mongoose = require('mongoose');

const libraryBookSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  isbn: { type: String, required: true, unique: true, index: true },
  author: { type: String, required: true },
  publisher: { type: String },
  edition: { type: String },
  year: { type: Number },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
  category: { type: String, enum: ['Textbook', 'Reference', 'Novel', 'Journal', 'Magazine', 'Other'], default: 'Textbook' },
  language: { type: String, default: 'English' },
  totalCopies: { type: Number, required: true, default: 1 },
  availableCopies: { type: Number, required: true, default: 1 },
  rackLocation: { type: String },
  coverImageUrl: { type: String },
  description: { type: String },
  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true }
}, { timestamps: true });

libraryBookSchema.index({ title: 'text', author: 'text' });
libraryBookSchema.index({ collegeId: 1, category: 1 });

module.exports = mongoose.model('LibraryBook', libraryBookSchema);
