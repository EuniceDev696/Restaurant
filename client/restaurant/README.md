# Etoile Noir Restaurant App

## Run Locally

```powershell
cd c:\Users\eunic\Desktop\Restaurant\client\restaurant
npm install
npm run dev:full
```

- Frontend: `http://localhost:5173`
- Admin: `http://localhost:5173/admin`
- API: `http://localhost:4000/api`

## Production Notes

### 1. Single-service deploy

This app can be deployed as one Node service:

- `npm run build` creates the frontend in `dist/`
- `npm run start` starts the Express API and serves the built frontend from the same host
- Frontend API calls use `/api` in production automatically

### 2. Build frontend

```powershell
npm run build
```

Deploy the generated `dist/` folder using your host setup.

### 3. Run backend

```powershell
npm run start
```

Backend serves on `PORT` (default `4000`).

### 4. Environment variables

- `PORT`: API server port.
- `VITE_API_BASE_URL`: optional frontend API base URL.
  - If omitted:
    - dev uses `http://localhost:4000/api`
    - production uses `/api`
- `CORS_ORIGINS`: comma-separated allowed origins for API.
  - Example:
    - `https://your-frontend.com,https://www.your-frontend.com`
- `STORE_PATH`: optional absolute/relative file path for data JSON store.
  - Use this in production to control persistence location.

### 5. Health checks

- Liveness: `GET /api/health`
- Readiness: `GET /api/ready`

### 6. Render deploy

Repo root includes `render.yaml` for a single web service deploy.

If you deploy on Render:

1. Push this project to GitHub.
2. In Render, create a Blueprint deployment from the repo.
3. Render will build `client/restaurant`, run `npm run build`, and start the app with `npm start`.
4. Set `CORS_ORIGINS` only if you split frontend and backend across different domains.
5. Set `STORE_PATH` to a persistent disk mount if you need reservation/menu/event data to survive redeploys.

### 7. Persistence warning

The app uses a JSON file store by default. On hosts with ephemeral filesystems,
data can reset on restart/redeploy. For long-term production data, move to a
managed database.

## Images That Won't Break

Core site visuals now load from local files in `public/images`, so deployments
do not depend on external image URLs for hero/chef/gallery/closing backgrounds.

To replace images, use the exact file names listed in:

- `public/images/README.txt`
