const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  content: {
    type: String // text answer or URL to a file
  },
  attachments: [{
    name: String,
    url: String
  }],
  status: {
    type: String,
    enum: ['Submitted', 'Late', 'Graded'],
    default: 'Submitted'
  },
  marksAwarded: {
    type: Number
  },
  feedback: {
    type: String
  }
});

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  facultyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty',
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
  dueDate: {
    type: Date,
    required: true
  },
  totalMarks: {
    type: Number,
    required: true,
    default: 100
  },
  attachments: [{
    name: String,
    url: String // Resources provided by faculty
  }],
  submissions: [submissionSchema]
}, { timestamps: true });

module.exports = mongoose.model('Assignment', assignmentSchema);
