const mongoose = require('mongoose');
const { ITEM_CATEGORIES } = require('../config/categories');

const lostReportSchema = new mongoose.Schema({
  referenceNumber: { type: String, required: true, unique: true, trim: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fullName: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, required: true, trim: true },
  itemCategory: { type: String, enum: ITEM_CATEGORIES, required: true },
  itemName: { type: String, required: true, trim: true },
  dateLost: { type: Date, required: true },
  lastKnownLocation: { type: String, required: true, trim: true },
  photoUrl: { type: String, default: null },
  description: { type: String, required: true, trim: true },
  status: {
    type: String,
    enum: ['Open', 'Matched', 'Pending Verification', 'Resolved', 'Closed'],
    default: 'Open',
    required: true
  }
}, { timestamps: true });

lostReportSchema.index({ referenceNumber: 1 }, { unique: true, name: 'uniq_referenceNumber' });
lostReportSchema.index({ userId: 1 }, { name: 'idx_userId' });
lostReportSchema.index({ status: 1 }, { name: 'idx_status' });
lostReportSchema.index({ email: 1, referenceNumber: 1 }, { name: 'idx_status_lookup' });
lostReportSchema.index({ itemCategory: 1 }, { name: 'idx_category' });

module.exports = mongoose.model('LostReport', lostReportSchema, 'lostReports');
