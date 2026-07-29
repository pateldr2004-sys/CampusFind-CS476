const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  lostReportId: { type: mongoose.Schema.Types.ObjectId, ref: 'LostReport', required: true },
  foundItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'FoundItem', required: true },
  similarity: { type: String, enum: ['high', 'medium', 'low', 'manual review'], required: true },
  score: { type: Number, default: 0 },
  status: { type: String, enum: ['Pending Review', 'Confirmed', 'Rejected'], default: 'Pending Review', required: true },
  reviewedByAdminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true });

matchSchema.index({ lostReportId: 1, foundItemId: 1 }, { unique: true, name: 'uniq_match_pair' });
matchSchema.index({ status: 1 }, { name: 'idx_status' });

module.exports = mongoose.model('Match', matchSchema, 'matches');
