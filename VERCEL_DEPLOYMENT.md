# Vercel Deployment Guide

## How it is wired

| Path | Served by |
|------|-----------|
| `/api/*` | Serverless function `api/index.js` -> Express app in `server/server.js` |
| everything else | Static Vite build in `client/dist` (SPA fallback to `index.html`) |

`vercel.json` (project root) contains the build command, output directory and rewrites.
The root `package.json` lists the API dependencies that Vercel installs for the function.

## 1. Database

Vercel cannot reach MongoDB on your PC. Use MongoDB Atlas:
- Create a free cluster and a database user.
- Network Access -> allow `0.0.0.0/0` (Vercel uses dynamic IPs).
- Copy the connection string and add a database name, e.g.
  `mongodb+srv://USER:PASSWORD@CLUSTER.mongodb.net/expenses_tracker?retryWrites=true&w=majority`

## 2. Environment variables (Vercel -> Project -> Settings -> Environment Variables)

```text
MONGO_URI=<your Atlas connection string>
JWT_SECRET=<long random string>
JWT_EXPIRES_IN=7d
NODE_ENV=production
```

`CLIENT_URL` is optional (same-origin on Vercel). Do NOT set `VITE_API_URL`.
Redeploy after changing variables.

## 3. Deploy

Import the GitHub repo at https://vercel.com/new. Keep **Root Directory** as the repo root,
set **Framework Preset** to **Other**, and leave the build settings on defaults
(they come from `vercel.json`). Click **Deploy**.

Check `https://<your-project>.vercel.app/api/health` - it should return `{"success":true,...}`.

## Local development (unchanged)

```bash
cd server && npm install && npm run dev     # http://localhost:5000
cd client && npm install && npm run dev     # http://localhost:5173
```

Copy `server/.env.example` to `server/.env` and fill it in. Never commit `.env` files.
