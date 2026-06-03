const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  hod: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty'
  },
  collegeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.models.Department || mongoose.model('Department', departmentSchema);
