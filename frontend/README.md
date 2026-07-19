# EMS Frontend

React 19 / Vite frontend for the API in the parent directory.

## Run

1. Copy `.env.example` to `.env` and set `VITE_API_URL` if the API is not at `http://localhost:5000/api/v1`.
2. Run `npm run dev` from this directory.

Authentication uses the backend's HttpOnly refresh cookie (`withCredentials`) and bearer access JWT. For local development, set the backend `CORS_ORIGIN` to `http://localhost:5173` rather than `*`, because credentialed CORS requests cannot use a wildcard origin in browsers.

## API limitations surfaced in the UI

- No employee self leave-history endpoint; employees can apply but cannot list their own requests.
- No settings endpoint, therefore Settings is intentionally read-only.
- No dashboard trends, recent attendance, monthly attendance, or server-side pagination/search/filter endpoints.
- Employee creation currently cannot complete because backend validation accepts a `department` string while the service expects a Prisma department relation; the backend build also fails because its schema lacks RBAC/audit models referenced in source.
