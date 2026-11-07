# FindIt presentation notes

## What the app does

FindIt helps a campus community report and search lost or found belongings. Students can submit a private ownership claim when a Found report looks like their item. The person who reported the find reviews that claim before the two students arrange a handoff.

## Frontend modules

- src/App.jsx controls the signed-in app, search, filters, navigation, and modals.
- src/api/auth.js and src/api/listings.js call the Express API with session cookies.
- src/data/listings.js contains category names only. Listings are fetched from MongoDB; there are no frontend sample records.
- src/components/ListingCard.jsx displays a persisted listing.
- src/components/ReportModal.jsx collects a Lost or Found report and optional photo.
- src/components/ClaimsHub.jsx shows private matches and incoming/outgoing claim status.
- src/components/ItemDetailModal.jsx displays report details and submits private claims.
- src/components/ProfileModal.jsx handles profile, saved items, reports, and security.
- src/components/AdminDashboard.jsx provides moderation and account controls.
- src/App.css, src/components/auth.css, and src/components/admin.css style the app.

## Backend and data flow

The React app sends JSON requests to the Express API. Vite proxies /api calls to port 5000 during local development. Express authenticates signed-in requests with an HTTP-only session cookie and stores user, session, listing, and claim records in MongoDB through Mongoose.

The matching route compares a student's active Lost reports with active Found reports. Its score uses category, title words, description words, and location overlap. It is a suggestion for a human to review, not an automatic ownership decision.

Claim details are private: authenticated users can see their own sent claims, and the Found reporter can review claims for their listing. Public listing responses never contain the private claim text. After a reporter accepts, the two users get a contact path; the listing remains active until the reporter marks it returned after the handoff.

## Main API groups

- /api/auth/* — registration, sign-in/out, profile, saved reports, matches, and claim inbox
- /api/listings — public active listings, signed-in report creation, poster contact, and private claim submission
- /api/admin/* — administrator dashboard, roles, and listing moderation
- /api/health — API and database connection status

## Limits to explain honestly

- College email and college ID are collected but not verified against a campus identity provider.
- Password reset links work locally; production email delivery needs an email provider.
- Similarity scores rank candidates and can produce false positives or miss a match.
- A claim is a private conversation starter; students should meet in a safe public place and decide whether the item is theirs.