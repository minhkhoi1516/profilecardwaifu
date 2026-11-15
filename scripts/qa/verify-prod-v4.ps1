# Live smoke tests. Browser emulation does not prove physical-device behavior.
param([string]$TargetUrl = 'https://pro5-waifu-minkoi.vercel.app/')
$ErrorActionPreference = 'Stop'
$previousBaseUrl = $env:BASE_URL
try {
    $env:BASE_URL = $TargetUrl
    node node_modules/@playwright/test/cli.js test --grep '390x844|1440x900|playback, immediate|Zen mobile|Android desktop-site'
    if ($LASTEXITCODE -ne 0) { throw "Production smoke test failed: $TargetUrl" }
} finally {
    $env:BASE_URL = $previousBaseUrl
}
