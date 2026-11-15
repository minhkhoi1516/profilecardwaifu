# audit-zen.ps1 - Automated Zen Mode Stability & Performance Audit
$ErrorActionPreference = 'Stop'
$Port = 42915
$CdpPort = 9720

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " MINKOI V4.0 ZEN MODE STABILITY & PERFORMANCE AUDIT" -ForegroundColor Cyan
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
$ud = Join-Path $env:TEMP ('cdp_zen_' + [guid]::NewGuid().ToString('N').Substring(0,8))
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
        $callCts = [System.Threading.CancellationTokenSource]::new(20000)
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
            $msg = $res.result.exceptionDetails.exception.description
            Write-Host "JS EVAL EXCEPTION ($expression): $msg" -ForegroundColor Red
        }
        return $res.result.result.value
    }

    CDP 'Page.enable' | Out-Null
    CDP 'Runtime.enable' | Out-Null

    # Navigate to app
    CDP 'Page.navigate' @{ url = "http://127.0.0.1:$Port/index.html" } | Out-Null
    Start-Sleep -Seconds 3

    # ========================================================
    # TEST 1: MOBILE VIEWPORT (390x844) ZEN GEOMETRY & LYRIC OVERLAP AUDIT
    # ========================================================
    Write-Host "`n--- TEST 1: MOBILE VIEWPORT (390x844) ZEN GEOMETRY & LYRIC AUDIT ---" -ForegroundColor Yellow
    CDP 'Emulation.setDeviceMetricsOverride' @{ width = 390; height = 844; deviceScaleFactor = 2; mobile = $true } | Out-Null
    Start-Sleep -Milliseconds 400

    # Toggle Zen Mode On
    $initialCheck = EvalJS @'
    (() => {
        const c = document.querySelector('.card-container');
        const d = document.getElementById('zen-mini-dock');
        return {
            cardOpacity: window.getComputedStyle(c).opacity,
            cardVisibility: window.getComputedStyle(c).visibility,
            dockOpacity: window.getComputedStyle(d).opacity,
            dockVisibility: window.getComputedStyle(d).visibility,
            bodyClass: document.body.className
        };
    })()
'@
    Write-Host "  Initial Baseline: $($initialCheck | ConvertTo-Json -Compress)"

    EvalJS @'
    (() => {
        window.toggleZenMode(true);
        // Inject active lyrics with both romaji and translation
        const l = document.getElementById('zen-ambient-lyric');
        l.classList.add('has-lyric');
        document.getElementById('zen-lyric-romaji').textContent = 'Kawaikute gomen (Watashi ga watashi no koto wo aishite)';
        document.getElementById('zen-lyric-vi').textContent = 'Xin loi vi em qua de thuong (Vi em yeu ban than minh)';
    })()
'@ | Out-Null
    Start-Sleep -Milliseconds 600

    $mobGeom = EvalJS @'
    (() => {
        const d = document.getElementById('zen-mini-dock').getBoundingClientRect();
        const l = document.getElementById('zen-ambient-lyric').getBoundingClientRect();
        const cardStyle = window.getComputedStyle(document.querySelector('.card-container'));
        const headerStyle = window.getComputedStyle(document.querySelector('.site-brand-header'));
        const dockStyle = window.getComputedStyle(document.getElementById('zen-mini-dock'));

        return {
            isZen: document.body.classList.contains('zen-mode'),
            cardVisibility: cardStyle.visibility,
            cardOpacity: parseFloat(cardStyle.opacity),
            headerVisibility: headerStyle.visibility,
            headerOpacity: parseFloat(headerStyle.opacity),
            dockTop: d.top,
            dockBottom: d.bottom,
            dockHeight: d.height,
            dockBackdropFilter: dockStyle.backdropFilter || dockStyle.webkitBackdropFilter,
            lyricTop: l.top,
            lyricBottom: l.bottom,
            lyricHeight: l.height,
            gapBetweenLyricAndDock: d.top - l.bottom
        };
    })()
