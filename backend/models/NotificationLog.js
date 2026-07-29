const mongoose = require('mongoose');

const notificationLogSchema = new mongoose.Schema({
  type: { type: String, enum: ['match_email', 'system_log'], default: 'match_email' },
  to: { type: String, required: true },
  subject: { type: String, required: true },
  body: { type: String, required: true },
  status: { type: String, enum: ['sent', 'logged', 'failed'], default: 'logged' },
  relatedMatchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Match', default: null },
  error: { type: String, default: null }
}, { timestamps: true });

module.exports = mongoose.model('NotificationLog', notificationLogSchema, 'notificationLogs');
