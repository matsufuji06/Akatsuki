# Frontend

Vite + React + TypeScript frontend.

## Local development

```bash
npm install
npm run dev
```

Default API base URL in local development is:

- `http://127.0.0.1:8000/api/v1`

You can override this with build-time env:

- `VITE_API_BASE_URL`

## Runtime API base URL (for Elastic Beanstalk)

This app loads `/env-config.js` before bootstrapping React and reads:

- `window.__APP_CONFIG__.apiBaseUrl`

When deployed with `Dockerfile.eb`, the container entrypoint generates `/env-config.js`
from the runtime env var below:

- `API_BASE_URL`

Example value:

- `https://api.example.com/api/v1`

## Elastic Beanstalk deployment image

Use `Dockerfile.eb` for production deployment.

Features included:

- Multi-stage build (Node build -> Nginx runtime)
- SPA fallback (`try_files ... /index.html`) for direct route access
- Health endpoint (`GET /health`)
- Runtime API base URL injection via `API_BASE_URL`

To use this in EB, either:

1. set EB to build from `Dockerfile.eb` (or copy/rename it to `Dockerfile` in your deployment flow), or
2. build/push an image from `Dockerfile.eb` in CI and deploy that image.
