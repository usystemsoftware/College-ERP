const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  semester: { type: mongoose.Schema.Types.ObjectId, ref: 'Semester', required: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  type: { type: String, enum: ['MCQ', 'Subjective', 'Mixed', 'Internal', 'Final'], required: true },
  date: { type: Date, required: true },
  startTime: { type: String },
  duration: { type: Number, required: true }, // in minutes
  totalMarks: { type: Number, required: true },
  passingMarks: { type: Number, required: true },
  instructions: { type: String },
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['Draft', 'Published', 'Ongoing', 'Completed'], default: 'Draft' },
  division: { type: String },
  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true }
}, { timestamps: true });

testSchema.index({ subject: 1, semester: 1 });
testSchema.index({ department: 1, date: 1 });

module.exports = mongoose.model('Test', testSchema);
