const LostReport = require('../models/LostReport');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { generateReferenceNumber } = require('../services/referenceService');
const { createMatchesForLostReport } = require('../services/matchingService');
const { toPublicUploadPath } = require('../middleware/uploadMiddleware');
const ItemFactory = require('../patterns/factory/ItemFactory');

const createLostReport = asyncHandler(async (req, res) => {
  const itemCategory = req.body.itemCategory || req.body.category;
  const itemName = req.body.itemName || req.body.item;
  const dateLost = req.body.dateLost || req.body.date;
  const lastKnownLocation = req.body.lastKnownLocation || req.body.location;
  const description = req.body.description;
  const email = req.body.email || req.user.email;
  const phone = req.body.phone || req.user.phone;

  if (!itemCategory || !itemName || !dateLost || !lastKnownLocation || !description || !email || !phone) {
    throw new ApiError(400, 'Email, phone, category, item name, date lost, location, and description are required');
  }

  const itemObject = ItemFactory.createItem({
    category: itemCategory,
    title: itemName,
    location: lastKnownLocation,
    description
  });

  const referenceNumber = await generateReferenceNumber(new Date());
  const lostReport = await LostReport.create({
    referenceNumber,
    userId: req.user._id,
    fullName: req.user.fullName,
    email,
    phone,
    itemCategory,
    itemName,
    dateLost: new Date(dateLost),
    lastKnownLocation,
    photoUrl: toPublicUploadPath(req.file),
    description,
    status: 'Open'
  });

  const matches = await createMatchesForLostReport(lostReport);

  res.status(201).json({
    success: true,
    message: 'Lost item report submitted successfully',
    referenceNumber,
    verificationHint: itemObject.getVerificationHint(),
    lostReport,
    matchesCreated: matches.length
  });
});

const getMyLostReports = asyncHandler(async (req, res) => {
  const reports = await LostReport.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, count: reports.length, reports });
});

const lookupStatus = asyncHandler(async (req, res) => {
  const { referenceNumber, email } = req.query;
  if (!referenceNumber || !email) throw new ApiError(400, 'Reference number and email are required');

  const report = await LostReport.findOne({
    referenceNumber: referenceNumber.trim(),
    email: email.toLowerCase().trim()
  }).select('referenceNumber itemName itemCategory status createdAt updatedAt');

  if (!report) throw new ApiError(404, 'No report found for the provided reference number and email');
  res.json({ success: true, report });
});

const listLostReports = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = status ? { status } : {};
  const reports = await LostReport.find(filter).sort({ createdAt: -1 }).populate('userId', 'fullName email phone');
  res.json({ success: true, count: reports.length, reports });
});

const updateLostReportStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const allowed = ['Open', 'Matched', 'Pending Verification', 'Resolved', 'Closed'];
  if (!allowed.includes(status)) throw new ApiError(400, 'Invalid lost report status');

  const report = await LostReport.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!report) throw new ApiError(404, 'Lost report not found');
  res.json({ success: true, report });
});

module.exports = { createLostReport, getMyLostReports, lookupStatus, listLostReports, updateLostReportStatus };
