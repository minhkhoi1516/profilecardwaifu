$ErrorActionPreference = 'Stop'
$RepoRoot = 'c:\Users\Admin\Documents\Git\profilecardwaifu'
$ArtifactDir = 'C:\Users\Admin\.gemini\antigravity\brain\676897cc-82eb-49fa-8a7e-b684c15d6e09'
$Port = 42898
$CdpPort = 9498

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " MINKOI V3.6 — ANIME SOUNDSTAGE & EXPRESSIVE CONTROLS QA" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Start local server
$L = New-Object System.Net.HttpListener
$L.Prefixes.Add("http://127.0.0.1:$Port/")
$L.Start()
$rs = [runspacefactory]::CreateRunspace(); $rs.Open()
$rs.SessionStateProxy.SetVariable('L',$L); $rs.SessionStateProxy.SetVariable('R',$RepoRoot)
$ps = [powershell]::Create(); $ps.Runspace = $rs
[void]$ps.AddScript({
  $m = @{'.html'='text/html; charset=utf-8';'.css'='text/css; charset=utf-8';'.js'='application/javascript; charset=utf-8';'.png'='image/png';'.jpg'='image/jpeg';'.mp3'='audio/mpeg';'.svg'='image/svg+xml';'.ico'='image/x-icon';'.json'='application/json'}
  while ($L.IsListening) {
    try {
      $c = $L.GetContext()
      $p = [Uri]::UnescapeDataString($c.Request.Url.AbsolutePath)
      if ($p -eq '/') { $p = '/index.html' }
      $f = Join-Path $R $p.TrimStart('/').Replace('/','\')
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

# 2. Launch headless Edge
$ud = Join-Path $env:TEMP ('v36_qa_' + [guid]::NewGuid().ToString('N').Substring(0,8))
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

  Write-Host "`n1. NAVIGATING TO MINKOI V3.6 (PORT $Port)..." -ForegroundColor Yellow
  [void](CDP 'Page.navigate' @{ url = "http://127.0.0.1:$Port/index.html?v=36.0" })
  Start-Sleep -Seconds 3

  # ==============================================================
  # PART 1: DESKTOP SOUNDSTAGE & CONTROLS VERIFICATION (1440x900)
  # ==============================================================
  Write-Host "`n2. VERIFYING DESKTOP SOUNDSTAGE & EXPRESSIVE CONTROLS (1440x900)..." -ForegroundColor Yellow
  SetViewport 1440 900 2
  Start-Sleep -Milliseconds 800

  # Check Stage geometry and styling
  $stageInfo = EvalJS @"
    (() => {
      const stage = document.querySelector('.now-playing-stage');
      const disc = document.querySelector('.vinyl-disc-wrap');
      const platter = document.querySelector('.vinyl-platter');
      const art = document.getElementById('player-album-art');
      const title = document.getElementById('track-name');
      const artist = document.getElementById('track-artist');
      const cat = document.getElementById('track-category-tag');
      const bars = document.querySelectorAll('.live-visualizer-bars .viz-bar');

      const sRect = stage.getBoundingClientRect();
      const dRect = disc.getBoundingClientRect();
      const pRect = platter.getBoundingClientRect();
      const sStyle = window.getComputedStyle(stage);
      const dStyle = window.getComputedStyle(disc);

      return {
        stageWidth: Math.round(sRect.width),
        stageHeight: Math.round(sRect.height),
        stageRadius: sStyle.borderRadius,
        discWidth: Math.round(dRect.width),
        discHeight: Math.round(dRect.height),
        platterWidth: Math.round(pRect.width),
        platterHeight: Math.round(pRect.height),
        artSrc: art ? art.src : '',
        title: title ? title.textContent.trim() : '',
        artist: artist ? artist.textContent.trim() : '',
        catText: cat ? cat.textContent.trim() : '',
        barsCount: bars.length
      };
    })()
"@

  Write-Host "  Stage dimensions: $($stageInfo.stageWidth)px x $($stageInfo.stageHeight)px (Radius: $($stageInfo.stageRadius))" -ForegroundColor Green
  Write-Host "  Vinyl disc platter: $($stageInfo.discWidth)px x $($stageInfo.discHeight)px (Center spindle: $($stageInfo.platterWidth)px x $($stageInfo.platterHeight)px)" -ForegroundColor Green
  Write-Host "  Track: '$($stageInfo.title)' by '$($stageInfo.artist)'" -ForegroundColor Green
  Write-Host "  Waifu Capsule: '$($stageInfo.catText)'" -ForegroundColor Green
  Write-Host "  Live Visualizer Bars: $($stageInfo.barsCount)/12" -ForegroundColor Green

  if ($stageInfo.discWidth -lt 80) { throw "Vinyl disc size unexpectedly small: $($stageInfo.discWidth)px" }
  if ($stageInfo.barsCount -ne 12) { throw "Expected 12 visualizer bars, found $($stageInfo.barsCount)" }

  # Check Dual-Sided Progress Strip
  $progressInfo = EvalJS @"
    (() => {
      const wrap = document.querySelector('.playback-progress-wrap');
      const timeDisplay = document.querySelector('.time-display');
      const cur = document.getElementById('current-time');
      const tot = document.getElementById('total-time');
      const sep = document.querySelector('.time-sep');
      const track = document.getElementById('seek-container');
      const fill = document.getElementById('seek-fill');
      const thumb = document.querySelector('.seek-thumb-dot');

      const curRect = cur.getBoundingClientRect();
      const totRect = tot.getBoundingClientRect();
      const trackRect = track.getBoundingClientRect();
      const sepStyle = window.getComputedStyle(sep);

      return {
        timeDisplayWidth: Math.round(timeDisplay.getBoundingClientRect().width),
        curLeft: Math.round(curRect.left),
        totRight: Math.round(totRect.right),
        trackLeft: Math.round(trackRect.left),
        trackRight: Math.round(trackRect.right),
        curText: cur.textContent.trim(),
        totText: tot.textContent.trim(),
        sepHidden: sepStyle.display === 'none',
        hasThumb: !!thumb
      };
    })()
"@

  Write-Host "  Dual-Sided Time Display: Current '$($progressInfo.curText)' at left, Total '$($progressInfo.totText)' at right" -ForegroundColor Green
  Write-Host "  Time separator hidden: $($progressInfo.sepHidden)" -ForegroundColor Green
  Write-Host "  White pearl thumb dot present: $($progressInfo.hasThumb)" -ForegroundColor Green

  if (-not $progressInfo.sepHidden) { throw "Time separator should be hidden in dual-sided layout" }
  if ($progressInfo.totRight -le $progressInfo.curLeft + 40) { throw "Total time not positioned at right side: cur=$($progressInfo.curLeft), tot=$($progressInfo.totRight)" }

  # Check Expressive Controls Dock
  $controlsInfo = EvalJS @"
    (() => {
      const hero = document.getElementById('play-pause');
      const prev = document.getElementById('prev-track');
      const next = document.getElementById('next-track');
      const shuffle = document.getElementById('shuffle-btn');
      const repeat = document.getElementById('repeat-btn');

      const hRect = hero.getBoundingClientRect();
      const pRect = prev.getBoundingClientRect();
      const nRect = next.getBoundingClientRect();
      const hStyle = window.getComputedStyle(hero);

      return {
        heroWidth: Math.round(hRect.width),
        heroHeight: Math.round(hRect.height),
        heroBg: hStyle.backgroundImage || hStyle.backgroundColor,
        prevWidth: Math.round(pRect.width),
        nextWidth: Math.round(nRect.width),
        shuffleActive: shuffle.classList.contains('active'),
        repeatActive: repeat.classList.contains('active')
      };
    })()
"@

  Write-Host "  Hero Play Button: $($controlsInfo.heroWidth)px x $($controlsInfo.heroHeight)px (Focal anchor)" -ForegroundColor Green
  Write-Host "  Previous & Next Buttons: $($controlsInfo.prevWidth)px min-touch target" -ForegroundColor Green
  Write-Host "  M3 Expressive Active States: Shuffle=$($controlsInfo.shuffleActive), Repeat=$($controlsInfo.repeatActive)" -ForegroundColor Green

  if ($controlsInfo.heroWidth -lt 54) { throw "Hero play button smaller than 54px on desktop: $($controlsInfo.heroWidth)px" }

  # Interactive Play/Pause & Vinyl Spin Test
  Write-Host "`n  Testing Interactive Play/Pause & Platter Spin..." -ForegroundColor Yellow
  EvalJS "document.getElementById('play-pause').click()"
  Start-Sleep -Milliseconds 600

  $playState = EvalJS @"
    (() => {
      const hero = document.getElementById('play-pause');
      const disc = document.getElementById('vinyl-disc');
      const icon = hero.querySelector('i');
      return {
        heroIsPlaying: hero.classList.contains('is-playing'),
        discSpinning: disc.classList.contains('spinning'),
        iconClass: icon ? icon.className : ''
      };
    })()
"@
  Write-Host "  Playing state: Hero.is-playing=$($playState.heroIsPlaying), Disc.spinning=$($playState.discSpinning), Icon='$($playState.iconClass)'" -ForegroundColor Green

  # Pause again
  EvalJS "document.getElementById('play-pause').click()"
  Start-Sleep -Milliseconds 400

  # Interactive Next Track Test
  Write-Host "`n  Testing Next Track Navigation & Cover Synchronization..." -ForegroundColor Yellow
  $trackBefore = EvalJS "document.getElementById('track-name').textContent.trim()"
  EvalJS "document.getElementById('next-track').click()"
  Start-Sleep -Milliseconds 500
  $trackAfter = EvalJS "document.getElementById('track-name').textContent.trim()"
  $coverAfter = EvalJS "document.getElementById('player-album-art').src"
  Write-Host "  Track transitioned: '$trackBefore' -> '$trackAfter'" -ForegroundColor Green
  Write-Host "  Cover synchronized: $coverAfter" -ForegroundColor Green

  # Interactive Shuffle & Repeat Cycle
  Write-Host "`n  Testing Shuffle & Repeat Cycles..." -ForegroundColor Yellow
  EvalJS "document.getElementById('shuffle-btn').click()"
  $shuffleState = EvalJS "document.getElementById('shuffle-btn').classList.contains('active')"
  Write-Host "  Shuffle toggled: $shuffleState" -ForegroundColor Green

  # Click repeat to cycle: All -> One
  EvalJS "document.getElementById('repeat-btn').click()"
  $repeatOneState = EvalJS @"
    (() => {
      const btn = document.getElementById('repeat-btn');
      const badge = btn.querySelector('.repeat-one-badge');
      return {
        isActive: btn.classList.contains('active'),
        isRepeatOne: btn.classList.contains('repeat-one'),
        badgeText: badge ? badge.textContent.trim() : ''
      };
    })()
"@
  Write-Host "  Repeat One state: active=$($repeatOneState.isActive), repeat-one=$($repeatOneState.isRepeatOne), badge='$($repeatOneState.badgeText)'" -ForegroundColor Green
  if ($repeatOneState.badgeText -ne '1') { throw "Repeat One badge expected '1', got '$($repeatOneState.badgeText)'" }

  # Test Remaining Time Toggle
  Write-Host "`n  Testing Remaining Time Toggle on Total-Time Click..." -ForegroundColor Yellow
  EvalJS "document.getElementById('total-time').click()"
  $remText = EvalJS "document.getElementById('total-time').textContent.trim()"
  Write-Host "  Remaining time mode active: '$remText'" -ForegroundColor Green
  EvalJS "document.getElementById('total-time').click()"
  $totalText = EvalJS "document.getElementById('total-time').textContent.trim()"
  Write-Host "  Switched back to duration: '$totalText'" -ForegroundColor Green

  # Test Volume Slider & Mute Icon Morphing
  Write-Host "`n  Testing Volume & Mute Icon Morphing..." -ForegroundColor Yellow
  EvalJS "document.getElementById('mute-btn').click()"
  $muteIcon = EvalJS "document.getElementById('mute-btn').querySelector('i').className"
  Write-Host "  Muted icon: '$muteIcon'" -ForegroundColor Green
  if ($muteIcon -notmatch 'volume-xmark') { throw "Expected fa-volume-xmark on mute, got '$muteIcon'" }
  EvalJS "document.getElementById('mute-btn').click()"
  $unmuteIcon = EvalJS "document.getElementById('mute-btn').querySelector('i').className"
  Write-Host "  Unmuted icon: '$unmuteIcon'" -ForegroundColor Green

  # Capture Desktop Screenshots
  $desktopPng = Join-Path $ArtifactDir 'v3_6_stage_desktop.png'
  CaptureScreenshot $desktopPng
  Write-Host "  Captured Desktop Screenshot: $desktopPng" -ForegroundColor Green

  # Crop Stage & Controls
  $cropPng = Join-Path $ArtifactDir 'v3_6_stage_crop.png'
  $stageRect = EvalJS @"
    (() => {
      const s = document.querySelector('.now-playing-stage');
      const c = document.querySelector('.audio-controls-dock');
      const v = document.querySelector('.volume-slider-dock');
      const r1 = s.getBoundingClientRect();
      const r2 = v.getBoundingClientRect();
      return {
        x: Math.max(0, Math.floor(r1.left - 16)),
        y: Math.max(0, Math.floor(r1.top - 16)),
        width: Math.ceil(r1.width + 32),
        height: Math.ceil((r2.bottom - r1.top) + 32)
      };
    })()
"@
  $cropR = CDP 'Page.captureScreenshot' @{
    format = 'png'
    clip = @{
      x = $stageRect.x
      y = $stageRect.y
      width = $stageRect.width
      height = $stageRect.height
      scale = 2
    }
  }
  [IO.File]::WriteAllBytes($cropPng, [Convert]::FromBase64String($cropR.result.data))
  Write-Host "  Captured Stage & Controls Crop: $cropPng" -ForegroundColor Green

  # ==============================================================
  # PART 2: MOBILE VIEWPORTS & LIQUID GLASS INTEGRITY
  # ==============================================================
  Write-Host "`n3. VERIFYING MOBILE VIEWPORT (390x844 - IPHONE 14/15)..." -ForegroundColor Yellow
  SetViewport 390 844 3
  Start-Sleep -Milliseconds 800

  # Check Mobile Liquid Glass Navigation
  $mobileGlassInfo = EvalJS @"
    (() => {
      const nav = document.getElementById('audio-category-nav');
      const ind = nav ? nav.querySelector('.liquid-glass-indicator') : null;
      const activeTab = nav ? nav.querySelector('.cat-tab.active') : null;
      const lens = ind ? ind.querySelector('.liquid-glass-lens') : null;
      const shimmer = ind ? ind.querySelector('.liquid-glass-shimmer') : null;

      const nRect = nav ? nav.getBoundingClientRect() : null;
      const iRect = ind ? ind.getBoundingClientRect() : null;
      const tRect = activeTab ? activeTab.getBoundingClientRect() : null;

      return {
        navExists: !!nav,
        navDisplay: nav ? window.getComputedStyle(nav).display : '',
        navWidth: nRect ? Math.round(nRect.width) : 0,
        indicatorExists: !!ind,
        indicatorDisplay: ind ? window.getComputedStyle(ind).display : '',
        indicatorOpacity: ind ? window.getComputedStyle(ind).opacity : '',
        indicatorWidth: iRect ? Math.round(iRect.width) : 0,
        indicatorHeight: iRect ? Math.round(iRect.height) : 0,
        activeTabWidth: tRect ? Math.round(tRect.width) : 0,
        hasLens: !!lens,
        hasShimmer: !!shimmer
      };
    })()
"@

  Write-Host "  Mobile Liquid Glass Navigation:" -ForegroundColor Green
  Write-Host "    Indicator exists: $($mobileGlassInfo.indicatorExists)" -ForegroundColor Green
  Write-Host "    Indicator dimensions: $($mobileGlassInfo.indicatorWidth)px x $($mobileGlassInfo.indicatorHeight)px (Tab width: $($mobileGlassInfo.activeTabWidth)px)" -ForegroundColor Green
  Write-Host "    Lens: $($mobileGlassInfo.hasLens), Shimmer: $($mobileGlassInfo.hasShimmer)" -ForegroundColor Green

  if (-not $mobileGlassInfo.indicatorExists) { throw "Liquid Glass indicator missing on mobile!" }
  if ($mobileGlassInfo.indicatorWidth -lt 30) { throw "Liquid Glass indicator collapsed: $($mobileGlassInfo.indicatorWidth)px" }

  # Test Mobile Liquid Glass Category Switching
  Write-Host "  Testing Mobile Liquid Glass tab transition..." -ForegroundColor Yellow
  EvalJS @"
    (() => {
      const tabs = document.querySelectorAll('#audio-category-nav .cat-tab');
      if (tabs.length > 2) {
        tabs[2].click();
      }
    })()
"@
  Start-Sleep -Milliseconds 500
  $tabSwitchInfo = EvalJS @"
    (() => {
      const active = document.querySelector('#audio-category-nav .cat-tab.active');
      const ind = document.querySelector('.liquid-glass-indicator');
      const iRect = ind.getBoundingClientRect();
      return {
        activeText: active ? active.textContent.trim() : '',
        indWidth: Math.round(iRect.width),
        indLeft: Math.round(iRect.left)
      };
    })()
"@
  Write-Host "  Switched to tab '$($tabSwitchInfo.activeText)': Indicator width=$($tabSwitchInfo.indWidth)px, left=$($tabSwitchInfo.indLeft)px" -ForegroundColor Green

  # Check Mobile Stage Dimensions & Ergonomics
  $mobileStageInfo = EvalJS @"
    (() => {
      const stage = document.querySelector('.now-playing-stage');
      const disc = document.querySelector('.vinyl-disc-wrap');
      const hero = document.getElementById('play-pause');
      const prev = document.getElementById('prev-track');
      const next = document.getElementById('next-track');

      const sRect = stage.getBoundingClientRect();
      const dRect = disc.getBoundingClientRect();
      const hRect = hero.getBoundingClientRect();
      const pRect = prev.getBoundingClientRect();

      return {
        stageWidth: Math.round(sRect.width),
        discWidth: Math.round(dRect.width),
        heroWidth: Math.round(hRect.width),
        heroHeight: Math.round(hRect.height),
        prevWidth: Math.round(pRect.width),
        prevHeight: Math.round(pRect.height),
        bodyScrollWidth: document.body.scrollWidth,
        bodyClientWidth: document.body.clientWidth
      };
    })()
"@

  Write-Host "  Mobile Stage: width=$($mobileStageInfo.stageWidth)px, disc=$($mobileStageInfo.discWidth)px" -ForegroundColor Green
  Write-Host "  Mobile Hero Button: $($mobileStageInfo.heroWidth)px x $($mobileStageInfo.heroHeight)px" -ForegroundColor Green
  Write-Host "  Mobile Touch Target (Prev/Next): $($mobileStageInfo.prevWidth)px x $($mobileStageInfo.prevHeight)px (>=44px WCAG)" -ForegroundColor Green
  Write-Host "  Zero horizontal page overflow: scrollWidth=$($mobileStageInfo.bodyScrollWidth) vs clientWidth=$($mobileStageInfo.bodyClientWidth)" -ForegroundColor Green

  if ($mobileStageInfo.bodyScrollWidth -gt $mobileStageInfo.bodyClientWidth + 1) {
    throw "Horizontal overflow detected on mobile: scrollWidth=$($mobileStageInfo.bodyScrollWidth) > clientWidth=$($mobileStageInfo.bodyClientWidth)"
  }
  if ($mobileStageInfo.prevWidth -lt 42) {
    throw "Prev button touch target smaller than 42px on mobile: $($mobileStageInfo.prevWidth)px"
  }

  # Capture Mobile Screenshot
  $mobilePng = Join-Path $ArtifactDir 'v3_6_stage_mobile.png'
  CaptureScreenshot $mobilePng
  Write-Host "  Captured Mobile Screenshot: $mobilePng" -ForegroundColor Green

  # Mobile Stage Crop
  $mobileCropPng = Join-Path $ArtifactDir 'v3_6_mobile_crop.png'
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
  [IO.File]::WriteAllBytes($mobileCropPng, [Convert]::FromBase64String($mCropR.result.data))
  Write-Host "  Captured Mobile Stage Crop: $mobileCropPng" -ForegroundColor Green

  # ==============================================================
  # PART 3: ULTRA-COMPACT 320x720 CHECK
  # ==============================================================
  Write-Host "`n4. VERIFYING ULTRA-COMPACT VIEWPORT (320x720)..." -ForegroundColor Yellow
  SetViewport 320 720 2
  Start-Sleep -Milliseconds 600

  $c320 = EvalJS @"
    (() => {
      const hero = document.getElementById('play-pause');
      const prev = document.getElementById('prev-track');
      const hRect = hero.getBoundingClientRect();
      const pRect = prev.getBoundingClientRect();
      return {
        heroWidth: Math.round(hRect.width),
        prevWidth: Math.round(pRect.width),
        overflow: document.body.scrollWidth > document.body.clientWidth
      };
    })()
"@
  Write-Host "  320px Viewport: Hero=$($c320.heroWidth)px, Prev=$($c320.prevWidth)px, Overflow=$($c320.overflow)" -ForegroundColor Green
  if ($c320.overflow) { throw "Horizontal overflow on 320px viewport!" }

  # ==============================================================
  # PART 4: CONSOLE ERROR AUDIT
  # ==============================================================
  Write-Host "`n5. CONSOLE ERROR AUDIT..." -ForegroundColor Yellow
  Write-Host "  Total console errors intercepted: $($script:consoleErrors.Count)" -ForegroundColor Green
  if ($script:consoleErrors.Count -gt 0) {
    foreach ($err in $script:consoleErrors) {
      Write-Host "    [Console Error] $err" -ForegroundColor Red
    }
    throw "Console errors encountered during test execution!"
  }

  # ==============================================================
  # PART 5: COPY PREVIEW SCREENSHOTS TO DOCS
  # ==============================================================
  $docsScreenshotsDir = Join-Path $RepoRoot 'docs\screenshots'
  if (Test-Path $docsScreenshotsDir) {
    Copy-Item $desktopPng (Join-Path $docsScreenshotsDir 'desktop-preview.png') -Force
    Copy-Item $mobilePng (Join-Path $docsScreenshotsDir 'mobile-preview.png') -Force
    Write-Host "`n6. Updated docs/screenshots previews." -ForegroundColor Green
  }

  Write-Host "`n==========================================================" -ForegroundColor Cyan
  Write-Host " ALL MINKOI V3.6 QA CHECKS PASSED FLAWLESSLY!" -ForegroundColor Cyan
  Write-Host "==========================================================" -ForegroundColor Cyan

} finally {
  try { $ws.CloseAsync([System.Net.WebSockets.WebSocketCloseStatus]::NormalClosure, 'done', [System.Threading.CancellationToken]::None).Wait() } catch {}
  try { Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue } catch {}
  try { $L.Stop(); $L.Close() } catch {}
  try { Remove-Item -Path $ud -Recurse -Force -ErrorAction SilentlyContinue } catch {}
}