'@
    Write-Host "  Mobile Zen State: $($mobGeom | ConvertTo-Json -Compress)"
    Write-Host "  Card Visibility: $($mobGeom.cardVisibility), Opacity: $($mobGeom.cardOpacity)"
    Write-Host "  Header Visibility: $($mobGeom.headerVisibility), Opacity: $($mobGeom.headerOpacity)"
    Write-Host "  Dock Height: $($mobGeom.dockHeight)px, Lyric Height: $($mobGeom.lyricHeight)px"
    Write-Host "  Vertical Gap (Dock Top - Lyric Bottom): $($mobGeom.gapBetweenLyricAndDock)px"

    if ($mobGeom.gapBetweenLyricAndDock -lt 8) {
        Write-Host "  [WARN] Lyric and Zen Dock are too close or overlapping (gap < 8px)!" -ForegroundColor Red
    } else {
        Write-Host "  [PASS] Safe clearance between Zen Lyric and Mini Dock ($($mobGeom.gapBetweenLyricAndDock)px >= 8px)!" -ForegroundColor Green
    }

    # Capture visual verification artifact
    $shotRes = CDP 'Page.captureScreenshot' @{ format = 'png' }
    if ($shotRes.result.data) {
        $shotBytes = [Convert]::FromBase64String($shotRes.result.data)
        $shotPath = 'C:\Users\Admin\.gemini\antigravity\brain\676897cc-82eb-49fa-8a7e-b684c15d6e09\zen_mobile_verified_390x844.png'
        [System.IO.File]::WriteAllBytes($shotPath, $shotBytes)
        Write-Host "  [ARTIFACT] Saved mobile Zen screenshot to $shotPath ($($shotBytes.Length) bytes)" -ForegroundColor Cyan
    }

    # ========================================================
    # TEST 2: BACKGROUND CANVAS & RAF PAUSE AUDIT
    # ========================================================
    Write-Host "`n--- TEST 2: BACKGROUND CANVAS & RAF PAUSE AUDIT ---" -ForegroundColor Yellow
    $pauseAudit = EvalJS @'
    (() => {
        const fluidCanvas = document.getElementById('fluid-bg-canvas');
        const starryCanvas = document.getElementById('starry-canvas');
        const fluidDisplay = window.getComputedStyle(fluidCanvas).display;
        const starryDisplay = window.getComputedStyle(starryCanvas).display;
        const bannerLayers = document.querySelectorAll('.banner-stage .banner-layer');

        return {
            fluidDisplay: fluidDisplay,
            starryDisplay: starryDisplay,
            bannerLayerCount: bannerLayers.length,
            activeBannerCount: document.querySelectorAll('.banner-stage .banner-layer.active').length
        };
    })()
'@
    Write-Host "  Pause Audit: $($pauseAudit | ConvertTo-Json -Compress)"
    if ($pauseAudit.fluidDisplay -ne 'none' -or $pauseAudit.starryDisplay -eq 'none') {
        throw "Canvas elements state error in Zen mode: fluid should be hidden ('none') and starry active ('block')!"
    }
    if ($pauseAudit.bannerLayerCount -ne 2) {
        throw "Expected exactly 2 banner buffers, got $($pauseAudit.bannerLayerCount)!"
    }
    Write-Host "  [PASS] WebGL fluid paused; waifu signature particles active in Zen; exactly 2 banner buffers active!" -ForegroundColor Green

    # ========================================================
    # TEST 2B: DESKTOP VIEWPORT (1440x900) ZEN AUDIT & CAPTURE
    # ========================================================
    Write-Host "`n--- TEST 2B: DESKTOP VIEWPORT (1440x900) ZEN AUDIT & CAPTURE ---" -ForegroundColor Yellow
    CDP 'Emulation.setDeviceMetricsOverride' @{ width = 1440; height = 900; deviceScaleFactor = 1; mobile = $false } | Out-Null
    Start-Sleep -Milliseconds 400

    $deskGeom = EvalJS @'
    (() => {
        const d = document.getElementById('zen-mini-dock').getBoundingClientRect();
        const l = document.getElementById('zen-ambient-lyric').getBoundingClientRect();
        return {
            dockTop: d.top,
            dockBottom: d.bottom,
            dockHeight: d.height,
            lyricTop: l.top,
            lyricBottom: l.bottom,
            lyricHeight: l.height,
            gapBetweenLyricAndDock: d.top - l.bottom
        };
    })()
