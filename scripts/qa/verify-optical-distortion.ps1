# verify-optical-distortion.ps1 - Test A: Optical Distortion Verification Suite
$ErrorActionPreference = 'Stop'
$Port = 42944
$CdpPort = 9760
$ArtifactDir = 'C:\Users\Admin\.gemini\antigravity\brain\676897cc-82eb-49fa-8a7e-b684c15d6e09'

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " MINKOI V5.1 TEST A: OPTICAL DISTORTION VERIFICATION" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

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
        '.svg'  = 'image/svg+xml'
    }
    while ($L.IsListening) {
        try {
            $c = $L.GetContext()
            $p = [Uri]::UnescapeDataString($c.Request.Url.AbsolutePath)
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
$ud = Join-Path $env:TEMP ('cdp_distort_' + [guid]::NewGuid().ToString('N').Substring(0,8))
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

    function Snap([string]$outPath) {
        $res = CDP 'Page.captureScreenshot' @{ format = 'png' }
        $bytes = [Convert]::FromBase64String($res.result.data)
        [IO.File]::WriteAllBytes($outPath, $bytes)
        Write-Host "  Captured: $([IO.Path]::GetFileName($outPath))" -ForegroundColor Cyan
        return $bytes
    }

    [void](CDP 'Page.enable')
    [void](CDP 'Runtime.enable')

    [void](CDP 'Emulation.setDeviceMetricsOverride' @{
        width = 1000
        height = 600
        deviceScaleFactor = 1
        mobile = $false
    })

    [void](CDP 'Page.navigate' @{ url = "http://127.0.0.1:$Port/scripts/qa/test_optical_distortion_suite.html" })
    Start-Sleep -Milliseconds 1500

    # 1. State A: Unrefracted Base (Lens Hidden)
    Write-Host "`n1. Capturing Unrefracted Base Reference (No Lens)..." -ForegroundColor Yellow
    EvalJS "document.body.className = 'no-lens'"
    Start-Sleep -Milliseconds 250
    $unrefractedBytes = Snap (Join-Path $ArtifactDir "optical_stage_unrefracted.png")

    # 2. State B: Comparative Control (Flat Blur Overlay)
    Write-Host "`n2. Capturing Flat Blur Control (Non-Refractive Blur)..." -ForegroundColor Yellow
    EvalJS "document.body.className = 'flat-overlay'"
    Start-Sleep -Milliseconds 250
    $flatBlurBytes = Snap (Join-Path $ArtifactDir "optical_stage_flat_blur.png")

    # 3. State C: True Refractive Liquid Lens
    Write-Host "`n3. Capturing True Optical Liquid Glass Refraction..." -ForegroundColor Yellow
    EvalJS "document.body.className = ''"
    Start-Sleep -Milliseconds 300
    $refractedBytes = Snap (Join-Path $ArtifactDir "optical_stage_refracted.png")

    # 4. Mathematical Pixel Displacement Analysis
    Write-Host "`n4. Computing Spatial Pixel Displacement Matrix..." -ForegroundColor Yellow
    Add-Type -AssemblyName System.Drawing

    $bmpUnref = [System.Drawing.Bitmap]::FromStream([System.IO.MemoryStream]::new($unrefractedBytes))
    $bmpRef = [System.Drawing.Bitmap]::FromStream([System.IO.MemoryStream]::new($refractedBytes))
    $bmpBlur = [System.Drawing.Bitmap]::FromStream([System.IO.MemoryStream]::new($flatBlurBytes))

    $cropRect = [System.Drawing.Rectangle]::new(350, 240, 300, 120)
    
    $cropUnref = $bmpUnref.Clone($cropRect, $bmpUnref.PixelFormat)
    $cropUnref.Save((Join-Path $ArtifactDir "crop_test_unrefracted.png"), [System.Drawing.Imaging.ImageFormat]::Png)

    $cropRef = $bmpRef.Clone($cropRect, $bmpRef.PixelFormat)
    $cropRef.Save((Join-Path $ArtifactDir "crop_test_refracted.png"), [System.Drawing.Imaging.ImageFormat]::Png)

    $cropBlur = $bmpBlur.Clone($cropRect, $bmpBlur.PixelFormat)
    $cropBlur.Save((Join-Path $ArtifactDir "crop_test_flat_blur.png"), [System.Drawing.Imaging.ImageFormat]::Png)

    function FindRedPeak([System.Drawing.Bitmap]$b, [int]$y) {
        $maxR = 0
        $bestX = -1
        for ($x = 0; $x -lt $b.Width; $x++) {
            $p = $b.GetPixel($x, $y)
            $score = [int]$p.R - [int]$p.G
            if ($score -gt $maxR -and $p.R -gt 130) {
                $maxR = $score
                $bestX = $x
            }
        }
        return $bestX
    }

    $scanlines = @(30, 45, 60, 75)
    $maxDisplacement = 0
    $shifts = @()

    foreach ($y in $scanlines) {
        $xUnref = FindRedPeak $cropUnref $y
        $xRef = FindRedPeak $cropRef $y
        $xBlur = FindRedPeak $cropBlur $y

        $shiftRef = if ($xUnref -ge 0 -and $xRef -ge 0) { [Math]::Abs($xRef - $xUnref) } else { 0 }
        $shiftBlur = if ($xUnref -ge 0 -and $xBlur -ge 0) { [Math]::Abs($xBlur - $xUnref) } else { 0 }

        if ($shiftRef -gt $maxDisplacement) { $maxDisplacement = $shiftRef }
        $shifts += [PSCustomObject]@{
            CropY = $y
            Base_X = $xUnref
            Refracted_X = $xRef
            Displacement_px = $shiftRef
        }
    }

    Write-Host "`nSpatial Shift Table:" -ForegroundColor Cyan
    $shifts | Format-Table -AutoSize | Out-String | Write-Host -ForegroundColor Cyan

    $cropUnref.Dispose()
    $cropRef.Dispose()
    $cropBlur.Dispose()
    $bmpUnref.Dispose()
    $bmpRef.Dispose()
    $bmpBlur.Dispose()

    Write-Host "Max spatial pixel displacement observed: $maxDisplacement px" -ForegroundColor Yellow
    if ($maxDisplacement -ge 2) {
        Write-Host "`n>>> [TEST A PASS] TRUE SPATIAL OPTICAL DISPLACEMENT CONFIRMED ($maxDisplacement px >= 2 px threshold) <<<" -ForegroundColor Green
    } else {
        throw "[TEST A FAILED] No spatial displacement detected! (Max shift: $maxDisplacement px)"
    }

} finally {
    if ($ws -and $ws.State -eq 'Open') { try { $ws.CloseAsync([System.Net.WebSockets.WebSocketCloseStatus]::NormalClosure, 'Done', [System.Threading.CancellationToken]::None).Wait() } catch {} }
    if ($proc -and -not $proc.HasExited) { $proc.Kill(); $proc.WaitForExit() }
    if ($L -and $L.IsListening) { $L.Stop() }
    if ($ps) { $ps.Dispose() }
    if ($rs) { $rs.Dispose() }
    if ($ud -and (Test-Path $ud)) { try { Remove-Item -Recurse -Force $ud -ErrorAction SilentlyContinue } catch {} }
}
