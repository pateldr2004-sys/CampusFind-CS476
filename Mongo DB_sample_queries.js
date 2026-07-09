/**
 * CampusFind - Sample Queries & Workflow Script
 * University of Regina Lost & Found Project
 *
 * Run AFTER 01_schema_setup.js, with:
 *   mongosh "<your-connection-string>" 02_sample_queries.js
 *
 * Demonstrates the full lifecycle:
 *   Sign up (user + admin) -> Lost report submitted -> Admin logs a found
 *   item -> Match created -> Match confirmed -> Item released -> Status checks
 *
 * Each section is independently runnable/copy-pasteable for the dev team.
 */

db = db.getSiblingDB("campusfind");

/* ------------------------------------------------------------------ */
/* Helper: generate the next reference number for a given year         */
/* e.g. generateReferenceNumber(2026) -> "CF-2026-0001"                */
/* Atomic via findOneAndUpdate so it's safe under concurrent requests. */
/* ------------------------------------------------------------------ */
function generateReferenceNumber(year) {
  const counterId = "lostReport_" + year;
  const result = db.counters.findOneAndUpdate(
    { _id: counterId },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: "after" }
  );
  const seq = result.seq.toString().padStart(4, "0");
  return "CF-" + year + "-" + seq;
}

/* ------------------------------------------------------------------ */
/* 1. SIGN UP - public user                                            */
/* ------------------------------------------------------------------ */
const userInsert = db.users.insertOne({
  fullName: "Jordan Smith",
  email: "jordan.smith@uregina.ca",
  passwordHash: "<bcrypt-hash-here>", // hash in application layer, never store plain text
  phone: "306-555-0101",
  role: "user",
  photoIdUrl: "/uploads/photo-ids/jordan-smith.jpg",
  status: "active",
  createdAt: new Date(),
  updatedAt: new Date()
});
const userId = userInsert.insertedId;
print("Created user:", userId);

/* ------------------------------------------------------------------ */
/* 2. SIGN UP - admin (Protective Services staff, created internally)  */
/* ------------------------------------------------------------------ */
const adminInsert = db.users.insertOne({
  fullName: "Pat Reyes",
  email: "preyes@uregina.ca",
  passwordHash: "<bcrypt-hash-here>",
  phone: "306-585-4407",
  role: "admin",
  photoIdUrl: null,
  status: "active",
  createdAt: new Date(),
  updatedAt: new Date()
});
const adminId = adminInsert.insertedId;
print("Created admin:", adminId);

/* ------------------------------------------------------------------ */
/* 3. LOGIN lookup pattern (app layer compares passwordHash after this) */
/* ------------------------------------------------------------------ */
db.users.findOne({ email: "jordan.smith@uregina.ca" });

/* ------------------------------------------------------------------ */
/* 4. SUBMIT A LOST ITEM REPORT (logged-in user only)                   */
/* ------------------------------------------------------------------ */
const refNumber = generateReferenceNumber(2026);
const lostReportInsert = db.lostReports.insertOne({
  referenceNumber: refNumber,
  userId: userId,
  fullName: "Jordan Smith",
  email: "jordan.smith@uregina.ca",
  phone: "306-555-0101",
  itemCategory: "Backpack / bag",
  itemName: "Blue backpack",
  dateLost: new Date("2026-06-20"),
  lastKnownLocation: "Library",
  photoUrl: null,
  description: "Navy blue Jansport backpack, small UofR pin on front pocket.",
  status: "Open",
  createdAt: new Date(),
  updatedAt: new Date()
});
const lostReportId = lostReportInsert.insertedId;
print("Created lost report:", refNumber, lostReportId);

/* ------------------------------------------------------------------ */
/* 5. CHECK CLAIM STATUS (public "status" form: ref number + email)     */
/* ------------------------------------------------------------------ */
db.lostReports.findOne({
  referenceNumber: refNumber,
  email: "jordan.smith@uregina.ca"
});

/* ------------------------------------------------------------------ */
/* 6. ADMIN: log a found item (after physical hand-in to PS)           */
/* ------------------------------------------------------------------ */
const twoWeeksFromNow = new Date();
twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);

