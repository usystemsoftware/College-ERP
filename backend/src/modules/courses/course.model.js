const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  durationSemesters: {
    type: Number,
    required: true,
    default: 8
  }
}, {
  timestamps: true
});

module.exports = mongoose.models.Course || mongoose.model('Course', courseSchema);
