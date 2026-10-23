# FindIt — MERN Stack ESE Project

Starter workspace for FindIt, with a Vite + React frontend and an Express API prepared for MongoDB through Mongoose.

## Start the frontend

From the project root (`C:\Users\rudra\OneDrive\Desktop\FindIt`):

```powershell
npm run dev
```

Open the local address Vite prints, usually `http://localhost:5173/`.

## Start the API

Open a second terminal at the project root and run:

```powershell
npm run api
```

To connect MongoDB, copy `backend/.env.example` to `backend/.env` and set `MONGODB_URI` to your local MongoDB URL or Atlas connection string. The API health check is at `http://localhost:5000/api/health`.

## Install dependencies again

If dependencies need reinstalling, run `npm install` in both the `frontend` and `backend` folders.

## Account data and administration

- Run both terminals above. MongoDB must be running before sign-up, sign-in, posting listings, or opening the admin dashboard.
- FindIt saves accounts and listings in the MongoDB database named in `MONGODB_URI` (the local default is `findit`). MongoDB Compass shows collections such as `users`, `sessions`, and `listings`.
- Passwords are saved as salted hashes. The original password cannot be read from MongoDB or the admin dashboard.
- The first administrator is selected with `ADMIN_EMAIL` in `backend/.env`. The local project is set to the existing owner email. Keep this setting private; the matching account receives admin access after the next sign-in.
- The Admin desk lets administrators see account/listing totals, hide or restore listings, and grant admin access to other accounts.
- Local password recovery creates a short-lived reset link in the browser. Email delivery must be configured before public deployment.
- Student status is not verified automatically. Email and college ID are collected as account details only.