const foundItemInsert = db.foundItems.insertOne({
  itemTitle: "Blue backpack",
  dropOffLocation: "Research and Innovation Centre",
  itemCategory: "Backpack / bag",
  privateVerificationNotes: "Inside front pocket has a UofR student ID, name partly visible.",
  status: "In Holding",
  createdByAdminId: adminId,
  holdUntil: twoWeeksFromNow,
  createdAt: new Date(),
  updatedAt: new Date()
});
const foundItemId = foundItemInsert.insertedId;
print("Created found item:", foundItemId);

/* ------------------------------------------------------------------ */
/* 7. ADMIN: create a match between the lost report and found item     */
/* ------------------------------------------------------------------ */
const matchInsert = db.matches.insertOne({
  lostReportId: lostReportId,
  foundItemId: foundItemId,
  similarity: "high",
  status: "Pending Review",
  reviewedByAdminId: null,
  createdAt: new Date(),
  updatedAt: new Date()
});
const matchId = matchInsert.insertedId;

// Reflect "Matched" status on both sides
db.lostReports.updateOne({ _id: lostReportId }, { $set: { status: "Matched", updatedAt: new Date() } });
db.foundItems.updateOne({ _id: foundItemId }, { $set: { status: "Matched", updatedAt: new Date() } });
print("Created match:", matchId);

/* ------------------------------------------------------------------ */
/* 8. ADMIN: confirm the match after the claimant verifies details      */
/* ------------------------------------------------------------------ */
db.matches.updateOne(
  { _id: matchId },
  { $set: { status: "Confirmed", reviewedByAdminId: adminId, updatedAt: new Date() } }
);
db.lostReports.updateOne(
  { _id: lostReportId },
  { $set: { status: "Pending Verification", updatedAt: new Date() } }
);

/* ------------------------------------------------------------------ */
/* 9. ADMIN: release the item to the claimant + write audit log         */
/* ------------------------------------------------------------------ */
db.releaseLog.insertOne({
  foundItemId: foundItemId,
  lostReportId: lostReportId,
  releasedToUserId: userId,
  releasedByAdminId: adminId,
  releaseDate: new Date(),
  verificationDetailsConfirmed: true,
  notes: "Claimant showed matching student ID and described the UofR pin unprompted.",
  createdAt: new Date()
});

db.foundItems.updateOne({ _id: foundItemId }, { $set: { status: "Released", updatedAt: new Date() } });
db.lostReports.updateOne({ _id: lostReportId }, { $set: { status: "Resolved", updatedAt: new Date() } });

print("Item released and logged.");

/* ------------------------------------------------------------------ */
/* 10. ADMIN DASHBOARD METRICS (matches the dashboard preview cards)    */
/* ------------------------------------------------------------------ */
const itemsInHolding = db.foundItems.countDocuments({ status: "In Holding" });
const openLostReports = db.lostReports.countDocuments({ status: "Open" });
const matchesPendingReview = db.matches.countDocuments({ status: "Pending Review" });

print("\n--- Admin Dashboard Metrics ---");
print("Items in holding:", itemsInHolding);
print("Open lost reports:", openLostReports);
print("Matches pending review:", matchesPendingReview);

/* ------------------------------------------------------------------ */
/* 11. ADMIN: recent match queue (joins matches -> lostReports/foundItems) */
/* ------------------------------------------------------------------ */
db.matches.aggregate([
  { $match: { status: "Pending Review" } },
  {
    $lookup: {
      from: "foundItems",
      localField: "foundItemId",
      foreignField: "_id",
      as: "foundItem"
    }
  },
  { $unwind: "$foundItem" },
  {
    $project: {
      itemTitle: "$foundItem.itemTitle",
      similarity: 1,
      status: 1,
      createdAt: 1
    }
  },
  { $sort: { createdAt: -1 } }
]);

/* ------------------------------------------------------------------ */
/* 12. Find all lost reports for a given user (e.g. "my reports" page)  */
/* ------------------------------------------------------------------ */
db.lostReports.find({ userId: userId }).sort({ createdAt: -1 });

/* ------------------------------------------------------------------ */
/* 13. Items currently in holding past their hold date (cleanup query)  */
/* ------------------------------------------------------------------ */
db.foundItems.find({ status: "In Holding", holdUntil: { $lt: new Date() } });
