const FoundItem = require('../models/FoundItem');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { createMatchesForFoundItem } = require('../services/matchingService');
const ItemFactory = require('../patterns/factory/ItemFactory');

function defaultHoldDate() {
  const date = new Date();
  date.setDate(date.getDate() + 14);
  return date;
}

const createFoundItem = asyncHandler(async (req, res) => {
  const itemTitle = req.body.itemTitle || req.body.title;
  const dropOffLocation = req.body.dropOffLocation || req.body.location;
  const itemCategory = req.body.itemCategory || req.body.category;
  const privateVerificationNotes = req.body.privateVerificationNotes || req.body.notes || null;

  if (!itemTitle || !dropOffLocation || !itemCategory) {
    throw new ApiError(400, 'Item title, drop-off location, and item category are required');
  }

  const itemObject = ItemFactory.createItem({
    category: itemCategory,
    title: itemTitle,
    location: dropOffLocation,
    description: privateVerificationNotes
  });

  const foundItem = await FoundItem.create({
    itemTitle,
    dropOffLocation,
    itemCategory,
    privateVerificationNotes,
    status: 'In Holding',
    createdByAdminId: req.user._id,
    holdUntil: defaultHoldDate()
  });

  const matches = await createMatchesForFoundItem(foundItem);

  res.status(201).json({
    success: true,
    message: 'Found item record created successfully',
    verificationHint: itemObject.getVerificationHint(),
    foundItem,
    matchesCreated: matches.length
  });
});

const listFoundItems = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = status ? { status } : {};
  const items = await FoundItem.find(filter)
    .sort({ createdAt: -1 })
    .populate('createdByAdminId', 'fullName email');
  res.json({ success: true, count: items.length, items });
});

const updateFoundItemStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const allowed = ['In Holding', 'Matched', 'Released', 'Disposed'];
  if (!allowed.includes(status)) throw new ApiError(400, 'Invalid found item status');

  const item = await FoundItem.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!item) throw new ApiError(404, 'Found item not found');
  res.json({ success: true, item });
});

module.exports = { createFoundItem, listFoundItems, updateFoundItemStatus };
