# verify-chibi-popout.ps1 - Comprehensive QA Verification for Chibi Pop-Out Avatar & Mobile Liquid Glass
param(
    [string]$TargetUrl = "http://127.0.0.1:42894/index.html",
    [int]$Port = 42894,
    [int]$CdpPort = 42895
)

$ErrorActionPreference = "Stop"
Write-Host "=== MINKOI V3.6 CHIBI POP-OUT QA VERIFICATION ===" -ForegroundColor Cyan

$RepoRoot = Get-Item .
$L = $null
$ps = $null

# 1. Start internal static file server if target is local
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

# 2. Find Chromium Browser (Edge or Chrome)
$BrowserExe = @(
    'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',
    'C:\Program Files\Microsoft\Edge\Application\msedge.exe',
    "${env:ProgramFiles}\Google\Chrome\Application\chrome.exe",
    "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
    "${env:LocalAppData}\Google\Chrome\Application\chrome.exe"
) | Where-Object { Test-Path $_ } | Select-Object -First 1

if (-not $BrowserExe) {
    throw "No Chromium browser (Edge or Chrome) found."
}
Write-Host "Using browser: $BrowserExe" -ForegroundColor Gray

$ud = Join-Path $env:TEMP ('chibi_qa_' + [guid]::NewGuid().ToString('N').Substring(0, 8))
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
    $wsUrl = $null
    Start-Sleep -Milliseconds 1200
    for ($try = 0; $try -lt 25; $try++) {
        try {
            $targets = Invoke-RestMethod "http://127.0.0.1:$CdpPort/json/list" -TimeoutSec 2
            $wsUrl = ($targets | Where-Object { $_.type -eq 'page' } | Select-Object -First 1).webSocketDebuggerUrl
            if ($wsUrl) { break }
        } catch {}
        Start-Sleep -Milliseconds 300
    }
    if (-not $wsUrl) { throw "Unable to connect to headless browser CDP" }

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
        $res = CDP 'Runtime.evaluate' @{
            expression = $expr
            returnByValue = $true
        }
        if ($res.result.exceptionDetails) {
            Write-Host "JS Error: $($res.result.exceptionDetails.exception.description)" -ForegroundColor Red
            return $null
        }
        return $res.result.result.value
    }

    function Save-Screenshot([string]$outPath, [hashtable]$clip = $null) {
        $p = @{ format = 'png' }
        if ($clip) { $p['clip'] = $clip }
        $res = CDP 'Page.captureScreenshot' $p
        $b64 = $res.result.data
        if ($b64) {
            $bytes = [System.Convert]::FromBase64String($b64)
            $dir = Split-Path $outPath -Parent
            if ($dir -and -not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
            [System.IO.File]::WriteAllBytes($outPath, $bytes)
            Write-Host "  Screenshot: $outPath ($([Math]::Round($bytes.Length/1024, 1)) KB)" -ForegroundColor Gray
        }
    }

    [void](CDP 'Page.enable')
    [void](CDP 'Runtime.enable')

    Write-Host "Navigating to $TargetUrl ..." -ForegroundColor Cyan
    [void](CDP 'Page.navigate' @{ url = $TargetUrl })
    Start-Sleep -Seconds 3

    # ==========================================
    # VIEWPORT 1: DESKTOP (1440x900)
    # ==========================================
    Write-Host "`n--- VIEWPORT 1: DESKTOP (1440x900) ---" -ForegroundColor Yellow
    [void](CDP 'Emulation.setDeviceMetricsOverride' @{ width = 1440; height = 900; deviceScaleFactor = 1; mobile = $false })
    Start-Sleep -Milliseconds 800

    # Test all 8 personas
    $personaScript = @'
    (function() {
        var results = [];
        var disc = document.querySelector('.avatar-backdrop-disc');
        var img = document.querySelector('#char-avatar');
        var stage = document.querySelector('.avatar-zone');
        if (!disc || !img || !stage) return { error: "Missing avatar elements" };

        var personas = ["alya", "mahiru", "kaoruko", "sakuramiku", "shinobu", "hinako", "umi", "nakanomiku"];

        for (var i = 0; i < personas.length; i++) {
            if (typeof window.setPersona === 'function') {
                window.setPersona(i, false);
            }
            var dR = disc.getBoundingClientRect();
            var iR = img.getBoundingClientRect();

            var topProtrusion = Math.round(dR.top - iR.top);
            var bottomOffset = Math.round(iR.bottom - dR.bottom);

            results.push({
                index: i,
                persona: personas[i],
                discTop: Math.round(dR.top),
                discBottom: Math.round(dR.bottom),
                discHeight: Math.round(dR.height),
                imgTop: Math.round(iR.top),
                imgBottom: Math.round(iR.bottom),
                imgHeight: Math.round(iR.height),
                imgWidth: Math.round(iR.width),
                topProtrusion: topProtrusion,
                bottomOffset: bottomOffset,
                isProtrudingTop: topProtrusion >= 12,
                isGrounded: (iR.bottom >= dR.bottom - 20)
            });
        }
        return results;
    })()
'@

    $pResults = Eval-JS $personaScript
    $desktopPassed = $true
    Write-Host "Desktop Persona Pop-out Results:"
    foreach ($r in $pResults) {
        $pass = $r.isProtrudingTop -and $r.isGrounded
        if (-not $pass) { $desktopPassed = $false }
        $st = if ($pass) { "[PASS]" } else { "[FAIL]" }
        $col = if ($pass) { "Green" } else { "Red" }
        Write-Host "  $st #$($r.index) $($r.persona): Top Protrusion = $($r.topProtrusion)px (Chibi Top: $($r.imgTop), Disc Top: $($r.discTop)), Height = $($r.imgHeight)px, Bottom Offset = $($r.bottomOffset)px" -ForegroundColor $col
    }

    # Reset to Alya (index 0) and take screenshots
    [void](Eval-JS "window.setPersona(0, false)")
    Start-Sleep -Milliseconds 400
    Save-Screenshot "docs/screenshots/v3_6_popout_alya.png"
    Save-Screenshot "docs/screenshots/desktop-preview.png"

    # Switch to Sakura Miku (index 3 in config.js) and take screenshot
    [void](Eval-JS "window.setPersona(3, false)")
    Start-Sleep -Milliseconds 400
    Save-Screenshot "docs/screenshots/v3_6_popout_sakuramiku.png"

    # Reset back to Alya
    [void](Eval-JS "window.setPersona(0, false)")
    Start-Sleep -Milliseconds 200

    # ==========================================
    # VIEWPORT 2: MOBILE (390x844 - iPhone 14)
    # ==========================================
    Write-Host "`n--- VIEWPORT 2: MOBILE (390x844) ---" -ForegroundColor Yellow
    [void](CDP 'Emulation.setDeviceMetricsOverride' @{ width = 390; height = 844; deviceScaleFactor = 2; mobile = $true })
    Start-Sleep -Milliseconds 800

    $mobileCheck = Eval-JS @'
    (function() {
        var disc = document.querySelector('.avatar-backdrop-disc');
        var img = document.querySelector('#char-avatar');
        var nav = document.querySelector('#audio-category-nav');
        var ind = document.querySelector('#audio-category-nav .liquid-glass-indicator');
        var tabs = document.querySelectorAll('#audio-category-nav .cat-tab');

        var dR = disc ? disc.getBoundingClientRect() : null;
        var iR = img ? img.getBoundingClientRect() : null;
        var navR = nav ? nav.getBoundingClientRect() : null;
        var indR = ind ? ind.getBoundingClientRect() : null;

        return {
            protrusion: (dR && iR) ? Math.round(dR.top - iR.top) : null,
            imgHeight: iR ? Math.round(iR.height) : null,
            discHeight: dR ? Math.round(dR.height) : null,
            navVisible: nav ? (window.getComputedStyle(nav).display !== 'none') : false,
            navWidth: navR ? Math.round(navR.width) : 0,
            indicatorVisible: ind ? (window.getComputedStyle(ind).display !== 'none') : false,
            indicatorWidth: indR ? Math.round(indR.width) : 0,
            tabCount: tabs ? tabs.length : 0
        };
    })()
'@

    $mobilePopoutPass = $mobileCheck.protrusion -ge 12
    $mobileNavPass = $mobileCheck.navVisible -and ($mobileCheck.indicatorWidth -gt 0)

    $stPop = if ($mobilePopoutPass) { "[PASS]" } else { "[FAIL]" }
    $stNav = if ($mobileNavPass) { "[PASS]" } else { "[FAIL]" }
    $colPop = if ($mobilePopoutPass) { "Green" } else { "Red" }
    $colNav = if ($mobileNavPass) { "Green" } else { "Red" }

    Write-Host "  $stPop Mobile Pop-out: Protrusion = $($mobileCheck.protrusion)px, Chibi Height = $($mobileCheck.imgHeight)px, Disc Height = $($mobileCheck.discHeight)px" -ForegroundColor $colPop
    Write-Host "  $stNav Mobile Liquid Glass Nav: Visible = $($mobileCheck.navVisible), Width = $($mobileCheck.navWidth)px, Indicator Width = $($mobileCheck.indicatorWidth)px, Tabs = $($mobileCheck.tabCount)" -ForegroundColor $colNav

    Save-Screenshot "docs/screenshots/v3_6_popout_mobile.png"
    Save-Screenshot "docs/screenshots/mobile-preview.png"

    # Copy screenshots to artifact directory
    $brainDir = "C:\Users\Admin\.gemini\antigravity\brain\676897cc-82eb-49fa-8a7e-b684c15d6e09"
    if (Test-Path $brainDir) {
        Copy-Item "docs/screenshots/v3_6_popout_alya.png" (Join-Path $brainDir "v3_6_popout_alya.png") -Force
        Copy-Item "docs/screenshots/v3_6_popout_sakuramiku.png" (Join-Path $brainDir "v3_6_popout_sakuramiku.png") -Force
        Copy-Item "docs/screenshots/v3_6_popout_mobile.png" (Join-Path $brainDir "v3_6_popout_mobile.png") -Force
        Write-Host "`nCopied screenshots to artifact directory." -ForegroundColor Gray
    }

    if ($desktopPassed -and $mobilePopoutPass -and $mobileNavPass) {
        Write-Host "`nALL QA CHECKS PASSED SUCCESSFULLY!" -ForegroundColor Green
        exit 0
    } else {
        Write-Host "`nSOME QA CHECKS FAILED." -ForegroundColor Red
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
