const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  industry: { type: String, required: true },
  website: { type: String },
  logoUrl: { type: String },
  description: { type: String },
  contactPerson: { type: String, required: true },
  contactEmail: { type: String, required: true, lowercase: true },
  contactPhone: { type: String, required: true },
  address: { type: String },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' }
}, { timestamps: true });

module.exports = mongoose.model('Company', companySchema);
