# CampusFind — MongoDB Setup

Scripts for the deployment team to provision the database for the CampusFind
(University of Regina Lost & Found) project.

## Files
1. **01_schema_setup.js** — creates collections with `$jsonSchema` validators
   (acts as the "table structure") and all required indexes. Idempotent —
   safe to re-run.
2. **02_sample_queries.js** — walks through the full workflow end-to-end
   (signup → lost report → found item → match → release) and includes the
   exact queries the front end will need (status check, dashboard metrics,
   match queue). Use as a reference for building the API layer.

## Run order
```bash
mongosh "<connection-string>" 01_schema_setup.js
mongosh "<connection-string>" 02_sample_queries.js   # optional, inserts demo data
```

## Collections

| Collection   | Who writes to it        | Notes |
|---|---|---|
| `users`      | Public signup + admin (created internally) | One collection, distinguished by `role: "user" \| "admin"`. Photo ID stored as a file path/URL only — actual file lives on disk/S3, not in Mongo. |
| `lostReports`| Logged-in public users  | One per "Submit lost item report". `referenceNumber` (e.g. `CF-2026-0142`) is auto-generated per year via the `counters` collection. |
| `foundItems` | Admin only               | Created only after Protective Services physically receives an item. `privateVerificationNotes` should never be exposed on any public-facing API response. |
| `matches`    | Admin only               | Dedicated collection linking a `lostReports` doc to a `foundItems` doc, so one lost report can be checked against multiple found items (and vice versa) without overwriting data. |
| `releaseLog` | Admin only               | Audit trail — who released what, to whom, when, and whether identifying details were verified. Required for compliance/accountability. |
| `counters`   | System-managed           | Backs the sequential reference number generator. Don't write to this directly from the app. |

## Status lifecycles
- **lostReports.status**: `Open → Matched → Pending Verification → Resolved` (or `Closed` if abandoned/withdrawn)
- **foundItems.status**: `In Holding → Matched → Released` (or `Disposed` if unclaimed past hold period)
- **matches.status**: `Pending Review → Confirmed` (or `Rejected`)

## Notes for the dev team
- Passwords: hash with bcrypt/argon2 in the application layer — `passwordHash` is the only field ever stored, never plain text.
- Admin accounts are **not** created through the public signup form — insert them directly (see section 2 of `02_sample_queries.js`) or build an internal-only admin creation flow.
- The "Items in holding", "Open lost reports", and "Matches pending review" dashboard cards map directly to the count queries in section 10 of `02_sample_queries.js`.
- Hold period default is 2 weeks (`holdUntil` field on `foundItems`); a scheduled job could query section 13's "past hold date" query to flag items for disposal review.
