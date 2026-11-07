# FindIt Hosting Setup

This repository is prepared for a simple hosted layout:

- **Frontend:** Vercel, using the `frontend` directory.
- **API:** Render Web Service, using the `backend` directory.
- **Database:** MongoDB Atlas Free cluster.
- **API routing:** Vercel rewrites `/api/...` to the Render API. The browser continues to call same-origin `/api` URLs, which also lets the HTTP-only session cookie belong to the Vercel site.

The API listener is configured for Render’s public interface and its injected `PORT`. `frontend/vercel.json` contains the Vercel rewrite. Its destination currently assumes the Render service URL `https://findit-api.onrender.com`; if Render assigns a different URL, update that destination before deploying Vercel.

## 1. Prepare MongoDB Atlas

1. Create an Atlas project and a Free cluster.
2. Create a database user with a strong, unique password.
3. Add an Atlas Network Access entry that permits the Render service to connect. Render Free does not provide a fixed outbound IP for this setup, so Atlas may require a broad IP rule. A rule such as `0.0.0.0/0` allows network connection attempts from any address; use a strong database password, least-privilege database user, and do not use this arrangement for sensitive production data. For stricter network controls, use a host with fixed outbound IPs or private networking.
4. Copy the Atlas application connection string. Replace the password placeholder, and include `/findit` as the database path if it is not already present.
5. Do not place the connection string in source code, this guide, or GitHub. Add it only as the Render `MONGODB_URI` environment variable.

## 2. Deploy the API on Render

1. In Render, create a **New Web Service** and connect the GitHub repository `rudranshrai08-pixel/Findit`.
2. Set the service name to `findit-api` if available. The Vercel rewrite assumes this name and URL.
3. Set **Root Directory** to `backend`.
4. Set **Build Command** to `npm install`.
5. Set **Start Command** to `npm start`.
6. Add environment variables:

   | Key | Value |
   |---|---|
   | `MONGODB_URI` | Atlas application connection string, with database path `/findit` |
   | `ADMIN_EMAIL` | Email address that should receive the first administrator role |
   | `CLIENT_URL` | Fill this in after creating the Vercel project; use its exact HTTPS origin |

   Render supplies `PORT`; do not hardcode a port in its dashboard.

7. Deploy. Copy the public service URL. Open `<render-url>/api/health`; the API should return `status: "ok"` and `database: "connected"`.
8. If the URL is not `https://findit-api.onrender.com`, edit `frontend/vercel.json` and replace the hostname in the rewrite destination with the actual Render URL. Keep `/api/:path*` at the end.

## 3. Deploy the frontend on Vercel

1. In Vercel, add a project and import the same GitHub repository.
2. Set **Root Directory** to `frontend`.
3. Select the Vite framework preset. The expected build command is `npm run build` and output directory is `dist`.
4. No frontend API environment variable is required; the app requests `/api/...`, and `frontend/vercel.json` proxies those requests to Render.
5. Deploy and copy the Vercel HTTPS origin (for example, `https://findit-example.vercel.app`).
6. Return to Render and set `CLIENT_URL` to that exact origin, without a trailing slash. Redeploy the API so CORS uses the new origin.

## 4. Verify the live deployment

1. Open the Vercel site. Check that public listings load.
2. Register or sign in with a test account; refresh and confirm the session remains active.
3. Create test Lost and Found reports, then check **Matches & claims** and submit/review a claim.
4. Check the Render logs if an API request fails. Check Atlas database user credentials and Network Access if `/api/health` reports a database failure.
5. The Render Free service may sleep after inactivity and take time to wake on its next request. Free tier quotas, availability, and terms can change; confirm current provider limits before relying on the app.

## 5. Security and data notes

- The existing local `backend/.env` is ignored by Git. Never commit it or paste its values into a public issue or screenshot.
- Use a fresh Atlas database user password, not a school, GitHub, or other service password.
- Keep the admin email and database credentials private. Restrict Atlas network access as much as your host plan permits.
- Treat this free-tier configuration as a classroom/demo deployment. Production use needs an access-controlled database network, operational monitoring, backups, email delivery for password reset, and a review of cookie/CORS and deployment security.
- The application does not automatically verify campus identity. Only use test data or personal data you are authorized to store.

## 6. Push deployment configuration

From the project root in the VS Code terminal:

```powershell
git add backend/src/server.js frontend/vercel.json DEPLOYMENT_GUIDE.md
git commit -m "Prepare FindIt for Vercel and Render deployment"
git push origin main
```

Then connect the repository in Render and Vercel as described above. If the Render URL differs from the assumed URL, update `frontend/vercel.json` and push that adjustment before deploying/redeploying the Vercel frontend.