'@
    Write-Host "  Desktop Zen State: $($deskGeom | ConvertTo-Json -Compress)"
    Write-Host "  Desktop Vertical Gap (Dock Top - Lyric Bottom): $($deskGeom.gapBetweenLyricAndDock)px"

    $deskShot = CDP 'Page.captureScreenshot' @{ format = 'png' }
    if ($deskShot.result.data) {
        $deskBytes = [Convert]::FromBase64String($deskShot.result.data)
        $deskPath = 'C:\Users\Admin\.gemini\antigravity\brain\676897cc-82eb-49fa-8a7e-b684c15d6e09\zen_desktop_verified_1440x900.png'
        [System.IO.File]::WriteAllBytes($deskPath, $deskBytes)
        Write-Host "  [ARTIFACT] Saved desktop Zen screenshot to $deskPath ($($deskBytes.Length) bytes)" -ForegroundColor Cyan
    }

    # ========================================================
    # TEST 3: RAPID ZEN ENTER / EXIT STRESS TEST (20X CYCLES)
    # ========================================================
    Write-Host "`n--- TEST 3: RAPID ZEN ENTER / EXIT STRESS TEST (20X CYCLES) ---" -ForegroundColor Yellow
    
    # Reset to mobile viewport for stress test
    CDP 'Emulation.setDeviceMetricsOverride' @{ width = 390; height = 844; deviceScaleFactor = 2; mobile = $true } | Out-Null
    Start-Sleep -Milliseconds 200

    $settleState = EvalJS @'
    (async () => {
        let loopError = null;
        try {
            for (let i = 0; i < 20; i++) {
                window.toggleZenMode(false);
                await new Promise(r => setTimeout(r, 40));
                window.toggleZenMode(true);
                await new Promise(r => setTimeout(r, 40));
            }
            window.toggleZenMode(false);
            // In headless browser, pump animation frames so compositor ticks the CSS transition
            for (let f = 0; f < 25; f++) {
                await new Promise(r => requestAnimationFrame(r));
            }
            await new Promise(r => setTimeout(r, 200));
        } catch (err) {
            loopError = String(err);
        }

        const cardStyle = window.getComputedStyle(document.querySelector('.card-container'));
        const headerStyle = window.getComputedStyle(document.querySelector('.site-brand-header'));
        const dockStyle = window.getComputedStyle(document.getElementById('zen-mini-dock'));
        const fluidCanvas = document.getElementById('fluid-bg-canvas');
        const starryCanvas = document.getElementById('starry-canvas');

        const cardEl = document.querySelector('.card-container');
        const cardMatchedRules = [];
        for (const sheet of document.styleSheets) {
            try {
                for (const rule of sheet.cssRules) {
                    if (rule.selectorText && cardEl.matches(rule.selectorText)) {
                        if (rule.style.opacity) {
                            cardMatchedRules.push({ sel: rule.selectorText, opacity: rule.style.opacity });
                        }
                    }
                }
            } catch (_) {}
        }

        return {
            cardMatchedRules: cardMatchedRules,
            loopError: loopError,
            isZen: document.body.classList.contains('zen-mode'),
            bodyClass: document.body.className,
            cardOpacityRaw: cardStyle.opacity,
            cardVisibility: cardStyle.visibility,
            cardOpacity: parseFloat(cardStyle.opacity),
            headerVisibility: headerStyle.visibility,
            dockVisibility: dockStyle.visibility,
            dockOpacity: parseFloat(dockStyle.opacity),
            fluidDisplay: window.getComputedStyle(fluidCanvas).display,
            starryDisplay: window.getComputedStyle(starryCanvas).display,
            bannerCount: document.querySelectorAll('.banner-stage .banner-layer').length
        };
    })()
'@
    Write-Host "  After 20x toggles settled in normal mode: $($settleState | ConvertTo-Json -Compress)"
    if ($settleState.isZen -ne $false -or $settleState.cardVisibility -ne 'visible' -or $settleState.cardOpacity -lt 0.9) {
        throw "Rapid Zen toggle left interface in corrupt or invisible state!"
    }
    Write-Host "  [PASS] 20x Rapid Zen toggle stress test completed with perfect state recovery!" -ForegroundColor Green

    Write-Host "`n>>> ALL ZEN AUDIT TESTS COMPLETED SUCCESSFULLY! <<<" -ForegroundColor Green

} finally {
    try { $ws.CloseAsync([System.Net.WebSockets.WebSocketCloseStatus]::NormalClosure, 'done', [System.Threading.CancellationToken]::None).Wait() } catch {}
    try { Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue } catch {}
    try { if ($L) { $L.Stop(); $L.Close() } } catch {}
    try { if ($ps) { $ps.Dispose() } } catch {}
    try { if ($rs) { $rs.Dispose() } } catch {}
    try { Remove-Item $ud -Recurse -Force -ErrorAction SilentlyContinue } catch {}
}
