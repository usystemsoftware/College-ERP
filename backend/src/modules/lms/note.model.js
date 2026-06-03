const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  chapter: { type: String },
  fileUrl: { type: String, required: true }, // Cloudinary URL
  fileType: { type: String, enum: ['PDF', 'PPT', 'Video', 'Document', 'Image', 'Other'], required: true },
  fileSize: { type: Number }, // in bytes
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' },
  semester: { type: mongoose.Schema.Types.ObjectId, ref: 'Semester' },
  isVisible: { type: Boolean, default: true },
  downloads: { type: Number, default: 0 },
  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true }
}, { timestamps: true });

noteSchema.index({ subject: 1, semester: 1 });
noteSchema.index({ uploadedBy: 1 });

module.exports = mongoose.model('Note', noteSchema);
