# Gyanvatsala Library

This repo is split into two deployable apps:

- `client/`: React + Vite frontend for Vercel
- `server/`: Node + Express API for Render or Railway

## Local development

1. Copy `client/.env.example` to `client/.env`.
2. Copy `server/.env.example` to `server/.env`.
3. Install dependencies with `npm install`.
4. Run both apps from the repo root with `npm run dev`.

Frontend runs on `http://localhost:5173`.
Backend runs on `http://localhost:3001`.

## Deployment

### Vercel

1. Import this repo in Vercel.
2. Set the project Root Directory to `client`.
3. Set framework preset to Vite.
4. Add `VITE_API_BASE_URL` pointing to your deployed backend.
5. Add the remaining `VITE_*` frontend env vars.

### Render

1. Create a new Web Service from this repo.
2. Set Root Directory to `server`.
3. Build command: `npm install`
4. Start command: `npm start`
5. Add the server env vars from `server/.env.example`.
6. Set `FRONTEND_URL` to your Vercel app URL.
