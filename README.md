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

### Render Single Web Service

If you want one Render Web Service to serve both the React frontend and the Express API:

1. Create a single Render `Web Service` from this repo.
2. Set `Root Directory` to the repo root.
3. Set `Build Command` to:
   - `npm install && npm run build`
4. Set `Start Command` to:
   - `npm start`
5. Add the required environment variables for the backend:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `VAPID_PUBLIC_KEY`
   - `VAPID_PRIVATE_KEY`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
6. Add the required public frontend variables too:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_CLOUDINARY_CLOUD_NAME`
   - `VITE_CLOUDINARY_UPLOAD_PRESET`
   - `VITE_SITE_URL=https://your-render-service.onrender.com`

For a single-service Render deployment, you can leave `VITE_API_BASE_URL` unset so the frontend uses relative `/api` requests on the same domain.

Behavior:

- `/` serves the built React app from `client/dist`
- `/api/...` serves backend APIs
- `/health` remains a health-check endpoint
- non-API routes fall back to React `index.html` so React Router works

### Render Blueprint

If you want both the frontend and backend on Render, do not create only a single Web Service.
Use the repo's [render.yaml](/Users/sakshisingh/Desktop/Frontend/react_js/LibararyManagment/render.yaml) as a Blueprint so Render creates:

- `gyanvatsala-library-web`: static site for the React frontend
- `gyanvatsala-library-api`: web service for the Express API

Steps:

1. Push the latest repo changes to GitHub.
2. In Render, choose `New` -> `Blueprint`.
3. Select this repository and branch.
4. Render will detect `render.yaml` and show both services.
5. Fill the required secret values when prompted:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_CLOUDINARY_CLOUD_NAME`
   - `VITE_CLOUDINARY_UPLOAD_PRESET`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `VAPID_PUBLIC_KEY`
   - `VAPID_PRIVATE_KEY`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
6. Deploy the Blueprint.

Notes:

- The backend root URL returns JSON by design because it is API-only.
- The actual website UI will be on the static site URL created for `gyanvatsala-library-web`.
- `render.yaml` automatically connects:
  - frontend `VITE_API_BASE_URL` -> backend public URL
  - backend `FRONTEND_URL` -> frontend public URL

### Vercel

1. Import this repo in Vercel.
2. Set the project Root Directory to `client`.
3. Set framework preset to Vite.
4. Add `VITE_API_BASE_URL` pointing to your deployed backend.
5. Add the remaining `VITE_*` frontend env vars.

### Render API Only

1. Create a new Web Service from this repo.
2. Set Root Directory to `server`.
3. Build command: `npm install`
4. Start command: `npm start`
5. Add the server env vars from `server/.env.example`.
6. Set `FRONTEND_URL` to your frontend app URL.
