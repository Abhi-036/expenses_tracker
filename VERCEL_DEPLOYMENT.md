# Vercel Deployment Guide

## 1. Local development remains unchanged

Client:

```powershell
cd client
npm install
npm run dev
```

Open: `http://localhost:5173/`

Server:

```powershell
cd server
npm install
npm run dev
```

Expected server message:

```text
Server running in development mode on port 5000
```

API health check:

`http://localhost:5000/api/health`

## 2. Production database

Vercel cannot reach a MongoDB server running on your own PC. Create a MongoDB Atlas database and use its connection string as `MONGO_URI`.

Do not put the real production URI in this repository.

## 3. Vercel environment variables

Set these in the Vercel project for Production (and Preview if desired):

```text
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>/<database>?retryWrites=true&w=majority
JWT_SECRET=<long-random-production-secret>
JWT_EXPIRES_IN=7d
CLIENT_URL=https://<your-vercel-domain>
NODE_ENV=production
```

`VITE_API_URL` is not required for production because the frontend uses same-origin `/api` by default.

## 4. Deploy from the project root

Run these commands from the folder containing `vercel.json`:

```powershell
npm install -g vercel@latest
vercel login
vercel link
vercel deploy --prod
```

Do not deploy from only `client/` or only `server/` when using the included Vercel Services configuration.

## 5. Routing

- `/` and frontend routes -> `client`
- `/api` and `/api/*` -> `server`
- Backend routes keep their existing `/api/...` namespace.

No `/api` was removed from the Express routes.


## MongoDB note
The local development URI is `mongodb://127.0.0.1:27017/expenses_tracker`. This works when the server runs on your Windows PC. Vercel cannot connect to MongoDB running on your PC at `localhost`; production deployment requires a remotely reachable MongoDB instance.
