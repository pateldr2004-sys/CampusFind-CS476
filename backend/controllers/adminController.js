const LostReport = require('../models/LostReport');
const FoundItem = require('../models/FoundItem');
const Match = require('../models/Match');
const ReleaseLog = require('../models/ReleaseLog');
const NotificationLog = require('../models/NotificationLog');
const asyncHandler = require('../utils/asyncHandler');

const getDashboard = asyncHandler(async (req, res) => {
  const [itemsInHolding, openLostReports, matchesPendingReview, releasedItems, notifications] = await Promise.all([
    FoundItem.countDocuments({ status: 'In Holding' }),
    LostReport.countDocuments({ status: 'Open' }),
    Match.countDocuments({ status: 'Pending Review' }),
    ReleaseLog.countDocuments(),
    NotificationLog.find().sort({ createdAt: -1 }).limit(5)
  ]);

  const recentMatches = await Match.find({ status: 'Pending Review' })
    .sort({ createdAt: -1 })
    .limit(10)
    .populate('lostReportId', 'referenceNumber fullName email itemName itemCategory status')
    .populate('foundItemId', 'itemTitle itemCategory status dropOffLocation');

  res.json({
    success: true,
    metrics: { itemsInHolding, openLostReports, matchesPendingReview, releasedItems },
    recentMatches,
    notifications
  });
});

module.exports = { getDashboard };
