#!/usr/bin/env bash
# Starts both the FastAPI backend and Next.js frontend for local dev.
set -e

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "Starting backend (FastAPI) on http://localhost:8000 ..."
(cd "$root/backend" && ./.venv/bin/python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000) &
backend_pid=$!

echo "Starting frontend (Next.js) on http://localhost:3000 ..."
(cd "$root/frontend" && npm run dev) &
frontend_pid=$!

echo ""
echo "Backend:  http://localhost:8000  (docs at /docs)"
echo "Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both."

trap "kill $backend_pid $frontend_pid 2>/dev/null" EXIT
wait
