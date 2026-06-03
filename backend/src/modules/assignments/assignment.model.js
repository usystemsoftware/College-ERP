const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  semester: { type: mongoose.Schema.Types.ObjectId, ref: 'Semester', required: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  division: { type: String },
  dueDate: { type: Date, required: true },
  totalMarks: { type: Number, required: true },
  fileUrl: { type: String }, // optional template/question file
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true },
  isActive: { type: Boolean, default: true },
  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true }
}, { timestamps: true });

assignmentSchema.index({ subject: 1, semester: 1 });
assignmentSchema.index({ faculty: 1 });

module.exports = mongoose.model('Assignment', assignmentSchema);
