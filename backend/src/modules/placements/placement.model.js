const mongoose = require('mongoose');

const placementSchema = new mongoose.Schema({
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  jobTitle: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  type: { type: String, enum: ['Placement', 'Internship', 'PPO'], default: 'Placement' },
  packageLPA: { type: Number, required: true },
  stipendPerMonth: { type: Number }, // For internship
  eligibilityCriteria: {
    minCGPA: { type: Number, default: 0 },
    minPercentage: { type: Number, default: 0 },
    allowedBranches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Department' }],
    allowedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    passoutYear: { type: Number },
    backlogs: { type: Number, default: 0 }
  },
  driveDate: { type: Date, required: true },
  location: { type: String },
  lastApplyDate: { type: Date },
  applications: [{
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    appliedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['Applied', 'Shortlisted', 'Written', 'Interview', 'Selected', 'Rejected', 'Withdrawn'],
      default: 'Applied'
    }
  }],
  status: { type: String, enum: ['Open', 'Closed', 'Completed'], default: 'Open' },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true }
}, { timestamps: true });

placementSchema.index({ company: 1, driveDate: 1 });
placementSchema.index({ status: 1, driveDate: 1 });

module.exports = mongoose.model('Placement', placementSchema);
