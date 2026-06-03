const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  marksObtained: {
    type: Number,
    required: true
  },
  grade: {
    type: String
  },
  remarks: {
    type: String
  }
});

const examSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true // e.g., "Mid-Term Fall 2024"
  },
  examType: {
    type: String,
    enum: ['Internal', 'External', 'Practical', 'Quiz'],
    required: true
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  batchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  totalMarks: {
    type: Number,
    required: true,
    default: 100
  },
  passingMarks: {
    type: Number,
    required: true,
    default: 40
  },
  results: [resultSchema],
  isPublished: {
    type: Boolean,
    default: false
  },
  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Exam', examSchema);
