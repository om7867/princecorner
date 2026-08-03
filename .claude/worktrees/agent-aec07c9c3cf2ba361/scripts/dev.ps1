# Starts both the FastAPI backend and Next.js frontend for local dev.
# Run from anywhere; paths are resolved relative to this script.

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$backend = Join-Path $root "backend"
$frontend = Join-Path $root "frontend"

Write-Host "Starting backend (FastAPI) on http://localhost:8000 ..."
$backendJob = Start-Job -ScriptBlock {
    param($backendPath)
    Set-Location $backendPath
    & "$backendPath\.venv\Scripts\python.exe" -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
} -ArgumentList $backend

Write-Host "Starting frontend (Next.js) on http://localhost:3000 ..."
$frontendJob = Start-Job -ScriptBlock {
    param($frontendPath)
    Set-Location $frontendPath
    npm run dev
} -ArgumentList $frontend

Write-Host ""
Write-Host "Backend:  http://localhost:8000  (docs at /docs)"
Write-Host "Frontend: http://localhost:3000"
Write-Host ""
Write-Host "Press Ctrl+C to stop watching logs (servers keep running as background jobs)."
Write-Host "Stop them with: Stop-Job $($backendJob.Id),$($frontendJob.Id); Remove-Job $($backendJob.Id),$($frontendJob.Id)"
Write-Host ""

try {
    Receive-Job -Job $backendJob, $frontendJob -Wait
} finally {
    Write-Host "Detached from logs. Jobs $($backendJob.Id) (backend) and $($frontendJob.Id) (frontend) are still running."
}
