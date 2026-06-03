const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  assignment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  submittedUrl: { type: String, required: true }, // Cloudinary URL
  submittedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['Submitted', 'Graded', 'Late', 'Returned'], default: 'Submitted' },
  marks: { type: Number },
  feedback: { type: String },
  gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  gradedAt: { type: Date },
  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true }
}, { timestamps: true });

submissionSchema.index({ assignment: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('Submission', submissionSchema);
