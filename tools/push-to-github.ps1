# Push code lên GitHub — chạy trong cửa sổ PowerShell này
$ErrorActionPreference = "Continue"
chcp 65001 > $null
$env:PATH = "C:\Program Files\Git\ucrt64\bin;C:\Program Files\Git\cmd;C:\Program Files\Git\bin;" + $env:PATH
Set-Location (Join-Path $PSScriptRoot "..")

Write-Host ""
Write-Host "=== PUSH CODE LEN GITHUB ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Neu co cua so dang nhap GitHub hien ra -> bam 'Sign in' va lam theo." -ForegroundColor Yellow
Write-Host "Neu no hoi Username / Password trong cua so nay:" -ForegroundColor Yellow
Write-Host "  - Username: minhkhoi1516" -ForegroundColor Gray
Write-Host "  - Password: dan Personal Access Token (GitHub > Settings > Developer settings" -ForegroundColor Gray
Write-Host "              > Personal access tokens > Tokens (classic) > Generate new token," -ForegroundColor Gray
Write-Host "              tick 'repo'), KHONG phai mat khau thuong." -ForegroundColor Gray
Write-Host ""

git status -sb
Write-Host ""

git -c credential.helper=manager push origin main

Write-Host ""
if ($LASTEXITCODE -eq 0) {
    Write-Host "PUSH THANH CONG. Vercel se tu deploy trong ~1 phut." -ForegroundColor Green
    Write-Host "Mo: https://vercel.com/dashboard -> project -> Deployments de xem tien trinh." -ForegroundColor Green
} else {
    Write-Host "PUSH THAT BAI. Xem dong loi phia tren." -ForegroundColor Red
    Write-Host "Neu bao 'Authentication failed': token sai hoac het han -> tao token moi." -ForegroundColor Red
}
Write-Host ""
Read-Host "Nhan Enter de dong cua so"
