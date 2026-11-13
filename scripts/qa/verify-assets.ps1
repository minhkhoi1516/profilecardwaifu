# ==============================================================================
# MinKoi Studio · Asset & Dependency Integrity Verification
# Validates that all personas, banners, audio files, and scripts exist on disk.
# ==============================================================================
$ErrorActionPreference = 'Stop'
$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot '..\..')
Set-Location $RepoRoot

Write-Host "Running MinKoi Asset & Route Integrity Check..." -ForegroundColor Cyan

$failed = 0
function Assert-Exists($path, $label) {
    if (Test-Path $path) {
        Write-Host "  [OK] $label : $path" -ForegroundColor Green
    } else {
        Write-Host "  [FAIL] $label : $path NOT FOUND" -ForegroundColor Red
        $script:failed++
    }
}

# 1. Essential Core Files
Write-Host "`n1. Checking Core Web Entrypoints..." -ForegroundColor Yellow
Assert-Exists 'index.html' 'HTML Entrypoint'
Assert-Exists 'manifest.webmanifest' 'Web App Manifest'
Assert-Exists 'vercel.json' 'Vercel Configuration'
Assert-Exists 'favicon.ico' 'Favicon Icon'

# 2. Stylesheets
Write-Host "`n2. Checking Stylesheets..." -ForegroundColor Yellow
$cssFiles = @(
    'css/style-base.css',
    'css/style-backgrounds.css',
    'css/style-card.css',
    'css/style-left.css',
    'css/style-right.css',
    'css/style-responsive.css',
    'css/tokens-v3.css'
)
foreach ($c in $cssFiles) {
    Assert-Exists $c 'Stylesheet'
}

# 3. JavaScript Modules
Write-Host "`n3. Checking JavaScript Architecture..." -ForegroundColor Yellow
$jsFiles = @(
    'js/config.js',
    'js/ui/spring.js',
    'js/ui/squircle.js',
    'js/ui/components.js',
    'js/stars.js',
    'js/fluid-bg.js',
    'js/avatar.js',
    'js/music.js',
    'js/snapshot.js',
    'js/features.js',
    'js/lyrics/normalizer.js',
    'js/lyrics/parser.js',
    'js/lyrics/matcher.js',
    'js/lyrics/cache.js',
    'js/lyrics/diagnostics.js',
    'js/lyrics/repository.js',
    'js/lyrics/provider.js',
    'js/lyrics/sync-engine.js',
    'js/lyrics/renderer.js',
    'js/lyrics/editor.js',
    'js/lyrics/index.js'
)
foreach ($j in $jsFiles) {
    Assert-Exists $j 'JavaScript Module'
}

# 4. Persona Avatars and Banners
Write-Host "`n4. Checking Persona Assets (8 Waifus)..." -ForegroundColor Yellow
$personaBanners = @{
    'alya' = 'alya'
    'hinako' = 'hinako'
    'kaoruko' = 'kaoruko'
    'mahiru' = 'mahiru'
    'nakanomiku' = 'nakanomiku'
    'sakuramiku' = 'sakuramiku'
    'shinobu' = 'shinobuuzuki'
    'umi' = 'umi'
}
foreach ($p in $personaBanners.Keys) {
    $bannerPrefix = $personaBanners[$p]
    Assert-Exists "assets/avatar_${p}.png" "Avatar for $p"
    Assert-Exists "assets/banner_${bannerPrefix}_pc.jpg" "PC Banner for $p"
    Assert-Exists "assets/banner_${bannerPrefix}_phone.jpg" "Phone Banner for $p"
}

# 5. Audio Tracks
Write-Host "`n5. Checking Audio Library (music/*.mp3)..." -ForegroundColor Yellow
$mp3Files = Get-ChildItem -Path 'music' -Filter '*.mp3'
if ($mp3Files.Count -ge 31) {
    Write-Host "  [OK] Found $($mp3Files.Count) MP3 audio tracks in music/ directory" -ForegroundColor Green
} else {
    Write-Host "  [FAIL] Expected at least 31 MP3 tracks, found $($mp3Files.Count)" -ForegroundColor Red
    $failed++
}

# 6. Test Suite Runner
Write-Host "`n6. Checking Test Suites..." -ForegroundColor Yellow
Assert-Exists 'tests/lyrics-v2.test.html' 'Lyrics Unit Test Runner'

Write-Host "`n=========================================================="
if ($failed -eq 0) {
    Write-Host "ALL ASSET AND DEPENDENCY CHECKS PASSED (0 Errors)" -ForegroundColor Green
    exit 0
} else {
    Write-Host "INTEGRITY CHECK FAILED ($failed Errors Found)" -ForegroundColor Red
    exit 1
}
