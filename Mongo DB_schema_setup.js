/**
 * CampusFind - MongoDB Schema Setup Script
 * University of Regina Lost & Found Project
 *
 * Run with:
 *   mongosh "<your-connection-string>" 01_schema_setup.js
 *
 * This script:
 *   1. Creates each collection with a $jsonSchema validator (acts like
 *      table structure / constraints in a relational DB).
 *   2. Creates indexes for uniqueness and common query patterns.
 *   3. Seeds the `counters` collection used to generate reference numbers
 *      like CF-2026-0142.
 *
 * Re-running this script is safe: it checks for existing collections
 * before creating them.
 */

db = db.getSiblingDB("campusfind"); // change DB name here if needed

function collectionExists(name) {
  return db.getCollectionNames().includes(name);
}

/* ------------------------------------------------------------------ */
/* 1. USERS  (covers both public users and admin/Protective Services) */
/* ------------------------------------------------------------------ */
if (!collectionExists("users")) {
  db.createCollection("users", {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["fullName", "email", "passwordHash", "role", "createdAt"],
        properties: {
          fullName: { bsonType: "string", minLength: 1, description: "Full name of the user" },
          email: {
            bsonType: "string",
            pattern: "^.+@.+\\..+$",
            description: "Must be a valid email and is unique"
          },
          passwordHash: { bsonType: "string", description: "Hashed password, never plain text" },
          phone: { bsonType: ["string", "null"] },
          role: {
            enum: ["user", "admin"],
            description: "user = public reporter, admin = Protective Services staff"
          },
          photoIdUrl: {
            bsonType: ["string", "null"],
            description: "Path/URL to uploaded Photo ID file (file itself stored outside Mongo, e.g. disk or S3)"
          },
          status: { enum: ["active", "suspended"] },
          createdAt: { bsonType: "date" },
          updatedAt: { bsonType: "date" }
        }
      }
    },
    validationLevel: "strict",
    validationAction: "error"
  });
  print("Created collection: users");
}

/* ------------------------------------------------------------------ */
/* 2. COUNTERS  (used to generate sequential reference numbers / year) */
/* ------------------------------------------------------------------ */
if (!collectionExists("counters")) {
  db.createCollection("counters", {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["_id", "seq"],
        properties: {
          _id: { bsonType: "string", description: "e.g. 'lostReport_2026'" },
          seq: { bsonType: "int", minimum: 0 }
        }
      }
    }
  });
  print("Created collection: counters");
}

/* ------------------------------------------------------------------ */
/* 3. LOST REPORTS  (submitted by logged-in public users)              */
/* ------------------------------------------------------------------ */
const itemCategories = [
  "Phone",
  "Laptop / electronic device",
  "Wallet / ID / bank card",
  "Backpack / bag",
  "Book / notebook",
  "Keys",
  "Jewelry",
  "Other"
];

if (!collectionExists("lostReports")) {
  db.createCollection("lostReports", {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: [
          "referenceNumber", "userId", "fullName", "email", "phone",
          "itemCategory", "itemName", "dateLost", "lastKnownLocation",
          "description", "status", "createdAt"
        ],
        properties: {
          referenceNumber: { bsonType: "string", description: "e.g. CF-2026-0142, unique" },
          userId: { bsonType: "objectId", description: "Reference to users._id" },
          fullName: { bsonType: "string" },
          email: { bsonType: "string" },
          phone: { bsonType: "string" },
          itemCategory: { enum: itemCategories },
          itemName: { bsonType: "string" },
          dateLost: { bsonType: "date" },
          lastKnownLocation: { bsonType: "string" },
          photoUrl: { bsonType: ["string", "null"] },
          description: { bsonType: "string" },
          status: {
            enum: ["Open", "Matched", "Pending Verification", "Resolved", "Closed"],
            description: "Lifecycle of the lost report"
          },
          createdAt: { bsonType: "date" },
          updatedAt: { bsonType: "date" }
        }
      }
    },
    validationLevel: "strict",
    validationAction: "error"
  });
  print("Created collection: lostReports");
}

