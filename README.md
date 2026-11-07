# FindIt — Campus Lost & Found

FindIt is a MERN application for students to report lost or found belongings, browse campus reports, and privately verify ownership before arranging a handoff.

## Working project location

The verified development copy is C:\Projects\FindIt. Open this folder in VS Code when running or editing the updated project. The separate OneDrive Desktop copy is preserved and does not contain the latest module changes.

## Features

- Student registration, sign-in, persistent sessions, profile editing, and password changes
- Lost and Found listings with categories, campus locations, descriptions, and optional photos
- Search and filters for report type, category, item text, and location
- Saved listings and a personal account area for reports and status updates
- Personalized matching between a signed-in student's active Lost reports and similar active Found reports
- Private ownership claims sent only to the Found reporter, with accept/decline review and a handoff contact path
- Admin dashboard for account/listing totals, role management, listing moderation, and removal
- MongoDB persistence through Mongoose

## Start FindIt in VS Code

Make sure MongoDB Server is running. Open C:\Projects\FindIt in VS Code, then start these in two integrated terminals:

Terminal 1 — API:

~~~powershell
cd C:\Projects\FindIt
npm.cmd run api
~~~

Terminal 2 — React/Vite frontend:

~~~powershell
cd C:\Projects\FindIt
npm.cmd run dev
~~~

The app is normally available at http://localhost:5173/. The API health endpoint is http://localhost:5000/api/health.

You can also use **Terminal → Run Task** and choose **FindIt: Start API**, **FindIt: Start Frontend**, or **FindIt: Build frontend**. Each task opens a dedicated VS Code terminal so its output is visible.

If your terminal is already in the backend folder, use:

~~~powershell
npm.cmd run api
~~~

The backend package also supports npm.cmd run dev. Do not start a second copy if the API is already listening on port 5000 or Vite is already using port 5173.

## Database and environment

The backend reads backend/.env. The tracked backend/.env.example lists the required keys: PORT, CLIENT_URL, MONGODB_URI, and ADMIN_EMAIL. Keep the real .env private and never commit it. The local MongoDB connection uses the database name configured by MONGODB_URI.

The first administrator is selected by ADMIN_EMAIL; register that account with the matching email before the presentation. Student email and college ID are collected as profile details, but are not independently verified.

## Presentation demo flow

1. Register two student accounts.
2. From the first account, post a Lost item.
3. From the second account, post the corresponding Found item using a matching category, item words, and location.
4. Open **Matches & claims** on the first account and review the similarity score and reasons.
5. Open the Found item and submit a private identifying detail that is not in the public description.
6. Sign in as the Found reporter, open **Matches & claims → Claim requests**, and accept or decline the request.
7. After arranging the real handoff, mark the report returned under **My account → My reports**.
8. For the admin demonstration, sign in with the configured administrator account and show dashboard totals and moderation controls.

The frontend contains no seeded listing records. Create real test reports in MongoDB for the demo, then remove them through the app after the presentation if they are no longer needed.

## Development checks

With the API running in another terminal and MongoDB connected, run the API smoke check from the root:

~~~powershell
cd C:\Projects\FindIt
npm.cmd run test:api
~~~

Run frontend checks:

~~~powershell
cd C:\Projects\FindIt\frontend
npm.cmd run lint
npm.cmd run build
~~~

## Technical overview

- Frontend: React 19 and Vite
- Backend: Express 5 REST API
- Database: MongoDB with Mongoose models for users, sessions, listings, and claims
- Authentication: HTTP-only session cookie; passwords stored as salted hashes
- Matching: explainable weighted text/category/location similarity; it suggests candidates and does not establish ownership
- Claims: private details are returned only by authenticated claim inbox routes, never by the public listings route

## Presentation notes and limits

See PRESENTATION_GUIDE.md for a timed demo and viva talking points. Account recovery email delivery is not configured for production. Campus identity is not verified automatically. Run the local app only with accounts and data you are authorized to use.