const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
  // Anonymous by default — submitter is optional
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  isAnonymous: { type: Boolean, default: true },

  // Core content
  title: { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, required: true, trim: true, maxlength: 5000 },

  // Category — either AI-assigned or manually set by admin
  category: {
    type: String,
    enum: ['Safety Issue', 'Harassment Complaint', 'Infrastructure Problem', 'Medical Emergency', 'Bullying', 'Theft', 'Other'],
    default: 'Other'
  },

  // AI-determined urgency
  urgency: {
    type: String,
    enum: ['Critical', 'High', 'Medium', 'Low'],
    default: 'Medium'
  },

  // AI categorization metadata
  aiCategorization: {
    category: { type: String },
    urgency: { type: String },
    confidence: { type: Number, min: 0, max: 1 },
    reasoning: { type: String }
  },

  // Media attachments (file paths or base64 references)
  attachments: [{
    type: { type: String, enum: ['image', 'audio', 'document'], default: 'image' },
    url: { type: String },
    filename: { type: String }
  }],

  // Location context
  location: { type: String, trim: true },

  // Status workflow
  status: {
    type: String,
    enum: ['New', 'Under Review', 'Investigating', 'Resolved', 'Dismissed'],
    default: 'New'
  },

  // Admin/security handling
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  reviewNotes: [{ 
    note: String, 
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    addedAt: { type: Date, default: Date.now }
  }],
  resolvedAt: { type: Date },

  // Tenant
  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true }
}, { timestamps: true });

incidentSchema.index({ status: 1, urgency: 1, createdAt: -1 });
incidentSchema.index({ category: 1 });
incidentSchema.index({ collegeId: 1 });

if (mongoose.models.Incident) {
  delete mongoose.connection.models.Incident;
  delete mongoose.models.Incident;
}

module.exports = mongoose.model('Incident', incidentSchema);
