Railway deployment (Backend)

Files added
- Procfile: web: uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
- runtime.txt: python-3.11.9
- requirements.txt: added psycopg2-binary

Service settings
- Service type: Python
- Root directory: backend
- Build command: pip install -r requirements.txt
- Start command: uvicorn app.main:app --host 0.0.0.0 --port $PORT

Environment variables
- DATABASE_URL: Railway Postgres URL (auto-injected if Postgres plugin attached)
- ALLOWED_ORIGINS: https://<your-vercel-app>.vercel.app,https://*.vercel.app

Note: SQLite fallback is used when DATABASE_URL is not set.

