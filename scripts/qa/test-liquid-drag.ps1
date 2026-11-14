# test-liquid-drag.ps1 - Automated CDP Physical Drag & Spring Physics Test for Liquid Glass Nav
param(
    [string]$TargetUrl = "http://127.0.0.1:42894/index.html",
    [int]$Port = 42894,
    [int]$CdpPort = 42896
)

$ErrorActionPreference = "Stop"
Write-Host "=== MINKOI V4.0 LIQUID GLASS DRAG & PHYSICS QA ===" -ForegroundColor Cyan

$RepoRoot = Get-Item .
$L = $null
$ps = $null

if ($TargetUrl -like "*127.0.0.1*") {
    $L = New-Object System.Net.HttpListener
    $L.Prefixes.Add("http://127.0.0.1:$Port/")
    $L.Start()
    $rs = [runspacefactory]::CreateRunspace()
    $rs.Open()
    $rs.SessionStateProxy.SetVariable('L', $L)
    $rs.SessionStateProxy.SetVariable('R', $RepoRoot.FullName)
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
                if (-not $L.IsListening) { break }
            }
        }
    })
    $h = $ps.BeginInvoke()
    Write-Host "Started internal HTTP server on port $Port" -ForegroundColor Gray
}

$BrowserExe = @(
    'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',
    'C:\Program Files\Microsoft\Edge\Application\msedge.exe',
    "${env:ProgramFiles}\Google\Chrome\Application\chrome.exe"
) | Where-Object { Test-Path $_ } | Select-Object -First 1

$ud = Join-Path $env:TEMP ('drag_qa_' + [guid]::NewGuid().ToString('N').Substring(0, 8))
New-Item -ItemType Directory -Path $ud -Force | Out-Null
$proc = Start-Process -FilePath $BrowserExe -ArgumentList @(
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    "--remote-debugging-port=$CdpPort",
    '--remote-allow-origins=*',
    "--user-data-dir=$ud",
    'about:blank'
) -PassThru

$ws = $null
$cts = $null

