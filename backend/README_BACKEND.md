# CampusFind Backend

This backend completes the CampusFind CS 476 project using **Node.js, Express.js, MongoDB/Mongoose, MVC architecture, Observer Pattern, and Simple Factory Pattern**.

## 1. What this backend supports

- Public user signup with optional Photo ID upload
- Public user login
- Lost item report submission
- Reference number generation such as `CF-2026-0001`
- Claim/status lookup by reference number + email
- Admin login
- Admin dashboard metrics
- Admin found-item entry
- Rule-based lost/found matching
- Match notification email/logging
- Admin match confirmation/rejection
- Admin item release log
- Observer Pattern for match notification
- Simple Factory Pattern for item category object creation

## 2. Folder structure

```text
backend/
├── app.js
├── server.js
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
├── services/
├── patterns/
│   ├── factory/
│   └── observer/
├── scripts/
└── uploads/
```

This follows MVC:

- **Models:** MongoDB/Mongoose schemas
- **Views:** existing HTML/CSS/JS frontend files
- **Controllers:** request handling and business coordination
- **Routes:** API endpoint definitions
- **Services:** matching, email, reference number, notification logic

## 3. Setup instructions

From the project root:

```bash
cd backend
npm install
cp .env.example .env
npm run seed:admin
npm run dev
```

Open:

```text
http://localhost:5000
```

Default admin from `.env.example`:

```text
Email: admin@uregina.ca
Password: Admin12345
```

Change these before final deployment.

## 4. MongoDB

The backend expects MongoDB. The team repo already has:

```text
Mongo DB_schema_setup.js
Mongo DB_sample_queries.js
Mongo DB_README.md
```

For local development, install/run MongoDB locally, or use MongoDB Atlas and update:

```text
MONGODB_URI=mongodb://127.0.0.1:27017/campusfind
```

## 5. Email notification behavior

If SMTP is configured in `.env`, emails are sent by Nodemailer.

If SMTP is not configured, the backend logs the email to the console and stores it in `notificationLogs`. This is useful for class demo because the Observer Pattern still runs without needing a real email account.

## 6. API summary

### Auth

```text
POST /api/auth/signup
POST /api/auth/login
POST /api/auth/admin/login
GET  /api/auth/me
```

### Lost reports

```text
POST  /api/lost-reports
GET   /api/lost-reports/mine
GET   /api/lost-reports/status?referenceNumber=CF-2026-0001&email=name@example.com
GET   /api/lost-reports                  admin only
PATCH /api/lost-reports/:id/status       admin only
```

### Found items

```text
POST  /api/found-items                   admin only
GET   /api/found-items                   admin only
PATCH /api/found-items/:id/status        admin only
```

### Matches

```text
GET   /api/matches                       admin only
PATCH /api/matches/:id/confirm           admin only
PATCH /api/matches/:id/reject            admin only
```

### Release

```text
POST /api/release/:matchId               admin only
```

### Admin dashboard

```text
GET /api/admin/dashboard                 admin only
```

## 7. Design patterns

### Observer Pattern

Location:

```text
patterns/observer/MatchSubject.js
patterns/observer/EmailMatchObserver.js
patterns/observer/ConsoleMatchObserver.js
services/matchNotifier.js
```

Usage:

When matching logic creates a possible match, it calls the subject. The subject notifies observers. One observer logs the match, and another sends/logs the notification email.

### Simple Factory Pattern

Location:

```text
patterns/factory/ItemFactory.js
patterns/factory/ItemCategory.js
```

Usage:

Controllers use `ItemFactory.createItem()` when creating lost or found item records. The factory returns category-specific objects such as `PhoneItem`, `WalletIdItem`, `BagItem`, etc.

## 8. Recommended Git commits for backend member

Do not push everything in one commit. Use clear commits:

```text
1. Add Express backend project structure
2. Add MongoDB models and database connection
3. Add authentication routes and controllers
4. Add lost report API and reference generator
5. Add admin found item API and dashboard route
6. Add matching service and Observer notification pattern
7. Add Simple Factory pattern for item categories
8. Connect frontend forms to backend API
9. Add README and final testing fixes
```
