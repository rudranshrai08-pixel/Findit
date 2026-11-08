# FindIt Project Explanation and Demonstration Guide

## 1. Project summary

FindIt is a campus lost-and-found web application. Students can report lost or found belongings, browse and search campus reports, save useful listings, receive suggestions that compare their Lost reports with Found reports, and privately submit ownership claims. The person who posted the Found report can review a claim and accept or decline it. Administrators can review listings and account roles.

The project uses a React and Vite frontend, an Express API running on Node.js, and MongoDB accessed through Mongoose. The browser calls the API; the API validates requests, applies access rules, and reads or writes the database.

## 2. Why the backend has only a few files

The backend is intentionally compact. Its application logic is concentrated in `backend/src/server.js`: that file creates the Express app, defines Mongoose schemas, contains authentication and access helpers, defines the API routes, and starts the server and MongoDB connection. This suits a small student project because the request flow is easy to trace in one place and there is little folder or dependency overhead.

The backend still has separate supporting files where they help:

- `backend/package.json` defines backend dependencies and commands.
- `backend/package-lock.json` records the resolved dependency versions for repeatable installs.
- `backend/scripts/api-smoke-test.js` checks the running API’s health, listing privacy boundary, and signed-in route guards.
- `backend/.env.example` documents configuration keys without publishing private values. The real `backend/.env` is local configuration and must stay untracked.

The data models are schemas in `server.js`, rather than separate model files. The API routes and helpers are also in `server.js`, rather than separate controllers and route modules. That is a deliberate small-project tradeoff, not an indication that the backend is missing: it contains the server-side rules and database operations. If the product grows, the server can be split into `models/`, `routes/`, `middleware/`, and `services/` without changing the overall architecture.

## 3. Main parts and responsibilities

### Frontend

- `frontend/src/main.jsx` mounts the React application.
- `frontend/src/App.jsx` coordinates the main screen, account state, listing display and filtering, navigation, and the dialogs that open from the main app.
- `frontend/src/api/auth.js` provides the shared API request helper and account-related API calls. Requests include the session cookie with `credentials: 'include'`.
- `frontend/src/api/listings.js` provides listing, contact, and claim API calls.
- `frontend/src/components/` contains focused interface units such as registration, login, report creation, item details, claims, and the admin dashboard.
- `frontend/src/App.css`, `frontend/src/index.css`, and component CSS files provide visual styling.
- `frontend/src/data/listings.js` contains frontend listing data/helpers; the README says there are no seeded listing records, so demo listings should be created in the running app.

### Backend and database

The Mongoose schemas in `backend/src/server.js` describe four persisted record types:

- **User:** student profile, salted password hash, role, saved listing IDs, and password-reset token fields.
- **Session:** a hashed session token tied to a user and an expiry time.
- **Listing:** Lost or Found report, category, location, description, optional photo, reporter, and status.
- **Claim:** claimant, Found-listing owner, listing, private ownership detail, and review status. A unique index prevents the same claimant from creating duplicate claims for the same listing.

The API uses HTTP-only session cookies. Passwords are hashed with a per-password salt; the original password is not stored as a plain-text database field. Server helpers produce public user/listing representations and enforce signed-in and admin access. Public listing responses omit private claim details. Claim inbox responses are available only to the parties involved.

The matching logic compares active Lost and Found reports and returns a similarity score with reasons. A suggestion is only a lead for students to inspect; it does not prove ownership.

## 4. Why `ClaimsHub` exists in the frontend

`frontend/src/components/ClaimsHub.jsx` is a dedicated workspace for two connected tasks that signed-in students need to revisit:

1. **Potential matches:** show suggested Found reports alongside the student’s Lost report, a similarity score, and the reasons for the suggestion.
2. **Claim requests:** show incoming and outgoing claims, private identifying details, status, and the action for a Found reporter to accept or decline a pending request.

These tasks belong together because a match may lead to a claim, and the student needs one place to track what happened afterward. Keeping the UI in `ClaimsHub` avoids putting match lists, two-way claim inboxes, loading/error states, and review actions directly into the already large `App.jsx`. `App.jsx` opens the hub for a signed-in user; the hub loads its data from the authenticated API and handles its tabs and refresh/review interactions. The backend remains responsible for deciding who may read or change claim records—the frontend display alone is not the security boundary.

The private detail is entered from the item detail dialog in `ItemDetailModal.jsx`, then sent to the API as a claim. It is not part of the public listing description. Only after the Found reporter accepts a claim does the API expose the other party’s email in the relevant claim response, enabling contact to arrange a handoff.

## 5. Important user journeys

### A. Create accounts and report an item

1. Open the app and register a student account.
2. Sign in, choose the report action, and submit a Lost or Found report with a clear title, category, campus place, and description. Add a photo if desired.
3. FindIt sends the report to the API, which checks the request and stores the listing in MongoDB.
4. The listing appears on the campus board and can be searched or filtered.

### B. Find a likely match

1. Account A posts a Lost report.
2. Account B posts the corresponding Found report using comparable item words, category, and location.
3. Account A opens **Matches & claims** and selects **Potential matches**.
4. FindIt compares active Lost and Found reports, then shows a score and match reasons.
5. Account A opens the suggested Found report to inspect it. A high score is a prompt to investigate, not proof that the item is theirs.

### C. Submit and review a private claim

