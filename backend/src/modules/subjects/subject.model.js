const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, uppercase: true, index: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  semester: { type: mongoose.Schema.Types.ObjectId, ref: 'Semester', required: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true },
  credits: { type: Number, required: true, min: 1 },
  type: { type: String, enum: ['Theory', 'Practical', 'Elective', 'Tutorial'], default: 'Theory' },
  maxMarks: { type: Number, default: 100 },
  passingMarks: { type: Number, default: 40 },
  syllabus: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

subjectSchema.index({ course: 1, semester: 1 });
subjectSchema.index({ department: 1, collegeId: 1 });

module.exports = mongoose.model('Subject', subjectSchema);