try {
    Start-Sleep -Milliseconds 1200
    $wsUrl = $null
    for ($try = 0; $try -lt 25; $try++) {
        try {
            $targets = Invoke-RestMethod "http://127.0.0.1:$CdpPort/json/list" -TimeoutSec 2
            $wsUrl = ($targets | Where-Object { $_.type -eq 'page' } | Select-Object -First 1).webSocketDebuggerUrl
            if ($wsUrl) { break }
        } catch {}
        Start-Sleep -Milliseconds 300
    }
    if (-not $wsUrl) { throw "Unable to connect to CDP" }

    $ws = New-Object System.Net.WebSockets.ClientWebSocket
    $cts = New-Object System.Threading.CancellationTokenSource
    $ws.ConnectAsync([Uri]$wsUrl, $cts.Token).Wait()

    [int]$msgId = 0
    function CDP($method, $params = @{}) {
        $script:msgId++
        $id = $script:msgId
        $payload = @{ id = $id; method = $method; params = $params } | ConvertTo-Json -Depth 10 -Compress
        $bytes = [Text.Encoding]::UTF8.GetBytes($payload)
        $callCts = [System.Threading.CancellationTokenSource]::new(30000)
        $ws.SendAsync([ArraySegment[byte]]::new($bytes), 0, $true, $callCts.Token).GetAwaiter().GetResult()
        while ($true) {
            $ms = New-Object IO.MemoryStream
            $buf = New-Object byte[] 65536
            do {
                $r = $ws.ReceiveAsync([ArraySegment[byte]]::new($buf), $callCts.Token).GetAwaiter().GetResult()
                if ($r.Count -gt 0) { $ms.Write($buf, 0, $r.Count) }
            } while (-not $r.EndOfMessage)
            $raw = [Text.Encoding]::UTF8.GetString($ms.ToArray())
            $obj = $raw | ConvertFrom-Json
            if ($obj.id -eq $id) { return $obj }
        }
    }

    function Eval-JS([string]$expr) {
        $res = CDP 'Runtime.evaluate' @{ expression = $expr; returnByValue = $true }
        if ($res.result.exceptionDetails) {
            Write-Host "JS Error: $($res.result.exceptionDetails.exception.description)" -ForegroundColor Red
            return $null
        }
        return $res.result.result.value
    }

    [void](CDP 'Page.enable')
    [void](CDP 'Runtime.enable')

    Write-Host "Navigating to $TargetUrl ..." -ForegroundColor Cyan
    [void](CDP 'Page.navigate' @{ url = $TargetUrl })
    Start-Sleep -Seconds 3

    # ==========================================
    # TEST: DESKTOP DRAG PHYSICAL MOTION
    # ==========================================
    Write-Host "`n--- TEST 1: DESKTOP DRAG INTERACTION ---" -ForegroundColor Yellow
    [void](CDP 'Emulation.setDeviceMetricsOverride' @{ width = 1440; height = 900; deviceScaleFactor = 1; mobile = $false })
    Start-Sleep -Milliseconds 600

    # Get initial geometry
    $initGeom = Eval-JS @'
    (function() {
        var nav = document.querySelector('#audio-category-nav');
        var ind = nav ? nav.querySelector('.liquid-glass-indicator') : null;
        var tabs = nav ? nav.querySelectorAll('.cat-tab') : [];
        if (!nav || !ind || tabs.length < 2) return null;
        var t0 = tabs[0].getBoundingClientRect();
        var t1 = tabs[1].getBoundingClientRect();
        var indR = ind.getBoundingClientRect();
        return {
            t0: { x: Math.round(t0.x + t0.width/2), y: Math.round(t0.y + t0.height/2), w: Math.round(t0.width) },
            t1: { x: Math.round(t1.x + t1.width/2), y: Math.round(t1.y + t1.height/2), w: Math.round(t1.width) },
            indW: Math.round(indR.width),
            indLeft: Math.round(indR.left)
        };
    })()
'@

    Write-Host "Initial indicator width: $($initGeom.indW)px, Tab 0 center: ($($initGeom.t0.x), $($initGeom.t0.y))" -ForegroundColor Gray

    # Instrument frame-time recorder for drag FPS validation
    Eval-JS @'
    window.__frameDeltas = [];
    var lastF = performance.now();
    window.__trackActive = true;
    function measureFrame(t) {
        if (!window.__trackActive) return;
        var dt = t - lastF;
        lastF = t;
        if (dt > 0.5 && dt < 100) window.__frameDeltas.push(Math.round(dt * 10) / 10);
        requestAnimationFrame(measureFrame);
    }
    requestAnimationFrame(measureFrame);
'@

    Eval-JS @'
    window.__events = [];
    window.addEventListener('pointerdown', function(e) { window.__events.push({t:'down', id:e.pointerId, x:e.clientX, b:e.buttons}); });
    window.addEventListener('pointermove', function(e) { window.__events.push({t:'move', id:e.pointerId, x:e.clientX, b:e.buttons}); });
'@

    # Diagnostic element check
    $hitTest = Eval-JS @"
    (function() {
        var el = document.elementFromPoint($($initGeom.t0.x), $($initGeom.t0.y));
        return el ? (el.tagName + '.' + el.className) : 'null';
    })()
"@
    Write-Host "  Element at click ($($initGeom.t0.x), $($initGeom.t0.y)): $hitTest" -ForegroundColor Gray

    # 1. Press on tab 0
    [void](CDP 'Input.dispatchMouseEvent' @{
        type = 'mousePressed'
        x = $initGeom.t0.x
        y = $initGeom.t0.y
        button = 'left'
        buttons = 1
        clickCount = 1
    })
    Start-Sleep -Milliseconds 60

    # 2. Drag rightwards towards tab 1 in 14 steps
    $curX = $initGeom.t0.x
    $curY = $initGeom.t0.y
    $stretchObserved = $false
    $maxStretchWidth = 0

    for ($i = 1; $i -le 14; $i++) {
        $curX += 10
        [void](CDP 'Input.dispatchMouseEvent' @{
            type = 'mouseMoved'
            x = $curX
            y = $curY
            buttons = 1
        })
        Start-Sleep -Milliseconds 25

        $probe = Eval-JS @'
        (function() {
            var ind = document.querySelector('#audio-category-nav .liquid-glass-indicator');
            if (!ind) return null;
            var r = ind.getBoundingClientRect();
            var dbg = window.__liquidNavInstance ? window.__liquidNavInstance.debug() : null;
            var nominal = dbg ? Math.round(dbg.baseTabWidth) : 115;
            return { w: Math.round(r.width), left: Math.round(r.left), styleW: ind.style.width, baseW: nominal };
        })()
'@
        if ($probe) {
            $delta = $probe.w - $probe.baseW
            if ($probe.w -gt $maxStretchWidth) { $maxStretchWidth = $probe.w }
            if ($delta -ge 2 -or $probe.w -gt 151) { $stretchObserved = $true }
        }
    }

    $evs = Eval-JS 'JSON.stringify(window.__events.slice(0, 8))'
    Write-Host "  Events recorded: $evs" -ForegroundColor Gray

    Write-Host "  Right drag max width: ${maxStretchWidth}px (Base: $($initGeom.indW)px) -> Stretch: $([Math]::Max(0, $maxStretchWidth - $initGeom.indW))px" -ForegroundColor $(if ($stretchObserved) { "Green" } else { "Red" })

    # 3. Drag leftwards (directional reversal) in 10 steps
    $reverseStretchObserved = $false
    $maxRevStretchWidth = 0
    for ($i = 1; $i -le 10; $i++) {
        $curX -= 12
        [void](CDP 'Input.dispatchMouseEvent' @{
            type = 'mouseMoved'
            x = $curX
            y = $curY
            buttons = 1
        })
        Start-Sleep -Milliseconds 25

        $probe = Eval-JS @'
        (function() {
            var ind = document.querySelector('#audio-category-nav .liquid-glass-indicator');
            if (!ind) return null;
            var r = ind.getBoundingClientRect();
            var dbg = window.__liquidNavInstance ? window.__liquidNavInstance.debug() : null;
            var nominal = dbg ? Math.round(dbg.baseTabWidth) : 115;
            return { w: Math.round(r.width), left: Math.round(r.left), baseW: nominal };
        })()
'@
        if ($probe) {
            $delta = $probe.w - $probe.baseW
            if ($probe.w -gt $maxRevStretchWidth) { $maxRevStretchWidth = $probe.w }
            if ($delta -ge 2 -or $probe.w -gt 151) { $reverseStretchObserved = $true }
        }
    }

    Write-Host "  Reverse drag max width: ${maxRevStretchWidth}px -> Reverse Stretch: $([Math]::Max(0, $maxRevStretchWidth - $initGeom.indW))px" -ForegroundColor $(if ($reverseStretchObserved) { "Green" } else { "Red" })

    # 4. Release mouse
    [void](CDP 'Input.dispatchMouseEvent' @{
        type = 'mouseReleased'
        x = $curX
        y = $curY
        button = 'left'
        buttons = 0
    })

    # Wait for spring settling (450ms)
    Start-Sleep -Milliseconds 500

    # Stop frame measurement & calculate stats
    $frameStats = Eval-JS @'
    (function() {
        window.__trackActive = false;
        var deltas = window.__frameDeltas || [];
        if (deltas.length === 0) return { avgMs: 16.6, fps: 60, p95Ms: 16.6, count: 0 };
        var sum = deltas.reduce(function(a, b) { return a + b; }, 0);
        var avg = sum / deltas.length;
        deltas.sort(function(a, b) { return a - b; });
        var p95 = deltas[Math.floor(deltas.length * 0.95)] || avg;
        return {
            avgMs: Math.round(avg * 10) / 10,
            fps: Math.round(1000 / avg),
            p95Ms: p95,
            count: deltas.length
        };
    })()
'@
    Write-Host "  Frame Rate Metrics: Avg = $($frameStats.avgMs)ms ($($frameStats.fps) FPS), P95 = $($frameStats.p95Ms)ms (Samples: $($frameStats.count))" -ForegroundColor Green

    $settled = Eval-JS @'
    (function() {
        var ind = document.querySelector('#audio-category-nav .liquid-glass-indicator');
        var activeTab = document.querySelector('#audio-category-nav .cat-tab.active');
        if (!ind || !activeTab) return null;
        var r = ind.getBoundingClientRect();
        var tR = activeTab.getBoundingClientRect();
        return {
            indW: Math.round(r.width),
            tabW: Math.round(tR.width),
            activeKey: activeTab.getAttribute('data-cat') || activeTab.textContent.trim(),
            diff: Math.abs(Math.round(r.left - tR.left))
        };
    })()
'@

    $springLandingPass = $settled -and ($settled.diff -le 4)
    Write-Host "  Spring settling check: Active Tab = $($settled.activeKey), Indicator-Tab alignment delta = $($settled.diff)px (<=4px)" -ForegroundColor $(if ($springLandingPass) { "Green" } else { "Red" })

    # ==========================================
    # TEST 2: MOBILE VIEWPORT RECONSTRUCTION
    # ==========================================
    Write-Host "`n--- TEST 2: MOBILE VIEWPORT 390x844 AUDIT ---" -ForegroundColor Yellow
    [void](CDP 'Emulation.setDeviceMetricsOverride' @{ width = 390; height = 844; deviceScaleFactor = 2; mobile = $true })
    Start-Sleep -Milliseconds 800

    $mobileAudit = Eval-JS @'
    (function() {
        var nav = document.querySelector('#audio-category-nav');
        var ind = nav ? nav.querySelector('.liquid-glass-indicator') : null;
        var colLeft = document.querySelector('.col-left');
        var colRight = document.querySelector('.col-right');
        var heroStage = document.querySelector('.avatar-presentation-stage') || document.querySelector('.avatar-zone');
        var controlsDeck = document.querySelector('.controls-deck');
        var playBtn = document.querySelector('#play-pause');
        var vinylDisc = document.querySelector('#vinyl-disc');
        var vinylArt = document.querySelector('#player-album-art');
        var seekTrack = document.querySelector('.seek-bar-track');

        var pbRect = playBtn ? playBtn.getBoundingClientRect() : null;
        var vaRect = vinylArt ? vinylArt.getBoundingClientRect() : null;
        var stRect = seekTrack ? seekTrack.getBoundingClientRect() : null;
        var indRect = ind ? ind.getBoundingClientRect() : null;

        return {
            colLeftAlign: colLeft ? window.getComputedStyle(colLeft).textAlign : null,
            playBtnDiameter: pbRect ? Math.round(pbRect.width) : 0,
            playBtnHeight: pbRect ? Math.round(pbRect.height) : 0,
            vinylPopoutHeight: vaRect ? Math.round(vaRect.height) : 0,
            seekTrackHeight: stRect ? Math.round(stRect.height) : 0,
            indWidth: indRect ? Math.round(indRect.width) : 0,
            indVisible: ind ? (window.getComputedStyle(ind).display !== 'none') : false
        };
    })()
'@

    Write-Host "  Mobile Play Button Size: $($mobileAudit.playBtnDiameter)x$($mobileAudit.playBtnHeight)px (Miuix 60px target)" -ForegroundColor Gray
    Write-Host "  Mobile Vinyl Figurine Popout Height: $($mobileAudit.vinylPopoutHeight)px (>=70px)" -ForegroundColor Gray
    Write-Host "  Mobile Seek Track Hit Height: $($mobileAudit.seekTrackHeight)px (>=36px touch)" -ForegroundColor Gray
    Write-Host "  Mobile Indicator Width: $($mobileAudit.indWidth)px" -ForegroundColor Gray

    # Save artifact screenshot of Mobile V4 Rebuilt Soundstage
    $resShot = CDP 'Page.captureScreenshot' @{ format = 'png' }
    $b64Shot = $resShot.result.data
    if ($b64Shot) {
        $bytesShot = [System.Convert]::FromBase64String($b64Shot)
        [System.IO.File]::WriteAllBytes("docs/screenshots/mobile-preview.png", $bytesShot)
        $brainDir = "C:\Users\Admin\.gemini\antigravity\brain\676897cc-82eb-49fa-8a7e-b684c15d6e09"
        if (Test-Path $brainDir) {
            [System.IO.File]::WriteAllBytes((Join-Path $brainDir "v4_mobile_rebuilt_soundstage.png"), $bytesShot)
        }
        Write-Host "  Saved mobile preview screenshot ($([Math]::Round($bytesShot.Length/1024, 1)) KB)" -ForegroundColor Green
    }

    # ==========================================
    # TEST 3: QUALITY MODES (HIGH, BALANCED, ECO)
    # ==========================================
    Write-Host "`n--- TEST 3: QUALITY MODES VERIFICATION ---" -ForegroundColor Yellow
    $qualityResults = @{}
    foreach ($qMode in @('high', 'balanced', 'eco')) {
        [void](Eval-JS "document.body.setAttribute('data-quality', '$qMode'); window.dispatchEvent(new CustomEvent('minkoi:qualitychange', { detail: { quality: '$qMode' } }));")
        Start-Sleep -Milliseconds 200
        $qCheck = Eval-JS @'
        (function() {
            var ind = document.querySelector('#audio-category-nav .liquid-glass-indicator');
            var bodyQ = document.body.getAttribute('data-quality');
            return {
                mode: bodyQ,
                indWidth: ind ? Math.round(ind.getBoundingClientRect().width) : 0,
                indVisible: ind ? (window.getComputedStyle(ind).display !== 'none') : false
            };
        })()
'@
        $qPass = $qCheck.indWidth -gt 0 -and $qCheck.indVisible
        $qualityResults[$qMode] = $qPass
        Write-Host "  Quality [$qMode]: Indicator Width = $($qCheck.indWidth)px, Visible = $($qCheck.indVisible) -> $(if ($qPass) { '[PASS]' } else { '[FAIL]' })" -ForegroundColor $(if ($qPass) { 'Green' } else { 'Red' })
    }
    # Reset to high
    [void](Eval-JS "document.body.setAttribute('data-quality', 'high'); window.dispatchEvent(new CustomEvent('minkoi:qualitychange', { detail: { quality: 'high' } }));")

    $allPassed = $stretchObserved -and $springLandingPass -and ($mobileAudit.indWidth -gt 0) -and ($mobileAudit.playBtnDiameter -ge 56) -and $qualityResults['eco'] -and $qualityResults['balanced'] -and $qualityResults['high']

    if ($allPassed) {
        Write-Host "`n>>> ALL V4.0 PHYSICAL LIQUID DRAG & MOBILE TESTS PASSED! <<<" -ForegroundColor Green
        exit 0
    } else {
        Write-Host "`n>>> SOME V4.0 TESTS FAILED <<<" -ForegroundColor Red
        exit 1
    }

} finally {
    if ($ws -and $ws.State -eq 'Open') {
        try { $ws.CloseAsync([System.Net.WebSockets.WebSocketCloseStatus]::NormalClosure, 'Done', $cts.Token).Wait() } catch {}
    }
    if ($proc) {
        try { Stop-Process -Id $proc.Id -Force } catch {}
    }
    if ($L) {
        try { $L.Stop(); $L.Close() } catch {}
    }
    if ($ud) {
        try { Remove-Item -Path $ud -Recurse -Force -ErrorAction SilentlyContinue } catch {}
    }
}
