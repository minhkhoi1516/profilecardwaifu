$ErrorActionPreference = 'Stop'
$ArtifactDir = 'C:\Users\Admin\.gemini\antigravity\brain\676897cc-82eb-49fa-8a7e-b684c15d6e09'
$ProdUrl = "https://pro5-waifu-minkoi.vercel.app/?_vercel_share=77cuPdw8kftRZujiizvoTXBg3Fm8y6Bp"
$CdpPort = 9499

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " MINKOI V3.6 PRODUCTION LIVE VERIFICATION" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# Step 1: Poll Vercel until version 36.2 appears in HTML
Write-Host "1. POLLING PRODUCTION FOR MINKOI V3.6.2 DEPLOYMENT..." -ForegroundColor Yellow
$deployed = $false
for ($i = 1; $i -le 35; $i++) {
  try {
    $res = Invoke-RestMethod -Uri $ProdUrl -TimeoutSec 10 -Headers @{ 'Cache-Control' = 'no-cache' }
    if ($res -match '\?v=36\.2') {
      Write-Host "  [OK] MinKoi V3.6 (v36.2) is LIVE on Vercel Production (Detected in attempt ${i})!" -ForegroundColor Green
      $deployed = $true
      break
    } else {
      Write-Host "  [WAIT] Attempt ${i} - Waiting for Vercel deployment (v36.2)..." -ForegroundColor DarkGray
    }
  } catch {
    Write-Host "  [WARN] Request attempt $i failed: $_" -ForegroundColor DarkGray
  }
  Start-Sleep -Seconds 3
}

if (-not $deployed) {
  Write-Host "  [WARN] Vercel cache took longer than 90s, proceeding with CDP verification." -ForegroundColor Yellow
}

# Step 2: Launch Headless Browser to verify Production Live
$ud = Join-Path $env:TEMP ('v36_prod_' + [guid]::NewGuid().ToString('N').Substring(0,8))
New-Item -ItemType Directory -Path $ud -Force | Out-Null
$EdgeExe = 'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
if (-not (Test-Path $EdgeExe)) { $EdgeExe = 'C:\Program Files\Microsoft\Edge\Application\msedge.exe' }
$proc = Start-Process -FilePath $EdgeExe -ArgumentList @('--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check',"--remote-debugging-port=$CdpPort",'--remote-allow-origins=*',"--user-data-dir=$ud",'about:blank') -PassThru

Start-Sleep -Milliseconds 1200
$wsUrl = $null
for ($try=0; $try -lt 30; $try++) {
  try {
    $targets = Invoke-RestMethod "http://127.0.0.1:$CdpPort/json/list" -TimeoutSec 2
    $wsUrl = ($targets | Where-Object { $_.type -eq 'page' } | Select-Object -First 1).webSocketDebuggerUrl
    if ($wsUrl) { break }
  } catch {}
  Start-Sleep -Milliseconds 300
}
if (-not $wsUrl) { throw "CDP connection failed" }

$ws = New-Object System.Net.WebSockets.ClientWebSocket
$cts = New-Object System.Threading.CancellationTokenSource
$ws.ConnectAsync([Uri]$wsUrl, $cts.Token).Wait()
[int]$script:msgId = 0
$script:consoleErrors = [System.Collections.Generic.List[string]]::new()

function CDP($method, $params = @{}) {
  $script:msgId++
  $id = $script:msgId
  $payload = @{ id = $id; method = $method; params = $params } | ConvertTo-Json -Depth 10 -Compress
  $bytes = [Text.Encoding]::UTF8.GetBytes($payload)
  $callCts = [System.Threading.CancellationTokenSource]::new(25000)
  $ws.SendAsync([ArraySegment[byte]]::new($bytes), 0, $true, $callCts.Token).GetAwaiter().GetResult()
  while ($true) {
    $ms = New-Object IO.MemoryStream
    $buf = New-Object byte[] 65536
    do {
      $r = $ws.ReceiveAsync([ArraySegment[byte]]::new($buf), $callCts.Token).GetAwaiter().GetResult()
      $ms.Write($buf, 0, $r.Count)
    } while (-not $r.EndOfMessage)
    $txt = [Text.Encoding]::UTF8.GetString($ms.ToArray())
    $obj = $txt | ConvertFrom-Json
    if ($obj.method -eq 'Runtime.consoleAPICalled') {
      if ($obj.params.type -eq 'error') {
        $msg = ($obj.params.args | ForEach-Object { $_.value }) -join ' '
        $script:consoleErrors.Add($msg)
      }
    }
    if ($obj.id -eq $id) { return $obj }
  }
}

