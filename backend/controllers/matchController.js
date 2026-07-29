const Match = require('../models/Match');
const LostReport = require('../models/LostReport');
const FoundItem = require('../models/FoundItem');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const listMatches = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = status ? { status } : {};
  const matches = await Match.find(filter)
    .sort({ createdAt: -1 })
    .populate('lostReportId', 'referenceNumber fullName email phone itemName itemCategory dateLost lastKnownLocation description status')
    .populate('foundItemId', 'itemTitle dropOffLocation itemCategory privateVerificationNotes status holdUntil')
    .populate('reviewedByAdminId', 'fullName email');
  res.json({ success: true, count: matches.length, matches });
});

const confirmMatch = asyncHandler(async (req, res) => {
  const match = await Match.findById(req.params.id);
  if (!match) throw new ApiError(404, 'Match not found');

  match.status = 'Confirmed';
  match.reviewedByAdminId = req.user._id;
  await match.save();

  await LostReport.findByIdAndUpdate(match.lostReportId, { status: 'Pending Verification' });
  await FoundItem.findByIdAndUpdate(match.foundItemId, { status: 'Matched' });

  const updated = await Match.findById(match._id)
    .populate('lostReportId', 'referenceNumber fullName email itemName status')
    .populate('foundItemId', 'itemTitle status')
    .populate('reviewedByAdminId', 'fullName email');

  res.json({ success: true, message: 'Match confirmed', match: updated });
});

const rejectMatch = asyncHandler(async (req, res) => {
  const match = await Match.findById(req.params.id);
  if (!match) throw new ApiError(404, 'Match not found');

  match.status = 'Rejected';
  match.reviewedByAdminId = req.user._id;
  await match.save();

  res.json({ success: true, message: 'Match rejected', match });
});

module.exports = { listMatches, confirmMatch, rejectMatch };
