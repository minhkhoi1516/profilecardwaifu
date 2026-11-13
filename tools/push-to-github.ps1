# ==============================================================================
# MinKoi Studio · Quick Git Push Helper
# Runs standard git status and push to origin main.
# ==============================================================================
$ErrorActionPreference = "Continue"
try { [Console]::OutputEncoding = [System.Text.Encoding]::UTF8 } catch {}
Set-Location (Join-Path $PSScriptRoot "..")

Write-Host ""
Write-Host "=== MINKOI · PUSH TO GITHUB ===" -ForegroundColor Cyan
Write-Host ""
git status -sb
Write-Host ""

git push origin main

Write-Host ""
if ($LASTEXITCODE -eq 0) {
    Write-Host "Push succeeded. Vercel will trigger automatic production build." -ForegroundColor Green
} else {
    Write-Host "Push failed. Please check error output above or your git credentials." -ForegroundColor Red
}
Write-Host ""
