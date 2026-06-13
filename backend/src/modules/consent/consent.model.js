const mongoose = require('mongoose');

const consentSchema = new mongoose.Schema({
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  consentType: {
    type: String,
    enum: ['location_tracking', 'sms_alerts', 'photo_sharing', 'bus_tracking'],
    required: true
  },
  status: {
    type: String,
    enum: ['granted', 'revoked'],
    default: 'granted'
  },
  grantedAt: { type: Date, default: Date.now },
  revokedAt: { type: Date, default: null },
  ipAddress: { type: String },
  userAgent: { type: String },
  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true }
}, { timestamps: true });

consentSchema.index({ parent: 1, student: 1, consentType: 1 }, { unique: true });
consentSchema.index({ student: 1, consentType: 1 });

module.exports = mongoose.model('Consent', consentSchema);
