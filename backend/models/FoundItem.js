const mongoose = require('mongoose');
const { ITEM_CATEGORIES } = require('../config/categories');

const foundItemSchema = new mongoose.Schema({
  itemTitle: { type: String, required: true, trim: true },
  dropOffLocation: { type: String, required: true, trim: true },
  itemCategory: { type: String, enum: ITEM_CATEGORIES, required: true },
  privateVerificationNotes: { type: String, default: null, trim: true },
  status: {
    type: String,
    enum: ['In Holding', 'Matched', 'Released', 'Disposed'],
    default: 'In Holding',
    required: true
  },
  createdByAdminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  holdUntil: { type: Date, default: null }
}, { timestamps: true });

foundItemSchema.index({ status: 1 }, { name: 'idx_status' });
foundItemSchema.index({ itemCategory: 1 }, { name: 'idx_category' });
foundItemSchema.index({ createdByAdminId: 1 }, { name: 'idx_createdBy' });

module.exports = mongoose.model('FoundItem', foundItemSchema, 'foundItems');
