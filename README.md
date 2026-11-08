# FindIt — Campus Lost & Found

FindIt is a MERN application for students to report lost or found belongings, browse campus reports, and privately verify ownership before arranging a handoff.

**Live demo:** [Open FindIt](https://findit-delta-cyan.vercel.app/)

## Features

- Student registration, sign-in, persistent sessions, profile editing, and password changes
- Lost and Found listings with categories, campus locations, descriptions, and optional photos
- Search and filters for report type, category, item text, and location
- Saved listings and a personal account area for reports and status updates
- Personalized matching between a signed-in student's active Lost reports and similar active Found reports
- Private ownership claims sent only to the Found reporter, with accept/decline review and a handoff contact path
- Admin dashboard for account/listing totals, role management, listing moderation, and removal
- MongoDB persistence through Mongoose.

## Database and environment

The backend reads backend/.env. The tracked backend/.env.example lists the required keys: PORT, CLIENT_URL, MONGODB_URI, and ADMIN_EMAIL. Keep the real .env private and never commit it. The local MongoDB connection uses the database name configured by MONGODB_URI.

The first administrator is selected by ADMIN_EMAIL; register that account with the matching email before the presentation. Student email and college ID are collected as profile details, but are not independently verified.

## Technical overview

- Frontend: React 19 and Vite
- Backend: Express 5 REST API
- Database: MongoDB with Mongoose models for users, sessions, listings, and claims
- Authentication: HTTP-only session cookie; passwords stored as salted hashes
- Matching: explainable weighted text/category/location similarity; it suggests candidates and does not establish ownership
- Claims: private details are returned only by authenticated claim inbox routes, never by the public listings route.
