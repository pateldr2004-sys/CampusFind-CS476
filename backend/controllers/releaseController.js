const Match = require('../models/Match');
const LostReport = require('../models/LostReport');
const FoundItem = require('../models/FoundItem');
const ReleaseLog = require('../models/ReleaseLog');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const releaseMatchedItem = asyncHandler(async (req, res) => {
  const match = await Match.findById(req.params.matchId).populate('lostReportId foundItemId');
  if (!match) throw new ApiError(404, 'Match not found');
  if (match.status === 'Rejected') throw new ApiError(400, 'Cannot release an item from a rejected match');

  const notes = req.body.notes || 'Released after in-person ownership verification.';

  const log = await ReleaseLog.create({
    foundItemId: match.foundItemId._id,
    lostReportId: match.lostReportId._id,
    releasedToUserId: match.lostReportId.userId || null,
    releasedByAdminId: req.user._id,
    releaseDate: new Date(),
    verificationDetailsConfirmed: true,
    notes
  });

  match.status = 'Confirmed';
  match.reviewedByAdminId = req.user._id;
  await match.save();

  await FoundItem.findByIdAndUpdate(match.foundItemId._id, { status: 'Released' });
  await LostReport.findByIdAndUpdate(match.lostReportId._id, { status: 'Resolved' });

  res.json({ success: true, message: 'Item released and logged', releaseLog: log });
});

module.exports = { releaseMatchedItem };
