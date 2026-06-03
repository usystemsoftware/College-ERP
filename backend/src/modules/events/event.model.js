const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  type: {
    type: String,
    enum: ['Workshop', 'Seminar', 'Cultural', 'Sports', 'NSS_NCC', 'Technical', 'Placement', 'Other'],
    required: true
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  venue: { type: String, required: true },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  coOrdinators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  registrations: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    registeredAt: { type: Date, default: Date.now }
  }],
  maxParticipants: { type: Number },
  bannerUrl: { type: String },
  status: { type: String, enum: ['Upcoming', 'Ongoing', 'Completed', 'Cancelled'], default: 'Upcoming' },
  isPublic: { type: Boolean, default: true },
  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true }
}, { timestamps: true });

eventSchema.index({ startDate: 1, status: 1 });
eventSchema.index({ type: 1, collegeId: 1 });

module.exports = mongoose.model('Event', eventSchema);