/* ------------------------------------------------------------------ */
/* 4. FOUND ITEMS  (entered only by admin staff after physical hand-in) */
/* ------------------------------------------------------------------ */
if (!collectionExists("foundItems")) {
  db.createCollection("foundItems", {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: [
          "itemTitle", "dropOffLocation", "itemCategory",
          "status", "createdByAdminId", "createdAt"
        ],
        properties: {
          itemTitle: { bsonType: "string", description: "e.g. 'Blue backpack'" },
          dropOffLocation: { bsonType: "string" },
          itemCategory: { enum: itemCategories },
          privateVerificationNotes: {
            bsonType: ["string", "null"],
            description: "Serial numbers, card name, etc. Staff-only, never shown to public"
          },
          status: {
            enum: ["In Holding", "Matched", "Released", "Disposed"],
            description: "Lifecycle of a found item"
          },
          createdByAdminId: { bsonType: "objectId", description: "Reference to users._id (role: admin)" },
          holdUntil: { bsonType: ["date", "null"], description: "Items generally held ~2 weeks" },
          createdAt: { bsonType: "date" },
          updatedAt: { bsonType: "date" }
        }
      }
    },
    validationLevel: "strict",
    validationAction: "error"
  });
  print("Created collection: foundItems");
}

/* ------------------------------------------------------------------ */
/* 5. MATCHES  (links a lostReport to a foundItem for staff review)    */
/* ------------------------------------------------------------------ */
if (!collectionExists("matches")) {
  db.createCollection("matches", {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["lostReportId", "foundItemId", "similarity", "status", "createdAt"],
        properties: {
          lostReportId: { bsonType: "objectId" },
          foundItemId: { bsonType: "objectId" },
          similarity: { enum: ["high", "medium", "low", "manual review"] },
          status: { enum: ["Pending Review", "Confirmed", "Rejected"] },
          reviewedByAdminId: { bsonType: ["objectId", "null"] },
          createdAt: { bsonType: "date" },
          updatedAt: { bsonType: "date" }
        }
      }
    },
    validationLevel: "strict",
    validationAction: "error"
  });
  print("Created collection: matches");
}

/* ------------------------------------------------------------------ */
/* 6. RELEASE LOG  (audit trail when an item is handed back)          */
/* ------------------------------------------------------------------ */
if (!collectionExists("releaseLog")) {
  db.createCollection("releaseLog", {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["foundItemId", "lostReportId", "releasedByAdminId", "releaseDate", "createdAt"],
        properties: {
          foundItemId: { bsonType: "objectId" },
          lostReportId: { bsonType: "objectId" },
          releasedToUserId: { bsonType: ["objectId", "null"] },
          releasedByAdminId: { bsonType: "objectId" },
          releaseDate: { bsonType: "date" },
          verificationDetailsConfirmed: { bsonType: "bool" },
          notes: { bsonType: ["string", "null"] },
          createdAt: { bsonType: "date" }
        }
      }
    },
    validationLevel: "strict",
    validationAction: "error"
  });
  print("Created collection: releaseLog");
}

/* ------------------------------------------------------------------ */
/* INDEXES                                                              */
/* ------------------------------------------------------------------ */

// users
db.users.createIndex({ email: 1 }, { unique: true, name: "uniq_email" });
db.users.createIndex({ role: 1 }, { name: "idx_role" });

// lostReports
db.lostReports.createIndex({ referenceNumber: 1 }, { unique: true, name: "uniq_referenceNumber" });
db.lostReports.createIndex({ userId: 1 }, { name: "idx_userId" });
db.lostReports.createIndex({ status: 1 }, { name: "idx_status" });
db.lostReports.createIndex({ email: 1, referenceNumber: 1 }, { name: "idx_status_lookup" }); // for "check claim status" form

// foundItems
db.foundItems.createIndex({ status: 1 }, { name: "idx_status" });
db.foundItems.createIndex({ itemCategory: 1 }, { name: "idx_category" });
db.foundItems.createIndex({ createdByAdminId: 1 }, { name: "idx_createdBy" });

// matches
db.matches.createIndex({ lostReportId: 1, foundItemId: 1 }, { unique: true, name: "uniq_match_pair" });
db.matches.createIndex({ status: 1 }, { name: "idx_status" });

// releaseLog
db.releaseLog.createIndex({ foundItemId: 1 }, { name: "idx_foundItemId" });
db.releaseLog.createIndex({ lostReportId: 1 }, { name: "idx_lostReportId" });

print("\nAll collections, validators, and indexes are set up.");
print("Database: campusfind");
