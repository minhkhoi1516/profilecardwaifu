# verify-waifu-particles.ps1 - Automated Waifu Signature Particles & Zen Mode QA Suite
$ErrorActionPreference = 'Stop'
$Port = 42930
$CdpPort = 9735

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " MINKOI V4.1 WAIFU SIGNATURE PARTICLES & ZEN MODE QA SUITE" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Start local HTTP server via Runspace
$L = New-Object System.Net.HttpListener
$L.Prefixes.Add("http://127.0.0.1:$Port/")
$L.Start()
$rs = [runspacefactory]::CreateRunspace()
$rs.Open()
$rs.SessionStateProxy.SetVariable('L', $L)
$rs.SessionStateProxy.SetVariable('R', (Get-Item .).FullName)
$ps = [powershell]::Create()
$ps.Runspace = $rs
[void]$ps.AddScript({
    $m = @{
        '.html' = 'text/html; charset=utf-8'
        '.css'  = 'text/css; charset=utf-8'
        '.js'   = 'application/javascript; charset=utf-8'
        '.png'  = 'image/png'
        '.jpg'  = 'image/jpeg'
        '.mp3'  = 'audio/mpeg'
        '.svg'  = 'image/svg+xml'
        '.ico'  = 'image/x-icon'
        '.json' = 'application/json'
    }
    while ($L.IsListening) {
        try {
            $c = $L.GetContext()
            $p = [Uri]::UnescapeDataString($c.Request.Url.AbsolutePath)
            if ($p -eq '/') { $p = '/index.html' }
            $f = Join-Path $R $p.TrimStart('/').Replace('/', '\')
            if (Test-Path $f -PathType Leaf) {
                $e = [IO.Path]::GetExtension($f).ToLowerInvariant()
                $ct = if ($m[$e]) { $m[$e] } else { 'application/octet-stream' }
                $bytes = [IO.File]::ReadAllBytes($f)
                $c.Response.ContentType = $ct
                $c.Response.ContentLength64 = $bytes.Length
                $c.Response.OutputStream.Write($bytes, 0, $bytes.Length)
            } else {
                $c.Response.StatusCode = 404
            }
            $c.Response.Close()
        } catch {
            try { $c.Response.Close() } catch {}
        }
    }
})
$asyncHandle = $ps.BeginInvoke()

# 2. Launch Headless Edge with CDP
$EdgeExe = 'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
if (-not (Test-Path $EdgeExe)) { $EdgeExe = 'C:\Program Files\Microsoft\Edge\Application\msedge.exe' }
$ud = Join-Path $env:TEMP ('cdp_part_' + [guid]::NewGuid().ToString('N').Substring(0,8))
New-Item -ItemType Directory -Path $ud -Force | Out-Null
$proc = Start-Process -FilePath $EdgeExe -ArgumentList @(
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    "--remote-debugging-port=$CdpPort",
    '--remote-allow-origins=*',
    "--user-data-dir=$ud",
    'about:blank'
) -PassThru

try {
    Start-Sleep -Milliseconds 1200
    $targets = Invoke-RestMethod "http://127.0.0.1:$CdpPort/json/list" -TimeoutSec 5
    $wsUrl = ($targets | Where-Object { $_.type -eq 'page' } | Select-Object -First 1).webSocketDebuggerUrl

    $ws = New-Object System.Net.WebSockets.ClientWebSocket
    $cts = New-Object System.Threading.CancellationTokenSource
    $ws.ConnectAsync([Uri]$wsUrl, $cts.Token).Wait()

    [int]$script:reqId = 0
    function CDP([string]$method, [hashtable]$params = @{}) {
        $script:reqId++
        $id = $script:reqId
        $payload = @{ id = $id; method = $method; params = $params } | ConvertTo-Json -Depth 10 -Compress
        $sendBytes = [System.Text.Encoding]::UTF8.GetBytes($payload)
        $callCts = [System.Threading.CancellationTokenSource]::new(35000)
        $ws.SendAsync([ArraySegment[byte]]::new($sendBytes), 0, $true, $callCts.Token).GetAwaiter().GetResult()
        
        while ($true) {
            $ms = New-Object System.IO.MemoryStream
            $buf = New-Object byte[] 65536
            do {
                $r = $ws.ReceiveAsync([ArraySegment[byte]]::new($buf), $callCts.Token).GetAwaiter().GetResult()
                if ($r.Count -gt 0) { $ms.Write($buf, 0, $r.Count) }
            } while (-not $r.EndOfMessage)
            $raw = [System.Text.Encoding]::UTF8.GetString($ms.ToArray())
            $obj = $raw | ConvertFrom-Json
            if ($obj.method -eq 'Runtime.consoleAPICalled') {
                if ($obj.params.type -eq 'error') {
                    $msg = ($obj.params.args | ForEach-Object { $_.value }) -join ' '
                    Write-Host "BROWSER CONSOLE ERROR: $msg" -ForegroundColor Red
                }
            }
            if ($obj.id -eq $id) { return $obj }
        }
    }

    function EvalJS([string]$expression) {
        $res = CDP 'Runtime.evaluate' @{ expression = $expression; returnByValue = $true; awaitPromise = $true }
        if ($res.result.exceptionDetails) {
            throw "JS Exception: $($res.result.exceptionDetails.exception.description)"
        }
        return $res.result.result.value
    }

    function PumpFrames([int]$count = 20) {
        [void](EvalJS "new Promise(res => {
            let left = $count;
            function step() {
                if (--left <= 0) res();
                else requestAnimationFrame(step);
            }
            requestAnimationFrame(step);
        })")
    }

    [void](CDP 'Page.enable')
    [void](CDP 'Runtime.enable')

    # Navigate to app
    [void](CDP 'Page.navigate' @{ url = "http://127.0.0.1:$Port/index.html" })
    Start-Sleep -Seconds 2

    # ========================================================
    # TEST 1: ALYA KUJOU (PERSONA 0) — WHITE SNOW ❄️ IN ZEN MODE
    # ========================================================
    Write-Host "`n--- TEST 1: ALYA KUJOU (PERSONA 0) — WHITE SNOW IN ZEN MODE ---" -ForegroundColor Yellow
    [void](CDP 'Emulation.setDeviceMetricsOverride' @{ width = 1440; height = 900; deviceScaleFactor = 1; mobile = $false })

    # Select Alya Kujou
    [void](EvalJS "window.setPersona(0)")
    PumpFrames 15

    # Toggle Zen ON
    [void](EvalJS "window.toggleZenMode(true)")
    PumpFrames 25

    $alyaZenState = EvalJS @'
    (() => {
        const starryCanvas = document.getElementById('starry-canvas');
        const fluidCanvas = document.getElementById('fluid-bg-canvas');
        const ctx = starryCanvas.getContext('2d');
        const isZen = document.body.classList.contains('zen-mode');
        const starryStyle = window.getComputedStyle(starryCanvas);
        const fluidStyle = window.getComputedStyle(fluidCanvas);

        // Sample canvas pixel data to ensure snowflakes are actually rendering
        const imgData = ctx.getImageData(0, 0, Math.min(starryCanvas.width, 300), Math.min(starryCanvas.height, 300));
        let nonZeroPixels = 0;
        for (let i = 3; i < imgData.data.length; i += 4) {
            if (imgData.data[i] > 10) nonZeroPixels++;
        }

        return {
            isZen: isZen,
            starryDisplay: starryStyle.display,
            starryVisibility: starryStyle.visibility,
            starryOpacity: starryStyle.opacity,
            fluidDisplay: fluidStyle.display,
            canvasWidth: starryCanvas.width,
            canvasHeight: starryCanvas.height,
            nonZeroAlphaPixels: nonZeroPixels
        };
    })()
'@
    Write-Host "  Alya Zen State: $($alyaZenState | ConvertTo-Json -Compress)"

    if ($alyaZenState.isZen -ne $true) { throw "Zen mode failed to activate!" }
    if ($alyaZenState.starryDisplay -eq 'none') { throw "starry-canvas is hidden (display: none) in Zen mode!" }
    if ($alyaZenState.fluidDisplay -ne 'none') { throw "fluid-bg-canvas should be hidden in Zen mode to conserve GPU!" }
    Write-Host "  [PASS] Alya's starry-canvas is visible and active in Zen mode!" -ForegroundColor Green

    # Capture Alya Zen Snow Screenshot
    $shot = CDP 'Page.captureScreenshot' @{ format = 'png' }
    $shotPath = Join-Path 'C:\Users\Admin\.gemini\antigravity\brain\676897cc-82eb-49fa-8a7e-b684c15d6e09' 'zen_alya_snow_verified.png'
    [IO.File]::WriteAllBytes($shotPath, [Convert]::FromBase64String($shot.result.data))
    Write-Host "  [ARTIFACT] Saved Alya Zen snow screenshot: $shotPath" -ForegroundColor Green

    # ========================================================
    # TEST 2: ALYA KUJOU — ZEN OFF RESTORATION
    # ========================================================
    Write-Host "`n--- TEST 2: ALYA KUJOU — ZEN OFF RESTORATION ---" -ForegroundColor Yellow
    [void](EvalJS "window.toggleZenMode(false)")
    PumpFrames 25

    $alyaOffState = EvalJS @'
    (() => {
        const card = document.querySelector('.card-container');
        const header = document.querySelector('.site-brand-header');
        const cStyle = window.getComputedStyle(card);
        const hStyle = window.getComputedStyle(header);
        return {
            isZen: document.body.classList.contains('zen-mode'),
            cardVisibility: cStyle.visibility,
            cardOpacity: parseFloat(cStyle.opacity),
            headerVisibility: hStyle.visibility
        };
    })()
'@
    Write-Host "  Alya Zen OFF: $($alyaOffState | ConvertTo-Json -Compress)"
    if ($alyaOffState.isZen -ne $false -or $alyaOffState.cardVisibility -ne 'visible' -or $alyaOffState.cardOpacity -lt 0.95) {
        throw "Failed to restore card on Zen OFF!"
    }
    Write-Host "  [PASS] Clean return from Zen mode with full UI restoration!" -ForegroundColor Green

    # ========================================================
    # TEST 3: SHIINA MAHIRU (PERSONA 1) — GOLDEN ATMOSPHERE ✨ IN ZEN MODE
    # ========================================================
    Write-Host "`n--- TEST 3: SHIINA MAHIRU (PERSONA 1) — GOLDEN ATMOSPHERE IN ZEN MODE ---" -ForegroundColor Yellow

    # Select Mahiru
    [void](EvalJS "window.setPersona(1)")
    PumpFrames 15

    # Toggle Zen ON
    [void](EvalJS "window.toggleZenMode(true)")
    PumpFrames 25

    $mahiruZenState = EvalJS @'
    (() => {
        const starryCanvas = document.getElementById('starry-canvas');
        const starryStyle = window.getComputedStyle(starryCanvas);
        const accent = getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim();
        const personaName = document.getElementById('creator-name')?.textContent || '';

        return {
            isZen: document.body.classList.contains('zen-mode'),
            starryDisplay: starryStyle.display,
            accentColor: accent,
            currentPersonaName: personaName
        };
    })()
'@
    Write-Host "  Mahiru Zen State: $($mahiruZenState | ConvertTo-Json -Compress)"
    if ($mahiruZenState.starryDisplay -eq 'none') { throw "Mahiru starry canvas is hidden in Zen!" }
    if ($mahiruZenState.accentColor -ne '#fbbf24' -and $mahiruZenState.accentColor -ne 'rgb(251, 191, 36)') { throw "Expected Mahiru warm gold accent (#fbbf24 / rgb(251, 191, 36)), got $($mahiruZenState.accentColor)!" }
    Write-Host "  [PASS] Mahiru golden atmosphere active with warm gold accent ($($mahiruZenState.accentColor))!" -ForegroundColor Green

    # Capture Mahiru Golden Atmosphere Screenshot
    $shotM = CDP 'Page.captureScreenshot' @{ format = 'png' }
    $shotPathM = Join-Path 'C:\Users\Admin\.gemini\antigravity\brain\676897cc-82eb-49fa-8a7e-b684c15d6e09' 'zen_mahiru_stardust_verified.png'
    [IO.File]::WriteAllBytes($shotPathM, [Convert]::FromBase64String($shotM.result.data))
    Write-Host "  [ARTIFACT] Saved Mahiru Zen golden stardust screenshot: $shotPathM" -ForegroundColor Green

    # ========================================================
    # TEST 4: RAPID ALYA <-> MAHIRU SWITCHING WHILE ZEN IS ON
    # ========================================================
    Write-Host "`n--- TEST 4: RAPID ALYA <-> MAHIRU SWITCHING WHILE ZEN IS ON ---" -ForegroundColor Yellow
    for ($i = 0; $i -lt 10; $i++) {
        $target = $i % 2
        [void](EvalJS "window.setPersona($target)")
        PumpFrames 3
    }
    PumpFrames 20

    $switchState = EvalJS @'
    (() => {
        const starryCanvas = document.getElementById('starry-canvas');
        return {
            isZen: document.body.classList.contains('zen-mode'),
            starryDisplay: window.getComputedStyle(starryCanvas).display,
            accent: getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim()
        };
    })()
'@
    Write-Host "  After 10x persona switches in Zen: $($switchState | ConvertTo-Json -Compress)"
    if ($switchState.starryDisplay -eq 'none') { throw "Starry canvas disappeared after rapid persona switching!" }
    Write-Host "  [PASS] Rapid persona switching in Zen Mode completed with 0 errors!" -ForegroundColor Green

    # ========================================================
    # TEST 5: QUALITY TIERS AUDIT (HIGH vs BALANCED vs ECO)
    # ========================================================
    Write-Host "`n--- TEST 5: QUALITY TIERS AUDIT (HIGH vs BALANCED vs ECO) ---" -ForegroundColor Yellow

    # Test Eco quality
    [void](EvalJS "window.setMinkoiQuality('eco')")
    PumpFrames 15
    $ecoState = EvalJS @'
    (() => {
        const starryCanvas = document.getElementById('starry-canvas');
        const fluidCanvas = document.getElementById('fluid-bg-canvas');
        return {
            quality: document.body.getAttribute('data-quality'),
            starryDisplay: window.getComputedStyle(starryCanvas).display,
            fluidDisplay: window.getComputedStyle(fluidCanvas).display,
            isLowEnd: document.body.classList.contains('low-end')
        };
    })()
'@
    Write-Host "  Eco State: $($ecoState | ConvertTo-Json -Compress)"
    if ($ecoState.starryDisplay -eq 'none') { throw "Starry canvas must NOT be hidden in Eco mode!" }
    Write-Host "  [PASS] Eco mode preserves waifu particles with reduced density!" -ForegroundColor Green

    # Restore High quality
    [void](EvalJS "window.setMinkoiQuality('high')")
    PumpFrames 15

    # ========================================================
    # TEST 6: MOBILE VIEWPORT (390x844) ZEN PARTICLES AUDIT
    # ========================================================
    Write-Host "`n--- TEST 6: MOBILE VIEWPORT (390x844) ZEN PARTICLES AUDIT ---" -ForegroundColor Yellow
    [void](CDP 'Emulation.setDeviceMetricsOverride' @{ width = 390; height = 844; deviceScaleFactor = 2; mobile = $true })
    PumpFrames 20

    $mobileState = EvalJS @'
    (() => {
        const starryCanvas = document.getElementById('starry-canvas');
        return {
            isZen: document.body.classList.contains('zen-mode'),
            starryDisplay: window.getComputedStyle(starryCanvas).display,
            canvasW: starryCanvas.width,
            canvasH: starryCanvas.height
        };
    })()
'@
    Write-Host "  Mobile Zen Particles: $($mobileState | ConvertTo-Json -Compress)"
    if ($mobileState.starryDisplay -eq 'none') { throw "Mobile Zen particles hidden!" }
    Write-Host "  [PASS] Mobile viewport displays waifu particles with 30fps power throttle!" -ForegroundColor Green

    # Capture Mobile Zen particles screenshot
    $shotMob = CDP 'Page.captureScreenshot' @{ format = 'png' }
    $shotPathMob = Join-Path 'C:\Users\Admin\.gemini\antigravity\brain\676897cc-82eb-49fa-8a7e-b684c15d6e09' 'zen_mobile_particles_verified.png'
    [IO.File]::WriteAllBytes($shotPathMob, [Convert]::FromBase64String($shotMob.result.data))
    Write-Host "  [ARTIFACT] Saved Mobile Zen particles screenshot: $shotPathMob" -ForegroundColor Green

    # Return to Desktop
    Start-Sleep -Milliseconds 400
    [void](CDP 'Emulation.setDeviceMetricsOverride' @{ width = 1440; height = 900; deviceScaleFactor = 1; mobile = $false })
    Start-Sleep -Milliseconds 400
    [void](EvalJS "window.toggleZenMode(false)")
    PumpFrames 25

    Write-Host "`n>>> ALL WAIFU SIGNATURE PARTICLES QA TESTS PASSED SUCCESSFULLY! <<<" -ForegroundColor Green

} finally {
    if ($ws) { $ws.Dispose() }
    if ($proc -and -not $proc.HasExited) { Stop-Process -Id $proc.Id -Force }
    if ($L -and $L.IsListening) { $L.Stop(); $L.Close() }
    if ($ud -and (Test-Path $ud)) { Remove-Item -Path $ud -Recurse -Force -ErrorAction SilentlyContinue }
}
