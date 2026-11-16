# profile-perf.ps1 - Automated Performance Profiler for MinKoi
param([string]$OutputName = "baseline")

$ErrorActionPreference = 'Stop'
$Port = 42970
$CdpPort = 9770

# 1. Start local HTTP server
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

$EdgeExe = 'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
if (-not (Test-Path $EdgeExe)) { $EdgeExe = 'C:\Program Files\Microsoft\Edge\Application\msedge.exe' }
$ud = Join-Path $env:TEMP ('cdp_prof_' + [guid]::NewGuid().ToString('N').Substring(0,8))
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
        $callCts = New-Object System.Threading.CancellationTokenSource(25000)
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
    CDP 'Performance.enable' | Out-Null

    # Set Desktop Viewport 1440x900
    CDP 'Emulation.setDeviceMetricsOverride' @{ width = 1440; height = 900; deviceScaleFactor = 1; mobile = $false } | Out-Null
    CDP 'Page.navigate' @{ url = "http://127.0.0.1:$Port/index.html" } | Out-Null
    Start-Sleep -Seconds 3

    function GetPerfMetrics() {
        $r = CDP 'Performance.getMetrics'
        $ht = @{}
        $r.result.metrics | ForEach-Object { $ht[$_.name] = $_.value }
        return $ht
    }

    $m0 = GetPerfMetrics

    # Test Phase 1: Rapid Tab Transitions (10 switches)
    $tabPerf = EvalJS @"
    new Promise(resolve => {
        const tabs = Array.from(document.querySelectorAll('.audio-category-nav .cat-tab'));
        if (!tabs.length) return resolve({ error: 'no tabs' });

        const frameTimes = [];
        let lastTime = performance.now();
        let running = true;

        function measure(now) {
            frameTimes.push(now - lastTime);
            lastTime = now;
            if (running) requestAnimationFrame(measure);
        }
        requestAnimationFrame(measure);

        let step = 0;
        const interval = setInterval(() => {
            step++;
            const t = tabs[step % tabs.length];
            t.click();
            if (step >= 12) {
                clearInterval(interval);
                setTimeout(() => {
                    running = false;
                    setTimeout(() => {
                        // Compute stats
                        frameTimes.shift(); // drop first frame
                        frameTimes.sort((a,b) => a - b);
                        const count = frameTimes.length;
                        const avg = frameTimes.reduce((a,b) => a + b, 0) / count;
                        const p50 = frameTimes[Math.floor(count * 0.50)];
                        const p95 = frameTimes[Math.floor(count * 0.95)];
                        const p99 = frameTimes[Math.floor(count * 0.99)];
                        const max = frameTimes[count - 1];
                        const dropped = frameTimes.filter(f => f > 20).length;
                        const longTasks = frameTimes.filter(f => f > 50).length;
                        resolve({
                            sampleCount: count,
                            avgFrameMs: Math.round(avg * 10) / 10,
                            fps: Math.round(1000 / avg),
                            p50FrameMs: Math.round(p50 * 10) / 10,
                            p95FrameMs: Math.round(p95 * 10) / 10,
                            p99FrameMs: Math.round(p99 * 10) / 10,
                            maxFrameMs: Math.round(max * 10) / 10,
                            droppedFramesOver20ms: dropped,
                            longFramesOver50ms: longTasks
                        });
                    }, 200);
                }, 600);
            }
        }, 120);
    })
"@

    $m1 = GetPerfMetrics

    # Test Phase 2: High-Frequency Pointer Drag (50 move events)
    $dragPerf = EvalJS @"
    new Promise(resolve => {
        const nav = document.getElementById('audio-category-nav');
        const activeTab = nav.querySelector('.cat-tab.active') || nav.querySelector('.cat-tab');
        const tabRect = activeTab.getBoundingClientRect();
        const startX = tabRect.left + tabRect.width / 2;
        const startY = tabRect.top + tabRect.height / 2;

        nav.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: startX, clientY: startY, pointerId: 1, isPrimary: true }));

        const frameTimes = [];
        let lastTime = performance.now();
        let running = true;

        function record(now) {
            frameTimes.push(now - lastTime);
            lastTime = now;
            if (running) requestAnimationFrame(record);
        }
        requestAnimationFrame(record);

        let i = 0;
        const dragTimer = setInterval(() => {
            i++;
            const offsetX = Math.sin(i * 0.2) * 120;
            nav.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX: startX + offsetX, clientY: startY, pointerId: 1, isPrimary: true }));
            if (i >= 60) {
                clearInterval(dragTimer);
                nav.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, clientX: startX, clientY: startY, pointerId: 1, isPrimary: true }));
                setTimeout(() => {
                    running = false;
                    frameTimes.shift();
                    frameTimes.sort((a,b) => a - b);
                    const count = frameTimes.length;
                    const avg = frameTimes.reduce((a,b) => a + b, 0) / count;
                    const p50 = frameTimes[Math.floor(count * 0.50)];
                    const p95 = frameTimes[Math.floor(count * 0.95)];
                    const p99 = frameTimes[Math.floor(count * 0.99)];
                    resolve({
                        sampleCount: count,
                        avgFrameMs: Math.round(avg * 10) / 10,
                        fps: Math.round(1000 / avg),
                        p50FrameMs: Math.round(p50 * 10) / 10,
                        p95FrameMs: Math.round(p95 * 10) / 10,
                        p99FrameMs: Math.round(p99 * 10) / 10,
                        maxFrameMs: Math.round(frameTimes[count - 1] * 10) / 10,
                        droppedFramesOver20ms: frameTimes.filter(f => f > 20).length,
                        longFramesOver50ms: frameTimes.filter(f => f > 50).length
                    });
                }, 300);
            }
        }, 16);
    })
"@

    $m2 = GetPerfMetrics

    $report = @{
        Profile = $OutputName
        TabSwitch = $tabPerf
        DragGesture = $dragPerf
        MetricsDiff = @{
            LayoutCount = ($m2['LayoutCount'] - $m0['LayoutCount'])
            RecalcStyleCount = ($m2['RecalcStyleCount'] - $m0['RecalcStyleCount'])
            LayoutDurationSec = [Math]::Round(($m2['LayoutDuration'] - $m0['LayoutDuration']), 4)
            RecalcStyleDurationSec = [Math]::Round(($m2['RecalcStyleDuration'] - $m0['RecalcStyleDuration']), 4)
            ScriptDurationSec = [Math]::Round(($m2['ScriptDuration'] - $m0['ScriptDuration']), 4)
            JSHeapUsedMB = [Math]::Round(($m2['JSHeapUsedSize'] / 1048576), 2)
            JSHeapDeltaMB = [Math]::Round((($m2['JSHeapUsedSize'] - $m0['JSHeapUsedSize']) / 1048576), 3)
        }
    }

    $outJson = $report | ConvertTo-Json -Depth 5
    Write-Host "`n================ PERF PROFILE RESULTS ($OutputName) ================" -ForegroundColor Cyan
    Write-Host $outJson
    Write-Host "====================================================================`n" -ForegroundColor Cyan

    $outPath = Join-Path (Get-Item .).FullName "scripts\qa\perf_$OutputName.json"
    [IO.File]::WriteAllText($outPath, $outJson)

} finally {
    if ($ws) { $ws.Dispose() }
    if ($proc -and -not $proc.HasExited) { Stop-Process -Id $proc.Id -Force }
    if ($L -and $L.IsListening) { $L.Stop(); $L.Close() }
    if ($ud -and (Test-Path $ud)) { Remove-Item -Path $ud -Recurse -Force -ErrorAction SilentlyContinue }
}
