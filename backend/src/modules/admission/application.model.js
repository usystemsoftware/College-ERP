const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, required: true },
  dob: { type: Date, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  
  // Academic Intention
  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  
  // Documents (Mocking URLs for now)
  documents: {
    photoUrl: String,
    idProofUrl: String,
    marksheetUrl: String
  },
  
  // Status
  status: {
    type: String,
    enum: ['Pending', 'Reviewed', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  
  // Officer Review
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewNotes: String,
  
  // Seat Allotment
  allottedBatchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' },
  enrollmentId: String

}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);
