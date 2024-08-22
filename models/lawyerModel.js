const mongoose = require('mongoose');

const LawyerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  oab: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  caseName: { type: String, required: true },
  caseDate: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Lawyer', LawyerSchema);
