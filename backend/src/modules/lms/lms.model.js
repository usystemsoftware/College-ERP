const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  type: { type: String, enum: ['Document', 'Video', 'Link', 'Archive'], required: true },
  url: { type: String, required: true }, // Link to cloud storage or external site
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' }, // Optional, if meant for a specific batch
  facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true },
  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Resource', resourceSchema);
