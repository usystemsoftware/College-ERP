const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  test: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  answers: [{
    question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    submittedAnswer: String,
    isCorrect: Boolean,
    marksAwarded: { type: Number, default: 0 }
  }],
  totalMarksObtained: { type: Number, required: true },
  totalMarks: { type: Number, required: true },
  percentage: { type: Number, required: true },
  grade: { type: String },
  status: { type: String, enum: ['Pass', 'Fail', 'Absent', 'Withheld'], required: true },
  remarks: { type: String },
  evaluatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true }
}, { timestamps: true });

resultSchema.index({ test: 1, student: 1 }, { unique: true });
resultSchema.index({ student: 1 });

module.exports = mongoose.model('Result', resultSchema);
