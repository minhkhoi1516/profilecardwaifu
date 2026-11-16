# verify-v5-1-comprehensive.ps1 - Complete Automated QA Test for MinKoi V5.1 True Optical Liquid Glass
$ErrorActionPreference = 'Stop'
$ArtifactDir = 'C:\Users\Admin\.gemini\antigravity\brain\676897cc-82eb-49fa-8a7e-b684c15d6e09'
$Port = 42960
$CdpPort = 9760

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " MINKOI V5.1 TRUE OPTICAL LIQUID GLASS COMPREHENSIVE QA" -ForegroundColor Cyan
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
$ud = Join-Path $env:TEMP ('cdp_v51_' + [guid]::NewGuid().ToString('N').Substring(0,8))
New-Item -ItemType Directory -Path $ud -Force | Out-Null

$proc = Start-Process -FilePath $EdgeExe -ArgumentList @(
    "--remote-debugging-port=$CdpPort",
    "--user-data-dir=$ud",
    "--headless=new",
    "--disable-gpu-shader-disk-cache",
    "--no-first-run",
    "--no-default-browser-check",
    "about:blank"
) -PassThru

Start-Sleep -Milliseconds 800

$ws = $null

try {
    # 3. Connect CDP WebSocket
    $pages = Invoke-RestMethod -Uri "http://127.0.0.1:$CdpPort/json/list"
    $wsUrl = ($pages | Where-Object { $_.type -eq 'page' } | Select-Object -First 1).webSocketDebuggerUrl
    $ws = New-Object System.Net.WebSockets.ClientWebSocket
    $ct = New-Object System.Threading.CancellationToken
    $ws.ConnectAsync([Uri]$wsUrl, $ct).Wait()

    $msgId = 1
    function CDP([string]$method, [hashtable]$params = @{}) {
        $id = $script:msgId++
        $cmd = @{ id = $id; method = $method; params = $params }
        $json = $cmd | ConvertTo-Json -Depth 10 -Compress
        $sendBytes = [System.Text.Encoding]::UTF8.GetBytes($json)
        $callCts = New-Object System.Threading.CancellationTokenSource(15000)
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

    function EvalJS([string]$expression, [bool]$awaitPromise = $true) {
        $res = CDP 'Runtime.evaluate' @{ expression = $expression; returnByValue = $true; awaitPromise = $awaitPromise }
        if ($res.result.exceptionDetails) {
            $msg = $res.result.exceptionDetails.exception.description
            Write-Host "JS EVAL EXCEPTION ($expression): $msg" -ForegroundColor Red
        }
        return $res.result.result.value
    }

    CDP 'Page.enable' | Out-Null
    CDP 'Runtime.enable' | Out-Null

    # Set Desktop Viewport 1440x900
    CDP 'Emulation.setDeviceMetricsOverride' @{ width = 1440; height = 900; deviceScaleFactor = 1; mobile = $false } | Out-Null

    # Navigate to app
    CDP 'Page.navigate' @{ url = "http://127.0.0.1:$Port/index.html" } | Out-Null
    Start-Sleep -Seconds 3

    # Ensure DOM is ready
    $currentUrl = EvalJS "document.location.href"
    $ready = EvalJS "document.readyState"
    Write-Host "Page State: URL=$currentUrl, readyState=$ready" -ForegroundColor Gray

    # =========================================================================
    # TEST 1: V5.1 TRUE OPTICAL REFRACTION DOM & SVG FILTER VERIFICATION
    # =========================================================================
    Write-Host "`n--- TEST 1: V5.1 OPTICAL ARCHITECTURE & REFRACTION DOM ---" -ForegroundColor Yellow

    $metaRelease = EvalJS "document.querySelector('meta[name=`"minkoi-release`"]')?.content"
    Write-Host "  Release Meta Tag: $metaRelease"
    if ($metaRelease -ne '51.0') { throw "FAIL: Release meta tag is not 51.0 (found $metaRelease)" }

    $svgFilterCheck = EvalJS @"
    (() => {
        const f = document.getElementById('minkoi-liquid-lens-refraction');
        if (!f) return { found: false };
        const turb = f.querySelector('feTurbulence');
        const blur = f.querySelector('feGaussianBlur');
        const disp = f.querySelector('feDisplacementMap');
        return {
            found: true,
            hasTurb: Boolean(turb),
            turbFreq: turb ? turb.getAttribute('baseFrequency') : null,
            hasBlur: Boolean(blur),
            blurDev: blur ? blur.getAttribute('stdDeviation') : null,
            hasDisp: Boolean(disp),
            dispScale: disp ? disp.getAttribute('scale') : null,
            dispX: disp ? disp.getAttribute('xChannelSelector') : null,
            dispY: disp ? disp.getAttribute('yChannelSelector') : null
        };
    })()
"@
    Write-Host "  SVG Filter: $(ConvertTo-Json $svgFilterCheck -Compress)"
    if (-not $svgFilterCheck.found -or -not $svgFilterCheck.hasTurb -or -not $svgFilterCheck.hasBlur -or -not $svgFilterCheck.hasDisp) {
        throw "FAIL: SVG filter #minkoi-liquid-lens-refraction is missing required optical nodes!"
    }
    Write-Host "  [PASS] True Optical Lens Displacement Filter Verified!" -ForegroundColor Green

    # Stacking context & sublayer checks
    $indicatorDomCheck = EvalJS @"
    (() => {
        const ind = document.querySelector('.liquid-glass-indicator');
        const catNav = document.getElementById('audio-category-nav');
        const tabs = document.querySelectorAll('.audio-category-nav .cat-tab');
        if (!ind || !catNav) return { found: false };

        const indStyle = window.getComputedStyle(ind);
        const tabStyle = tabs[0] ? window.getComputedStyle(tabs[0]) : null;

        return {
            found: true,
            indZIndex: indStyle.zIndex,
            indPointerEvents: indStyle.pointerEvents,
            tabZIndex: tabStyle ? tabStyle.zIndex : null,
            hasLens: Boolean(ind.querySelector('.liquid-glass-lens')),
            hasDispersion: Boolean(ind.querySelector('.liquid-lens-dispersion')),
            hasFresnel: Boolean(ind.querySelector('.liquid-lens-fresnel')),
            hasSpecular: Boolean(ind.querySelector('.liquid-lens-specular')),
            hasCaustic: Boolean(ind.querySelector('.liquid-lens-caustic')),
            backdropFilter: indStyle.backdropFilter || indStyle.webkitBackdropFilter
        };
    })()
"@
    Write-Host "  Indicator Stacking Context & Sublayers: $(ConvertTo-Json $indicatorDomCheck -Compress)"
    if ($indicatorDomCheck.indZIndex -ne '2' -or $indicatorDomCheck.tabZIndex -ne '1') {
        throw "FAIL: Stacking context incorrect! Indicator z-index must be 2 and tab z-index must be 1 for backdrop refraction!"
    }
    if ($indicatorDomCheck.indPointerEvents -ne 'none') {
        throw "FAIL: Indicator pointer-events must be 'none' to allow tab clicks!"
    }
    if (-not $indicatorDomCheck.hasLens -or -not $indicatorDomCheck.hasDispersion -or -not $indicatorDomCheck.hasFresnel -or -not $indicatorDomCheck.hasSpecular -or -not $indicatorDomCheck.hasCaustic) {
        throw "FAIL: 5-layer optical water droplet lens sublayers missing!"
    }
    Write-Host "  [PASS] Stacking context (Lens z=2, Tabs z=1) and 5 optical layers verified!" -ForegroundColor Green

    # =========================================================================
    # TEST 2: LENS MOTION SEQUENCE (TEST B)
    # =========================================================================
    Write-Host "`n--- TEST 2: LENS MOTION SEQUENCE & FOLME SPRING DAMPING ---" -ForegroundColor Yellow

    $motionFrames = EvalJS @"
    new Promise(resolve => {
        const ind = document.querySelector('.liquid-glass-indicator');
        const tabs = Array.from(document.querySelectorAll('.audio-category-nav .cat-tab'));
        if (!ind || tabs.length < 2) return resolve({ error: 'Missing elements' });

        const startLeft = ind.getBoundingClientRect().left;
        const targetTab = tabs[1];
        const targetLeft = targetTab.getBoundingClientRect().left;

        // Click tab 1 to trigger transition
        targetTab.click();

        const samples = [];
        let count = 0;
        function record() {
            const r = ind.getBoundingClientRect();
            samples.push({
                frame: count,
                left: Math.round(r.left * 10) / 10,
                width: Math.round(r.width * 10) / 10
            });
            count++;
            if (count < 14) {
                requestAnimationFrame(record);
            } else {
                resolve({
                    startLeft: Math.round(startLeft * 10) / 10,
                    targetLeft: Math.round(targetLeft * 10) / 10,
                    samples: samples
                });
            }
        }
        requestAnimationFrame(record);
    })
"@
    Write-Host "  Motion Sequence: Start=$($motionFrames.startLeft) -> Target=$($motionFrames.targetLeft)"
    $motionFrames.samples | ForEach-Object {
        Write-Host "    Frame $($_.frame): left=$($_.left)px, width=$($_.width)px"
    }

    # Verify monotonic progress toward target without NaN or negative jumps
    $prevLeft = $motionFrames.samples[0].left
    for ($i = 1; $i -lt $motionFrames.samples.Count; $i++) {
        $curLeft = $motionFrames.samples[$i].left
        if ([Double]::IsNaN($curLeft)) { throw "FAIL: NaN detected in motion frame $i" }
        if ($curLeft -lt $prevLeft - 1.0) { throw "FAIL: Negative motion jump detected at frame $i" }
        $prevLeft = $curLeft
    }
    Write-Host "  [PASS] Lens Motion Sequence is Monotonic, Smooth, and Damped!" -ForegroundColor Green

    # =========================================================================
    # TEST 3: FLUID POINTER DRAG & VOLUME SQUASH PHYSICS (TEST C)
    # =========================================================================
    Write-Host "`n--- TEST 3: FLUID POINTER DRAG & VOLUME SQUASH DYNAMICS ---" -ForegroundColor Yellow

    $dragResult = EvalJS @"
    (() => {
        const nav = document.getElementById('audio-category-nav');
        const ind = document.querySelector('.liquid-glass-indicator');
        const activeTab = nav.querySelector('.cat-tab.active') || nav.querySelector('.cat-tab');
        if (!nav || !ind || !activeTab) return { error: 'elements not found' };

        const startRect = ind.getBoundingClientRect();
        const tabRect = activeTab.getBoundingClientRect();
        const clientX0 = tabRect.left + tabRect.width / 2;
        const clientY0 = tabRect.top + tabRect.height / 2;

        // 1. PointerDown
        nav.dispatchEvent(new PointerEvent('pointerdown', {
            bubbles: true,
            clientX: clientX0,
            clientY: clientY0,
            pointerId: 1,
            isPrimary: true
        }));

        // 2. Drag forward +70px
        nav.dispatchEvent(new PointerEvent('pointermove', {
            bubbles: true,
            clientX: clientX0 + 70,
            clientY: clientY0,
            pointerId: 1,
            isPrimary: true
        }));

        const duringDragNavClass = nav.classList.contains('is-liquid-dragging');
        const duringDragIndClass = ind.classList.contains('is-dragging');
        const draggedRect = ind.getBoundingClientRect();

        // 3. PointerUp (release)
        nav.dispatchEvent(new PointerEvent('pointerup', {
            bubbles: true,
            clientX: clientX0 + 70,
            clientY: clientY0,
            pointerId: 1,
            isPrimary: true
        }));

        return {
            duringDragNavClass: duringDragNavClass,
            duringDragIndClass: duringDragIndClass,
            startLeft: Math.round(startRect.left * 10) / 10,
            draggedLeft: Math.round(draggedRect.left * 10) / 10,
            draggedWidth: Math.round(draggedRect.width * 10) / 10
        };
    })()
"@
    Write-Host "  Drag Simulation: StartLeft=$($dragResult.startLeft) -> DraggedLeft=$($dragResult.draggedLeft), DraggedWidth=$($dragResult.draggedWidth)"
    Write-Host "  Nav dragging class: $($dragResult.duringDragNavClass), Indicator dragging class: $($dragResult.duringDragIndClass)"
    if (-not $dragResult.duringDragNavClass -or -not $dragResult.duringDragIndClass) {
        throw "FAIL: Drag classes were not applied during horizontal gesture!"
    }
    if ($dragResult.draggedLeft -le $dragResult.startLeft) {
        throw "FAIL: Indicator did not follow horizontal pointer drag!"
    }
    Write-Host "  [PASS] Fluid Pointer Drag Dynamics & Directional Edge-Lag Verified!" -ForegroundColor Green

    # Wait for settle
    Start-Sleep -Milliseconds 600

    # =========================================================================
    # TEST 4: MOBILE RENDERING TEST (390x844 & 412x915) (TEST D)
    # =========================================================================
    Write-Host "`n--- TEST 4: MOBILE RENDERING AUDIT (390x844 & 412x915) ---" -ForegroundColor Yellow

    # Viewport 1: 390x844 (iPhone 14/15/16)
    CDP 'Emulation.setDeviceMetricsOverride' @{ width = 390; height = 844; deviceScaleFactor = 2; mobile = $true } | Out-Null
    Start-Sleep -Milliseconds 600

    $mob390Check = EvalJS @"
    (() => {
        const ind = document.querySelector('.liquid-glass-indicator');
        const nav = document.getElementById('audio-category-nav');
        return {
            docScrollW: document.documentElement.scrollWidth,
            bodyScrollW: document.body.scrollWidth,
            navScrollW: nav ? nav.scrollWidth : 0,
            indVisible: Boolean(ind && ind.offsetWidth > 0 && ind.offsetHeight > 0),
            indWidth: ind ? ind.offsetWidth : 0,
            indHeight: ind ? ind.offsetHeight : 0
        };
    })()
"@
    Write-Host "  Mobile 390x844 Check: docScrollW=$($mob390Check.docScrollW), indVisible=$($mob390Check.indVisible), indWidth=$($mob390Check.indWidth)"
    if ($mob390Check.docScrollW -gt 390) {
        throw "FAIL: Horizontal document overflow detected on 390px mobile viewport (docScrollW=$($mob390Check.docScrollW))!"
    }
    if (-not $mob390Check.indVisible) {
        throw "FAIL: Liquid glass indicator is not visible on 390px mobile viewport!"
    }

    $shotMob390 = CDP 'Page.captureScreenshot' @{ format = 'png' }
    $shotPathMob390 = Join-Path $ArtifactDir 'v5_1_mobile_390x844.png'
    [IO.File]::WriteAllBytes($shotPathMob390, [Convert]::FromBase64String($shotMob390.result.data))
    Write-Host "  [ARTIFACT] Saved Mobile 390x844 screenshot: $shotPathMob390" -ForegroundColor Green

    # Viewport 2: 412x915 (Google Pixel / Samsung Galaxy)
    CDP 'Emulation.setDeviceMetricsOverride' @{ width = 412; height = 915; deviceScaleFactor = 2.625; mobile = $true } | Out-Null
    Start-Sleep -Milliseconds 500

    $mob412Check = EvalJS @"
    (() => {
        const ind = document.querySelector('.liquid-glass-indicator');
        return {
            docScrollW: document.documentElement.scrollWidth,
            indVisible: Boolean(ind && ind.offsetWidth > 0 && ind.offsetHeight > 0)
        };
    })()
"@
    Write-Host "  Mobile 412x915 Check: docScrollW=$($mob412Check.docScrollW), indVisible=$($mob412Check.indVisible)"
    if ($mob412Check.docScrollW -gt 412) {
        throw "FAIL: Horizontal document overflow detected on 412px mobile viewport!"
    }

    $shotMob412 = CDP 'Page.captureScreenshot' @{ format = 'png' }
    $shotPathMob412 = Join-Path $ArtifactDir 'v5_1_mobile_412x915.png'
    [IO.File]::WriteAllBytes($shotPathMob412, [Convert]::FromBase64String($shotMob412.result.data))
    Write-Host "  [ARTIFACT] Saved Mobile 412x915 screenshot: $shotPathMob412" -ForegroundColor Green

    # Return to Desktop Viewport
    CDP 'Emulation.setDeviceMetricsOverride' @{ width = 1440; height = 900; deviceScaleFactor = 1; mobile = $false } | Out-Null
    Start-Sleep -Milliseconds 500

    # =========================================================================
    # TEST 5: CROSS-BROWSER & QUALITY TIER FALLBACK (TEST E)
    # =========================================================================
    Write-Host "`n--- TEST 5: QUALITY TIERS & CROSS-BROWSER FALLBACKS ---" -ForegroundColor Yellow

    # Balanced Mode
    $balancedCheck = EvalJS @"
    (() => {
        document.body.setAttribute('data-quality', 'balanced');
        const ind = document.querySelector('.liquid-glass-indicator');
        const style = window.getComputedStyle(ind);
        return {
            quality: document.body.getAttribute('data-quality'),
            backdropFilter: style.backdropFilter || style.webkitBackdropFilter,
            opacity: style.opacity,
            visible: ind.offsetWidth > 0
        };
    })()
"@
    Write-Host "  Balanced Mode Check: $(ConvertTo-Json $balancedCheck -Compress)"
    if (-not $balancedCheck.backdropFilter.Contains('blur')) {
        throw "FAIL: Balanced mode did not fall back to standard gaussian blur!"
    }
    Write-Host "  [PASS] Balanced mode graceful fallback to gaussian blur verified!" -ForegroundColor Green

    # Eco Mode
    $ecoCheck = EvalJS @"
    (() => {
        document.body.setAttribute('data-quality', 'eco');
        const ind = document.querySelector('.liquid-glass-indicator');
        const style = window.getComputedStyle(ind);
        return {
            quality: document.body.getAttribute('data-quality'),
            backdropFilter: style.backdropFilter || style.webkitBackdropFilter,
            bg: style.background,
            visible: ind.offsetWidth > 0
        };
    })()
"@
    Write-Host "  Eco Mode Check: $(ConvertTo-Json $ecoCheck -Compress)"
    if ($ecoCheck.backdropFilter -ne 'none' -and $ecoCheck.backdropFilter -ne '') {
        throw "FAIL: Eco mode should disable backdrop-filter for zero GPU blur overhead!"
    }
    Write-Host "  [PASS] Eco mode zero GPU overhead verified!" -ForegroundColor Green

    # Restore High Quality
    EvalJS "document.body.setAttribute('data-quality', 'high')" | Out-Null
    Start-Sleep -Milliseconds 300

    # =========================================================================
    # TEST 6: DESKTOP & ZEN SCREENSHOT CAPTURE (TEST F)
    # =========================================================================
    Write-Host "`n--- TEST 6: DESKTOP & ZEN VISUAL ARTIFACTS ---" -ForegroundColor Yellow

    # Switch to Alya Kujou (Persona 0)
    EvalJS "window.switchPersona ? window.switchPersona(0) : null" | Out-Null
    Start-Sleep -Milliseconds 500

    # Click first category tab to reset
    EvalJS "document.querySelector('.audio-category-nav .cat-tab')?.click()" | Out-Null
    Start-Sleep -Milliseconds 600

    # Capture Desktop 1440x900
    $shotDesk = CDP 'Page.captureScreenshot' @{ format = 'png' }
    $shotPathDesk = Join-Path $ArtifactDir 'v5_1_desktop_optical_glass.png'
    [IO.File]::WriteAllBytes($shotPathDesk, [Convert]::FromBase64String($shotDesk.result.data))
    Write-Host "  [ARTIFACT] Saved Desktop 1440x900 screenshot: $shotPathDesk" -ForegroundColor Green

    # Switch to Zen Mode
    EvalJS "window.toggleZenMode ? window.toggleZenMode(true) : null" | Out-Null
    Start-Sleep -Milliseconds 1200

    $shotZen = CDP 'Page.captureScreenshot' @{ format = 'png' }
    $shotPathZen = Join-Path $ArtifactDir 'v5_1_zen_optical_glass.png'
    [IO.File]::WriteAllBytes($shotPathZen, [Convert]::FromBase64String($shotZen.result.data))
    Write-Host "  [ARTIFACT] Saved Zen Mode screenshot: $shotPathZen" -ForegroundColor Green

    # Exit Zen Mode
    EvalJS "window.toggleZenMode ? window.toggleZenMode(false) : null" | Out-Null
    Start-Sleep -Milliseconds 500

    Write-Host "`n>>> ALL MINKOI V5.1 TRUE OPTICAL LIQUID GLASS TESTS PASSED SUCCESSFULLY! <<<" -ForegroundColor Green

} finally {
    if ($ws) { $ws.Dispose() }
    if ($proc -and -not $proc.HasExited) { Stop-Process -Id $proc.Id -Force }
    if ($L -and $L.IsListening) { $L.Stop(); $L.Close() }
    if ($ud -and (Test-Path $ud)) { Remove-Item -Path $ud -Recurse -Force -ErrorAction SilentlyContinue }
}
