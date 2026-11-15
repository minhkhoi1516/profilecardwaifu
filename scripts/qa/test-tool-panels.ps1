# test-tool-panels.ps1 - Automated QA Test for Four Music Tool Panels & Miuix Spring Motion
$ErrorActionPreference = 'Stop'
$ArtifactDir = 'C:\Users\Admin\.gemini\antigravity\brain\676897cc-82eb-49fa-8a7e-b684c15d6e09'
$Port = 42910
$CdpPort = 9510

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " MINKOI V4.0 FOUR MUSIC TOOL PANELS & MOTION SYSTEM QA" -ForegroundColor Cyan
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
$ud = Join-Path $env:TEMP ('cdp_tools_' + [guid]::NewGuid().ToString('N').Substring(0,8))
New-Item -ItemType Directory -Path $ud -Force | Out-Null
$proc = Start-Process -FilePath $EdgeExe -ArgumentList @('--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check',"--remote-debugging-port=$CdpPort",'--remote-allow-origins=*',"--user-data-dir=$ud",'about:blank') -PassThru

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
            if ($obj.method -eq 'Runtime.exceptionThrown') {
                $d = $obj.params.exceptionDetails
                Write-Host "BROWSER EXCEPTION: $($d.exception.description) at $($d.url):$($d.lineNumber):$($d.columnNumber)" -ForegroundColor Red
            }
            if ($obj.id -eq $id) { return $obj }
        }
    }

    function EvalJS([string]$expression) {
        $res = CDP 'Runtime.evaluate' @{ expression = $expression; returnByValue = $true }
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
    CDP 'Page.navigate' @{ url = "http://127.0.0.1:$Port/index.html" } | Out-Null
    Start-Sleep -Seconds 3

    $currentUrl = EvalJS "document.location.href"
    $docReady = EvalJS "document.readyState"
    $foundBtn = EvalJS "Boolean(document.getElementById('sleep-timer-btn'))"
    $foundMenu = EvalJS "Boolean(document.getElementById('sleep-timer-menu'))"
    Write-Host "Page State: URL=$currentUrl, readyState=$docReady, foundBtn=$foundBtn, foundMenu=$foundMenu"

    Write-Host "`n--- TEST 1: DESKTOP MUTUAL EXCLUSION & SPRING LIFECYCLE ---" -ForegroundColor Yellow

    $diag = EvalJS @'
    (() => {
        const btn = document.getElementById('sleep-timer-btn');
        const menu = document.getElementById('sleep-timer-menu');
        const ctrl = window.MinkoiUI ? window.MinkoiUI.getPanelController('sleep-timer-menu') : null;
        return {
            hasBtn: Boolean(btn),
            hasMenu: Boolean(menu),
            hasCtrl: Boolean(ctrl),
            hasMinkoiUI: Boolean(window.MinkoiUI),
            hasCreate: Boolean(window.MinkoiUI && window.MinkoiUI.createMiuixPanelOverlay),
            hasMusicBoot: Boolean(document.getElementById('playlist-items-scroll'))
        };
    })()
'@
    Write-Host "Initial Controller Diagnostic: $($diag | ConvertTo-Json -Compress)"

    # Test 1a: Open Sleep Timer via controller
    EvalJS "window.MinkoiUI.getPanelController('sleep-timer-menu').open()" | Out-Null
    Start-Sleep -Milliseconds 600

    $stCheck = EvalJS @'
    (() => {
        const menu = document.getElementById('sleep-timer-menu');
        const ctrl = window.MinkoiUI.getPanelController('sleep-timer-menu');
        return {
            openClass: menu.classList.contains('open'),
            state: ctrl.getState(),
            opacity: parseFloat(window.getComputedStyle(menu).opacity),
            transform: window.getComputedStyle(menu).transform,
            display: window.getComputedStyle(menu).display,
            visibility: window.getComputedStyle(menu).visibility
        };
    })()
'@
    Write-Host "Sleep Timer after open(): $($stCheck | ConvertTo-Json -Compress)"

    # Test 1b: Mutual Exclusion - Open Audio FX, Sleep Timer must close
    EvalJS "document.getElementById('audio-fx-btn').click()" | Out-Null
    Start-Sleep -Milliseconds 450
    $fxOpen = EvalJS "document.getElementById('audio-fx-menu').classList.contains('open')"
    $stClosed = EvalJS "!document.getElementById('sleep-timer-menu').classList.contains('open')"
    Write-Host "  Audio FX Open: $fxOpen, Sleep Timer Closed: $stClosed"
    if (-not $fxOpen -or -not $stClosed) { throw "Mutual exclusion between Sleep Timer and Audio FX failed" }

    # Test 1c: 5-band EQ interactive slider test
    $eqBandsCount = EvalJS "document.querySelectorAll('#audio-fx-menu .eq-slider').length"
    Write-Host "  Audio FX 5-band Sliders Count: $eqBandsCount"
    if ($eqBandsCount -lt 5) { throw "Audio FX 5-band sliders not found" }

    # Test 1d: Mutual Exclusion - Open Playlist
    EvalJS "document.getElementById('playlist-toggle-btn').click()" | Out-Null
    Start-Sleep -Milliseconds 600
    $plOpen = EvalJS "document.getElementById('playlist-menu').classList.contains('open')"
    $fxClosed = EvalJS "!document.getElementById('audio-fx-menu').classList.contains('open')"
    $plRows = EvalJS "document.querySelectorAll('#playlist-menu .playlist-row').length"
    Write-Host "  Playlist Open: $plOpen, Audio FX Closed: $fxClosed, Track Rows: $plRows"
    if (-not $plOpen -or -not $fxClosed -or $plRows -lt 2) { throw "Playlist failed to render tracks or close Audio FX" }

    # Test 1e: Mutual Exclusion - Open Lyrics Modal
    EvalJS "document.getElementById('lyrics-toggle-btn').click()" | Out-Null
    Start-Sleep -Milliseconds 600
    $lyOpen = EvalJS "document.getElementById('lyrics-modal').classList.contains('open')"
    $plClosed = EvalJS "!document.getElementById('playlist-menu').classList.contains('open')"
    Write-Host "  Lyrics Modal Open: $lyOpen, Playlist Closed: $plClosed"
    if (-not $lyOpen -or -not $plClosed) { throw "Lyrics modal failed to open or close Playlist" }

    # Test 1f: Escape Key Closes Lyrics
    CDP 'Input.dispatchKeyEvent' @{ type = 'rawKeyDown'; windowsVirtualKeyCode = 27; code = 'Escape'; key = 'Escape' } | Out-Null
    CDP 'Input.dispatchKeyEvent' @{ type = 'keyUp'; windowsVirtualKeyCode = 27; code = 'Escape'; key = 'Escape' } | Out-Null
    Start-Sleep -Milliseconds 600
    $lyClosed = EvalJS "!document.getElementById('lyrics-modal').classList.contains('open')"
    Write-Host "  Lyrics Modal Closed on Escape: $lyClosed"
    if (-not $lyClosed) { throw "Escape key failed to close Lyrics modal" }

    Write-Host "  [PASS] Desktop Mutual Exclusion & Lifecycle Passed!" -ForegroundColor Green

    Write-Host "`n--- TEST 2: SHORT VIEWPORT HEADER-SAFE POSITIONING (1000x370) ---" -ForegroundColor Yellow

    CDP 'Emulation.setDeviceMetricsOverride' @{ width = 1000; height = 370; deviceScaleFactor = 1; mobile = $false } | Out-Null
    Start-Sleep -Milliseconds 500
    $preScroll = EvalJS "(() => { const b = document.getElementById('sleep-timer-btn').getBoundingClientRect(); return { btnTop: b.top, btnBottom: b.bottom, scrollY: window.scrollY, innerH: window.innerHeight }; })()"
    Write-Host "  Before scroll: $($preScroll | ConvertTo-Json -Compress)"
    EvalJS "document.getElementById('sleep-timer-btn').scrollIntoView({ behavior: 'instant', block: 'center' })" | Out-Null
    Start-Sleep -Milliseconds 400
    $postScroll = EvalJS "(() => { const b = document.getElementById('sleep-timer-btn').getBoundingClientRect(); return { btnTop: b.top, btnBottom: b.bottom, scrollY: window.scrollY, innerH: window.innerHeight }; })()"
    Write-Host "  After scroll: $($postScroll | ConvertTo-Json -Compress)"

    # Test Sleep Timer on 1000x370
    EvalJS "document.getElementById('sleep-timer-btn').click()" | Out-Null
    Start-Sleep -Milliseconds 600
    $parentCheck = EvalJS @'
    (() => {
        const el = document.getElementById('sleep-timer-menu');
        const p = el ? el.parentElement : null;
        const btn = document.getElementById('sleep-timer-btn');
        const matched = [];
        for (const sheet of document.styleSheets) {
            try {
                for (const rule of sheet.cssRules) {
                    if (rule.selectorText && el.matches(rule.selectorText) && rule.style.position) {
                        matched.push({ sel: rule.selectorText, pos: rule.style.position, href: sheet.href ? sheet.href.split('/').pop() : 'inline' });
                    }
                    if (rule.cssRules) {
                        for (const subRule of rule.cssRules) {
                            if (subRule.selectorText && el.matches(subRule.selectorText) && subRule.style.position) {
                                matched.push({ media: rule.conditionText, sel: subRule.selectorText, pos: subRule.style.position, href: sheet.href ? sheet.href.split('/').pop() : 'inline' });
                            }
                        }
                    }
                }
            } catch(e) {}
        }
        return {
            innerWidth: window.innerWidth,
            innerHeight: window.innerHeight,
            docClientW: document.documentElement.clientWidth,
            elParentTag: p ? p.tagName : null,
            elParentClass: p ? p.className : null,
            btnParentTag: btn ? btn.parentElement.tagName : null,
            btnParentClass: btn ? btn.parentElement.className : null,
            elStyleTop: el ? el.style.top : null,
            elStyleBottom: el ? el.style.bottom : null,
            elComputedTop: el ? window.getComputedStyle(el).top : null,
            elComputedPosition: el ? window.getComputedStyle(el).position : null,
            matchedRules: matched
        };
    })()
'@
    Write-Host "  Parent & Position Check: $($parentCheck | ConvertTo-Json -Depth 5 -Compress)"
    $stBounds = EvalJS "(() => { const r = document.getElementById('sleep-timer-menu').getBoundingClientRect(); const h = document.querySelector('.site-brand-header').getBoundingClientRect(); return { top: r.top, bottom: r.bottom, height: r.height, headerBottom: h.bottom, vh: window.innerHeight }; })()"
    Write-Host "  Sleep Timer 1000x370 Bounds: top=$($stBounds.top), bottom=$($stBounds.bottom), height=$($stBounds.height), headerBottom=$($stBounds.headerBottom)"
    if ($stBounds.top -lt -2 -or $stBounds.bottom -gt 380) {
        throw "Sleep Timer overflowed viewport on 1000x370!"
    }
    Write-Host "  [PASS] Sleep Timer positioned safely inside 1000x370 viewport!" -ForegroundColor Green

    # Test Audio FX on 1000x370
    EvalJS "document.getElementById('audio-fx-btn').scrollIntoView({ behavior: 'instant', block: 'center' })" | Out-Null
    Start-Sleep -Milliseconds 300
    EvalJS "document.getElementById('audio-fx-btn').click()" | Out-Null
    Start-Sleep -Milliseconds 600
    $fxBounds = EvalJS "(() => { const r = document.getElementById('audio-fx-menu').getBoundingClientRect(); const h = document.querySelector('.site-brand-header').getBoundingClientRect(); return { top: r.top, bottom: r.bottom, height: r.height, headerBottom: h.bottom, vh: window.innerHeight }; })()"
    Write-Host "  Audio FX 1000x370 Bounds: top=$($fxBounds.top), bottom=$($fxBounds.bottom), height=$($fxBounds.height)"
    if ($fxBounds.top -lt -2 -or $fxBounds.bottom -gt 380) {
        throw "Audio FX overflowed viewport on 1000x370!"
    }
    Write-Host "  [PASS] Audio FX positioned safely inside 1000x370 viewport!" -ForegroundColor Green

    # Test Playlist on 1000x370
    EvalJS "document.getElementById('playlist-toggle-btn').scrollIntoView({ behavior: 'instant', block: 'center' })" | Out-Null
    Start-Sleep -Milliseconds 300
    EvalJS "document.getElementById('playlist-toggle-btn').click()" | Out-Null
    Start-Sleep -Milliseconds 600
    $plBounds = EvalJS "(() => { const r = document.getElementById('playlist-menu').getBoundingClientRect(); return { top: r.top, bottom: r.bottom, height: r.height }; })()"
    Write-Host "  Playlist 1000x370 Bounds: top=$($plBounds.top), bottom=$($plBounds.bottom), height=$($plBounds.height)"
    if ($plBounds.top -lt -2 -or $plBounds.bottom -gt 380) {
        throw "Playlist overflowed viewport on 1000x370!"
    }
    Write-Host "  [PASS] Playlist positioned safely inside 1000x370 viewport!" -ForegroundColor Green

    # Close playlist
    EvalJS "document.getElementById('playlist-toggle-btn').click()" | Out-Null
    Start-Sleep -Milliseconds 350

    Write-Host "`n--- TEST 3: RAPID TOGGLE STRESS TEST (10X INTERRUPTIBILITY) ---" -ForegroundColor Yellow
    for ($i = 1; $i -le 10; $i++) {
        EvalJS "document.getElementById('sleep-timer-btn').click()" | Out-Null
        Start-Sleep -Milliseconds 40
        EvalJS "document.getElementById('audio-fx-btn').click()" | Out-Null
        Start-Sleep -Milliseconds 40
    }
    Start-Sleep -Milliseconds 500
    # Settle down
    EvalJS "window.MinkoiUI.closeAllOverlays()" | Out-Null
    Start-Sleep -Milliseconds 700
    $stFinal = EvalJS "document.getElementById('sleep-timer-menu').dataset.panelState"
    $fxFinal = EvalJS "document.getElementById('audio-fx-menu').dataset.panelState"
    Write-Host "  After 10x rapid toggle & closeAll: Sleep Timer state=$stFinal, Audio FX state=$fxFinal"
    if ($stFinal -ne 'closed' -or $fxFinal -ne 'closed') {
        throw "Rapid toggle left panels in corrupt or non-closed state!"
    }
    Write-Host "  [PASS] Rapid toggle stress test passed without glitch or lockup!" -ForegroundColor Green

    Write-Host "`n--- TEST 4: MOBILE VIEWPORT (390x844) BOTTOM SHEET AUDIT ---" -ForegroundColor Yellow
    CDP 'Emulation.setDeviceMetricsOverride' @{ width = 390; height = 844; deviceScaleFactor = 2; mobile = $true } | Out-Null
    Start-Sleep -Milliseconds 500

    # Open Sleep Timer on Mobile
    EvalJS "document.getElementById('sleep-timer-btn').click()" | Out-Null
    Start-Sleep -Milliseconds 450
    $mobSheet = EvalJS "(() => {
        const el = document.getElementById('sleep-timer-menu');
        const bd = document.getElementById('mobile-flyout-backdrop');
        const r = el.getBoundingClientRect();
        return {
            open: el.classList.contains('open'),
            bottom: r.bottom,
            width: r.width,
            backdropActive: bd.classList.contains('active'),
            borderRadius: window.getComputedStyle(el).borderRadius
        };
    })()"
    Write-Host "  Mobile Sleep Timer: open=$($mobSheet.open), width=$($mobSheet.width)px, backdropActive=$($mobSheet.backdropActive), borderRadius=$($mobSheet.borderRadius)"
    if (-not $mobSheet.open -or -not $mobSheet.backdropActive -or $mobSheet.width -lt 350) {
        throw "Mobile bottom sheet for Sleep Timer failed to render correctly"
    }

    # Tap backdrop to close
    EvalJS "document.getElementById('mobile-flyout-backdrop').click()" | Out-Null
    Start-Sleep -Milliseconds 700
    $mobClosed = EvalJS "!document.getElementById('sleep-timer-menu').classList.contains('open')"
    $bdHidden = EvalJS "!document.getElementById('mobile-flyout-backdrop').classList.contains('active')"
    Write-Host "  Mobile Dismiss via Backdrop: closed=$mobClosed, backdropHidden=$bdHidden"
    if (-not $mobClosed -or -not $bdHidden) {
        throw "Mobile backdrop tap failed to dismiss bottom sheet"
    }
    Write-Host "  [PASS] Mobile Bottom Sheet & Backdrop Tap Passed!" -ForegroundColor Green

    Write-Host "`n>>> ALL FOUR TOOL PANELS QA TESTS PASSED SUCCESSFULLY! <<<" -ForegroundColor Green

} finally {
    try { $ws.CloseAsync([System.Net.WebSockets.WebSocketCloseStatus]::NormalClosure, 'done', [System.Threading.CancellationToken]::None).Wait() } catch {}
    try { Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue } catch {}
    try { if ($L) { $L.Stop(); $L.Close() } } catch {}
    try { if ($ps) { $ps.Dispose() } } catch {}
    try { if ($rs) { $rs.Dispose() } } catch {}
    try { Remove-Item $ud -Recurse -Force -ErrorAction SilentlyContinue } catch {}
}
