const mongoose = require('mongoose');

const releaseLogSchema = new mongoose.Schema({
  foundItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'FoundItem', required: true },
  lostReportId: { type: mongoose.Schema.Types.ObjectId, ref: 'LostReport', required: true },
  releasedToUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  releasedByAdminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  releaseDate: { type: Date, required: true, default: Date.now },
  verificationDetailsConfirmed: { type: Boolean, default: true },
  notes: { type: String, default: null }
}, { timestamps: true });

releaseLogSchema.index({ foundItemId: 1 }, { name: 'idx_foundItemId' });
releaseLogSchema.index({ lostReportId: 1 }, { name: 'idx_lostReportId' });

module.exports = mongoose.model('ReleaseLog', releaseLogSchema, 'releaseLog');