1. From the Found listing, the possible owner selects **Make a private claim**.
2. They provide a detail that was intentionally left out of the public report—for example, a distinctive mark or an item inside the bag.
3. The API stores this detail in a Claim record and associates it with the claimant, listing, and Found reporter.
4. The Found reporter signs in and opens **Matches & claims → Claim requests → Incoming**.
5. The reporter reviews the private detail and accepts or declines the claim.
6. After acceptance, the parties can use the exposed contact path to arrange a real-world handoff. They should mark the report returned/resolved after the handoff is complete.

### D. Manage the account and reports

The signed-in user can review their own reports and update their status, save listings, edit profile information, and change their password. Saved reports and user data are associated with the account in the backend.

### E. Admin review

The administrator opens the admin dashboard after signing in with the configured administrator account. The dashboard presents summary counts and account/listing management. The backend checks the admin role on protected routes, so hiding an admin button in the UI is not the security control. Configure `ADMIN_EMAIL` in the backend environment for the primary administrator, and never put credentials in tracked source files.

## 6. Step-by-step presentation plan

### Before the presentation

1. Open `C:\Projects\FindIt` in VS Code.
2. Make sure MongoDB is available and `backend/.env` contains the required local settings (`PORT`, `CLIENT_URL`, `MONGODB_URI`, and `ADMIN_EMAIL`). Keep the actual values private.
3. In one VS Code terminal, run `npm.cmd run api` from the project root.
4. In a second terminal, run `npm.cmd run dev` from the project root. Open the Vite URL shown in the terminal (normally `http://localhost:5173/`).
5. Create two student accounts and populate a small, coherent demo: one Lost report and one matching Found report. Also prepare an administrator account using the configured admin email. The project has no seeded listing data.
6. Run the frontend checks from `frontend`: `npm.cmd run lint` and `npm.cmd run build`. With the API and MongoDB running, run `npm.cmd run test:api` from the root.

### Live demo sequence

1. **Introduce the problem:** campus belongings are difficult to reunite when reports are scattered or lack a safe ownership check.
2. **Show the board:** browse Lost and Found posts, then demonstrate search/filtering and a listing detail.
3. **Show reporting:** explain the fields and submit or show a Lost/Found report.
4. **Show matching:** sign in as the account with the Lost report, open **Matches & claims**, and explain the score and reasons.
5. **Show privacy-aware claiming:** open a Found report, enter a private identifying detail, and explain why it is kept out of the public description.
6. **Show the reporter’s review:** sign in as the Found reporter, open the incoming claim, and accept or decline it. Explain the handoff contact path after acceptance.
7. **Show personal tools:** point out saved listings and the user’s report/status area.
8. **Show admin controls:** sign in with the administrator account, show dashboard totals, and demonstrate a listing moderation or account-role control.
9. **Close with architecture:** browser UI → Express API → MongoDB, with the API enforcing authentication, authorization, and claim privacy.

## 7. Suggested spoken explanation

“FindIt is a campus lost-and-found app built with React, Express, and MongoDB. Students create Lost and Found reports and can browse or filter the board. The matching feature compares active Lost reports with active Found reports and explains why a pair looks similar. It only suggests candidates; it does not decide ownership. A possible owner submits a private detail as a claim, and the person who posted the Found report reviews it. We keep that workflow in the ClaimsHub component because students need one place to see matches and track incoming or outgoing claims. The backend checks the session and claim participants before returning private claim data. It is compact because this is a focused project: the Express app, Mongoose schemas, helpers, and routes are currently organized in one server file, while the smoke check and package configuration are separate. If the API grows, those responsibilities can be split into modules.”

## 8. API and security explanation

The API groups routes by capability: authentication and profile, personal reports and saved items, public listings, matching, claims, and admin operations. For example, `/api/auth/matches` requires a signed-in user, while `/api/listings` is the public listing feed. Claim submission is tied to a listing, and claim review checks that the signed-in user is the Found reporter. Admin routes require administrator access. These server checks matter because browser code can be inspected or altered by a user.

Sessions are stored server-side with hashed tokens and delivered using an HTTP-only cookie. Public listing serialization and claim serialization are separate: this helps prevent private ownership details from accidentally appearing in the public feed. The smoke test checks these key boundaries against a running API and connected MongoDB.

## 9. Known scope and limitations

- A match score is a suggestion and must be verified by people.
- College email/college ID fields are collected, but campus identity is not automatically verified.
- Password reset routes exist, but production email delivery is not configured; the README notes this limitation.
- A real deployment needs production-grade environment secrets, HTTPS, database backups, operational monitoring, and a configured email provider.
- This guide describes the current project implementation; the backend is intentionally compact and can be modularized if the feature set grows.

## 10. File map

| Path | What it is for |
|---|---|
| `package.json` | Root commands for frontend, API, build, and API smoke test |
| `backend/src/server.js` | Express server, MongoDB connection, schemas, security helpers, matching logic, and API routes |
| `backend/scripts/api-smoke-test.js` | Checks API health, listing privacy, and authentication guards |
| `backend/.env.example` | Names and examples of required server configuration keys |
| `frontend/src/main.jsx` | React entry point |
| `frontend/src/App.jsx` | Main application state and screen composition |
| `frontend/src/api/auth.js` | Shared API request helper and authenticated user calls |
| `frontend/src/api/listings.js` | Listing and claim submission calls |
| `frontend/src/components/ClaimsHub.jsx` | Potential match and claim inbox workspace |
| `frontend/src/components/ItemDetailModal.jsx` | Listing details and private claim form |
| `frontend/src/components/AdminDashboard.jsx` | Admin overview and management UI |
| `PRESENTATION_GUIDE.md` | Short presentation timing and viva talking points |
| `PROJECT_EXPLANATION_GUIDE.md` | Full architecture and step-by-step explanation guide |

