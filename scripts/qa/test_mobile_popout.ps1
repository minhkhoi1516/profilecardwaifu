param(
    [string]$TargetUrl = "http://127.0.0.1:42894/index.html",
    [int]$Port = 42894,
    [int]$CdpPort = 42895
)

$RepoRoot = Get-Item .
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

$BrowserExe = @(
    'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',
    'C:\Program Files\Microsoft\Edge\Application\msedge.exe',
    "${env:ProgramFiles}\Google\Chrome\Application\chrome.exe"
) | Where-Object { Test-Path $_ } | Select-Object -First 1

$ud = Join-Path $env:TEMP ('test_mobile_' + [guid]::NewGuid().ToString('N').Substring(0, 8))
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

try {
    Start-Sleep -Milliseconds 1200
    $targets = Invoke-RestMethod "http://127.0.0.1:$CdpPort/json/list" -TimeoutSec 2
    $wsUrl = ($targets | Where-Object { $_.type -eq 'page' } | Select-Object -First 1).webSocketDebuggerUrl

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

    [void](CDP 'Page.enable')
    [void](CDP 'Runtime.enable')
    [void](CDP 'Page.navigate' @{ url = $TargetUrl })
    Start-Sleep -Seconds 3

    # Set mobile viewport 390x844 (iPhone 14 / modern flagship)
    [void](CDP 'Emulation.setDeviceMetricsOverride' @{ width = 390; height = 844; deviceScaleFactor = 2; mobile = $true })
    Start-Sleep -Milliseconds 600

    # Switch persona to Kaoruko
    [void](CDP 'Runtime.evaluate' @{ expression = 'window.setPersona(4)' })
    Start-Sleep -Milliseconds 800

    # Measure mobile elements
    $metrics = (CDP 'Runtime.evaluate' @{
        expression = @'
        (function() {
            var vinyl = document.querySelector("#vinyl-disc").getBoundingClientRect();
            var vinylArt = document.querySelector("#player-album-art").getBoundingClientRect();
            var avatar = document.querySelector("#char-avatar").getBoundingClientRect();
            var avatarDisc = document.querySelector(".avatar-backdrop-disc").getBoundingClientRect();
            return JSON.stringify({
                vinylH: vinyl.height,
                vinylArtH: vinylArt.height,
                vinylProtrusion: Math.round(vinyl.top - vinylArt.top),
                avatarH: avatar.height,
                avatarDiscH: avatarDisc.height,
                avatarProtrusion: Math.round(avatarDisc.top - avatar.top)
            });
        })()
'@
        returnByValue = $true
    }).result.result.value | ConvertFrom-Json

    Write-Host "Mobile Metrics:" -ForegroundColor Cyan
    Write-Host "  Vinyl Platter Height: $($metrics.vinylH)px"
    Write-Host "  Vinyl Figurine Height: $($metrics.vinylArtH)px"
    Write-Host "  Vinyl Figurine Protrusion: $($metrics.vinylProtrusion)px (Pop-Out above disc!)"
    Write-Host "  Avatar Portrait Height: $($metrics.avatarH)px"
    Write-Host "  Avatar Pedestal Height: $($metrics.avatarDiscH)px"
    Write-Host "  Avatar Protrusion: $($metrics.avatarProtrusion)px (Pop-Out above pedestal!)"

    # Take mobile screenshot
    $resMob = CDP 'Page.captureScreenshot' @{ format = 'png' }
    [IO.File]::WriteAllBytes('C:/Users/Admin/.gemini/antigravity/brain/676897cc-82eb-49fa-8a7e-b684c15d6e09/mobile_popout_verified.png', [Convert]::FromBase64String($resMob.result.data))
    Write-Host "Mobile screenshot captured!" -ForegroundColor Green

} finally {
    if ($ws) { $ws.Dispose() }
    if ($proc -and -not $proc.HasExited) { Stop-Process -Id $proc.Id -Force }
    if ($L -and $L.IsListening) { $L.Stop(); $L.Close() }
    if ($ud -and (Test-Path $ud)) { Remove-Item -Path $ud -Recurse -Force -ErrorAction SilentlyContinue }
}
