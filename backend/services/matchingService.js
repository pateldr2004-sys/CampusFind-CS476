const LostReport = require('../models/LostReport');
const FoundItem = require('../models/FoundItem');
const Match = require('../models/Match');
const matchNotifier = require('./matchNotifier');

const STOP_WORDS = new Set(['the', 'and', 'or', 'a', 'an', 'of', 'in', 'on', 'at', 'to', 'with', 'for', 'item', 'lost', 'found']);

function tokenize(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length >= 3 && !STOP_WORDS.has(word));
}

function overlapRatio(aTokens, bTokens) {
  const a = new Set(aTokens);
  const b = new Set(bTokens);
  if (a.size === 0 || b.size === 0) return 0;
  let overlap = 0;
  for (const token of a) if (b.has(token)) overlap += 1;
  return overlap / Math.max(a.size, b.size);
}

function dateScore(dateLost, foundDate) {
  if (!dateLost || !foundDate) return 0;
  const lost = new Date(dateLost);
  const found = new Date(foundDate);
  const diffDays = Math.round((found - lost) / (1000 * 60 * 60 * 24));
  if (Number.isNaN(diffDays)) return 0;
  if (diffDays < -2) return 0;
  if (diffDays <= 7) return 10;
  if (diffDays <= 30) return 6;
  return 2;
}

function computeMatchScore(lostReport, foundItem) {
  let score = 0;

  if (lostReport.itemCategory === foundItem.itemCategory) score += 35;

  const lostNameTokens = tokenize(lostReport.itemName);
  const foundTitleTokens = tokenize(foundItem.itemTitle);
  score += Math.round(overlapRatio(lostNameTokens, foundTitleTokens) * 25);

  const lostLocationTokens = tokenize(lostReport.lastKnownLocation);
  const foundLocationTokens = tokenize(foundItem.dropOffLocation);
  score += Math.round(overlapRatio(lostLocationTokens, foundLocationTokens) * 15);

  const lostDescTokens = tokenize(lostReport.description);
  const foundNoteTokens = tokenize(foundItem.privateVerificationNotes);
  score += Math.round(overlapRatio(lostDescTokens, foundNoteTokens) * 15);

  score += dateScore(lostReport.dateLost, foundItem.createdAt || foundItem.updatedAt || new Date());

  return Math.min(score, 100);
}

function similarityFromScore(score) {
  if (score >= 75) return 'high';
  if (score >= 55) return 'medium';
  if (score >= 40) return 'low';
  return 'manual review';
}

async function createMatchIfStrongEnough(lostReport, foundItem) {
  const score = computeMatchScore(lostReport, foundItem);
  if (score < 40) return null;

  const existing = await Match.findOne({ lostReportId: lostReport._id, foundItemId: foundItem._id });
  if (existing) return existing;

  const match = await Match.create({
    lostReportId: lostReport._id,
    foundItemId: foundItem._id,
    similarity: similarityFromScore(score),
    score,
    status: 'Pending Review'
  });

  await LostReport.updateOne({ _id: lostReport._id }, { $set: { status: 'Matched' } });
  await FoundItem.updateOne({ _id: foundItem._id }, { $set: { status: 'Matched' } });

  const refreshedLost = await LostReport.findById(lostReport._id);
  const refreshedFound = await FoundItem.findById(foundItem._id);
  await matchNotifier.notify({ match, lostReport: refreshedLost, foundItem: refreshedFound });

  return match;
}

async function createMatchesForLostReport(lostReport) {
  const foundItems = await FoundItem.find({ status: { $in: ['In Holding', 'Matched'] } });
  const results = [];
  for (const foundItem of foundItems) {
    const match = await createMatchIfStrongEnough(lostReport, foundItem);
    if (match) results.push(match);
  }
  return results;
}

async function createMatchesForFoundItem(foundItem) {
  const lostReports = await LostReport.find({ status: { $in: ['Open', 'Matched'] } });
  const results = [];
  for (const lostReport of lostReports) {
    const match = await createMatchIfStrongEnough(lostReport, foundItem);
    if (match) results.push(match);
  }
  return results;
}

module.exports = {
  computeMatchScore,
  similarityFromScore,
  createMatchesForLostReport,
  createMatchesForFoundItem
};
