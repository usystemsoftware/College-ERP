const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }, // Optional for broadcasts
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['Email', 'SMS', 'WhatsApp', 'Push', 'System', 'Alert', 'Academic', 'Placement'], default: 'System' },
  category: { type: String, enum: ['Academic', 'Fee', 'Attendance', 'Event', 'Placement', 'General', 'Alert'], default: 'General' },
  status: { type: String, enum: ['Unread', 'Read'], default: 'Unread' },
  isRead: { type: Boolean, default: false },
  readAt: { type: Date },
  link: { type: String }, // Optional deep link
  metadata: { type: mongoose.Schema.Types.Mixed }, // Extra data
  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College' }
}, { timestamps: true });

notificationSchema.index({ recipient: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