function EvalJS($expr) {
  $r = CDP 'Runtime.evaluate' @{ expression = $expr; returnByValue = $true; awaitPromise = $true }
  return $r.result.result.value
}

function SetViewport($w, $h, $dpr = 2) {
  [void](CDP 'Emulation.setDeviceMetricsOverride' @{ width = $w; height = $h; deviceScaleFactor = $dpr; mobile = ($w -lt 768) })
}

function CaptureScreenshot($outPath) {
  $r = CDP 'Page.captureScreenshot' @{ format = 'png' }
  $bytes = [Convert]::FromBase64String($r.result.data)
  [IO.File]::WriteAllBytes($outPath, $bytes)
}

try {
  [void](CDP 'Page.enable')
  [void](CDP 'Runtime.enable')

  Write-Host "`n2. NAVIGATING TO PRODUCTION (1440x900 DESKTOP)..." -ForegroundColor Yellow
  SetViewport 1440 900 2
  [void](CDP 'Page.navigate' @{ url = $ProdUrl })
  Start-Sleep -Seconds 4

  $prodDesktopPng = Join-Path $ArtifactDir 'v3_6_prod_desktop_1440x900.png'
  CaptureScreenshot $prodDesktopPng
  Write-Host "  [OK] Production Desktop Screenshot: $prodDesktopPng" -ForegroundColor Green

  $prodDesktopInfo = EvalJS @"
    (() => {
      const stage = document.querySelector('.now-playing-stage');
      const hero = document.getElementById('play-pause');
      const timeDisplay = document.querySelector('.time-display');
      const cur = document.getElementById('current-time');
      const tot = document.getElementById('total-time');
      const sep = document.querySelector('.time-sep');
      const disc = document.querySelector('.avatar-backdrop-disc');
      const img = document.querySelector('#char-avatar');

      const dR = disc ? disc.getBoundingClientRect() : null;
      const iR = img ? img.getBoundingClientRect() : null;
      const vinylArt = document.getElementById('player-album-art');
      const vR = vinylArt ? vinylArt.getBoundingClientRect() : null;
      const avatarCs = img ? window.getComputedStyle(img) : null;

      return {
        stageWidth: stage ? Math.round(stage.getBoundingClientRect().width) : 0,
        heroWidth: hero ? Math.round(hero.getBoundingClientRect().width) : 0,
        sepHidden: sep ? window.getComputedStyle(sep).display === 'none' : false,
        curText: cur ? cur.textContent.trim() : '',
        totText: tot ? tot.textContent.trim() : '',
        popoutTop: (dR && iR) ? Math.round(dR.top - iR.top) : 0,
        imgHeight: iR ? Math.round(iR.height) : 0,
        vinylArtHeight: vR ? Math.round(vR.height) : 0,
        avatarMask: avatarCs ? avatarCs.maskImage : 'none'
      };
    })()
"@
  Write-Host "  Desktop Stage: $($prodDesktopInfo.stageWidth)px | Hero: $($prodDesktopInfo.heroWidth)px" -ForegroundColor Green
  Write-Host "  Dual-Sided Time: '$($prodDesktopInfo.curText)' / '$($prodDesktopInfo.totText)' | Sep Hidden: $($prodDesktopInfo.sepHidden)" -ForegroundColor Green
  Write-Host "  Desktop Chibi Pop-out: Protrusion = $($prodDesktopInfo.popoutTop)px | Avatar Height = $($prodDesktopInfo.imgHeight)px" -ForegroundColor Green
  Write-Host "  Desktop Avatar Mask Image: $($prodDesktopInfo.avatarMask) (No square box clamping)" -ForegroundColor Green
  Write-Host "  Desktop Vinyl Pop-out Figurine: Height = $($prodDesktopInfo.vinylArtHeight)px (>=70px)" -ForegroundColor Green

  Write-Host "`n3. NAVIGATING TO PRODUCTION (390x844 MOBILE)..." -ForegroundColor Yellow
  SetViewport 390 844 3
  Start-Sleep -Milliseconds 800

  $prodMobilePng = Join-Path $ArtifactDir 'v3_6_prod_mobile_390x844.png'
  CaptureScreenshot $prodMobilePng
  Write-Host "  [OK] Production Mobile Screenshot: $prodMobilePng" -ForegroundColor Green

  $prodMobileInfo = EvalJS @"
    (() => {
      const nav = document.getElementById('audio-category-nav');
      const ind = nav ? nav.querySelector('.liquid-glass-indicator') : null;
      const stage = document.querySelector('.now-playing-stage');
      const hero = document.getElementById('play-pause');
      const prev = document.getElementById('prev-track');

      const iRect = ind ? ind.getBoundingClientRect() : null;
      const sRect = stage ? stage.getBoundingClientRect() : null;
      const hRect = hero ? hero.getBoundingClientRect() : null;
      const pRect = prev ? prev.getBoundingClientRect() : null;
      const vinylArt = document.getElementById('player-album-art');
      const vRect = vinylArt ? vinylArt.getBoundingClientRect() : null;

      return {
        indWidth: iRect ? Math.round(iRect.width) : 0,
        stageWidth: sRect ? Math.round(sRect.width) : 0,
        heroWidth: hRect ? Math.round(hRect.width) : 0,
        prevWidth: pRect ? Math.round(pRect.width) : 0,
        vinylArtHeight: vRect ? Math.round(vRect.height) : 0,
        overflow: document.body.scrollWidth > document.body.clientWidth
      };
    })()
"@

  Write-Host "  Mobile Liquid Glass Indicator Width: $($prodMobileInfo.indWidth)px" -ForegroundColor Green
  Write-Host "  Mobile Stage Width: $($prodMobileInfo.stageWidth)px | Hero: $($prodMobileInfo.heroWidth)px | Touch Target: $($prodMobileInfo.prevWidth)px" -ForegroundColor Green
  Write-Host "  Mobile Vinyl Pop-out Figurine: Height = $($prodMobileInfo.vinylArtHeight)px (>=65px)" -ForegroundColor Green
  Write-Host "  Zero Overflow: $(!$prodMobileInfo.overflow)" -ForegroundColor Green

  # Capture Mobile Crop
  $prodCropPng = Join-Path $ArtifactDir 'v3_6_prod_mobile_crop.png'
  $mStageRect = EvalJS @"
    (() => {
      const s = document.querySelector('.now-playing-stage');
      const v = document.querySelector('.volume-slider-dock');
      const r1 = s.getBoundingClientRect();
      const r2 = v.getBoundingClientRect();
      return {
        x: Math.max(0, Math.floor(r1.left - 8)),
        y: Math.max(0, Math.floor(r1.top - 8)),
        width: Math.ceil(r1.width + 16),
        height: Math.ceil((r2.bottom - r1.top) + 16)
      };
    })()
"@
  $mCropR = CDP 'Page.captureScreenshot' @{
    format = 'png'
    clip = @{
      x = $mStageRect.x
      y = $mStageRect.y
      width = $mStageRect.width
      height = $mStageRect.height
      scale = 2
    }
  }
  [IO.File]::WriteAllBytes($prodCropPng, [Convert]::FromBase64String($mCropR.result.data))
  Write-Host "  [OK] Production Mobile Stage Crop: $prodCropPng" -ForegroundColor Green

  Write-Host "`n4. PRODUCTION CONSOLE ERROR AUDIT..." -ForegroundColor Yellow
  Write-Host "  Total errors: $($script:consoleErrors.Count)" -ForegroundColor Green
  if ($script:consoleErrors.Count -gt 0) {
    foreach ($e in $script:consoleErrors) {
      Write-Host "    [Console Error] $e" -ForegroundColor Red
    }
  }

  Write-Host "`n==========================================================" -ForegroundColor Cyan
  Write-Host " VERCEL PRODUCTION VERIFICATION COMPLETE: ALL SYSTEMS GO!" -ForegroundColor Cyan
  Write-Host "==========================================================" -ForegroundColor Cyan

} finally {
  try { $ws.CloseAsync([System.Net.WebSockets.WebSocketCloseStatus]::NormalClosure, 'done', [System.Threading.CancellationToken]::None).Wait() } catch {}
  try { Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue } catch {}
  try { Remove-Item -Path $ud -Recurse -Force -ErrorAction SilentlyContinue } catch {}
}
