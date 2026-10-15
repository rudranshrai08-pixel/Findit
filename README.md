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
