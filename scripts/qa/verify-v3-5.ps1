$ErrorActionPreference = 'Stop'
$RepoRoot = 'c:\Users\Admin\Documents\Git\profilecardwaifu'
$ArtifactDir = 'C:\Users\Admin\.gemini\antigravity\brain\676897cc-82eb-49fa-8a7e-b684c15d6e09'
$ScratchDir = Join-Path $ArtifactDir 'scratch'
$Port = 42894
$CdpPort = 9486

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " MINKOI V3.5 COMPREHENSIVE AUTOMATED QA & VISUAL SUITE" -ForegroundColor Cyan
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
$ud = Join-Path $env:TEMP ('v35_full_' + [guid]::NewGuid().ToString('N').Substring(0,8))
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

$testResults = [ordered]@{}

try {
  CDP 'Page.enable' | Out-Null
  CDP 'Runtime.enable' | Out-Null

  # Viewport list to test
  $viewports = @(
    @{ name = "320x720"; w = 320; h = 720; dpr = 2.0; isMobile = $true },
    @{ name = "360x800"; w = 360; h = 800; dpr = 3.0; isMobile = $true },
    @{ name = "375x812"; w = 375; h = 812; dpr = 3.0; isMobile = $true },
    @{ name = "390x844"; w = 390; h = 844; dpr = 3.0; isMobile = $true },
    @{ name = "393x873"; w = 393; h = 873; dpr = 2.75; isMobile = $true },
    @{ name = "412x915"; w = 412; h = 915; dpr = 3.5; isMobile = $true },
    @{ name = "430x932"; w = 430; h = 932; dpr = 3.0; isMobile = $true },
    @{ name = "768x1024"; w = 768; h = 1024; dpr = 2.0; isMobile = $false },
    @{ name = "1440x900"; w = 1440; h = 900; dpr = 1.0; isMobile = $false }
  )

  foreach ($vp in $viewports) {
    Write-Host "`n>>> TESTING VIEWPORT: $($vp.name) (Mobile: $($vp.isMobile)) <<<" -ForegroundColor Yellow

    CDP 'Emulation.setDeviceMetricsOverride' @{
      width = $vp.w
      height = $vp.h
      deviceScaleFactor = $vp.dpr
      mobile = $vp.isMobile
    } | Out-Null
    CDP 'Emulation.setTouchEmulationEnabled' @{ enabled = $vp.isMobile; maxTouchPoints = 5 } | Out-Null

    CDP 'Page.navigate' @{ url = "http://127.0.0.1:$Port/index.html" } | Out-Null
    Start-Sleep -Milliseconds 2000

    $vpRes = EvalJS @'
    (() => {
      const toRect = (r) => r ? ({ x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height) }) : null;
      const nav = document.getElementById('audio-category-nav');
      const ind = nav ? nav.querySelector('.liquid-glass-indicator') : null;
      const activeTab = nav ? nav.querySelector('.cat-tab.active') : null;

      const navRect = nav ? toRect(nav.getBoundingClientRect()) : null;
      const indRect = ind ? toRect(ind.getBoundingClientRect()) : null;
      const activeTabRect = activeTab ? toRect(activeTab.getBoundingClientRect()) : null;

      const s = ind ? window.getComputedStyle(ind) : null;
      const isVisible = Boolean(ind && s && s.display !== 'none' && s.visibility !== 'hidden' && parseFloat(s.opacity) > 0 && indRect && indRect.width > 20 && indRect.height > 20);

      // Check alignment
      const aligned = Boolean(indRect && activeTabRect && Math.abs(indRect.x - activeTabRect.x) <= 4 && Math.abs(indRect.width - activeTabRect.width) <= 4);

      return {
        navFound: Boolean(nav),
        indFound: Boolean(ind),
        hasLiquidNavClass: nav ? nav.classList.contains('has-liquid-nav') : false,
        activeCat: activeTab ? activeTab.dataset.cat : null,
        isVisible: isVisible,
        aligned: aligned,
        navRect: navRect,
        indRect: indRect,
        activeTabRect: activeTabRect,
        display: s ? s.display : null,
        opacity: s ? s.opacity : null,
        scrollLeft: nav ? nav.scrollLeft : 0
      };
    })()
'@
    Write-Host "  Indicator Visible: $($vpRes.isVisible) | Aligned: $($vpRes.aligned) | Active: $($vpRes.activeCat)"
    $testResults[$vp.name] = $vpRes

    # Capture screenshot for 320x720, 390x844, 1440x900
    if ($vp.name -in @('320x720', '390x844', '1440x900')) {
      $clip = @{ x = 0; y = 0; width = $vp.w; height = [Math]::Min($vp.h, 900); scale = 1 }
      $ss = CDP 'Page.captureScreenshot' @{ format = 'png'; clip = $clip }
      if ($ss.result.data) {
        $imgBytes = [Convert]::FromBase64String($ss.result.data)
        $imgPath = Join-Path $ArtifactDir "v3_5_viewport_$($vp.name).png"
        [IO.File]::WriteAllBytes($imgPath, $imgBytes)
        Write-Host "  Screenshot saved: $imgPath" -ForegroundColor Green
      }
    }
  }

  # Test Persona Switching (Alya -> Mahiru -> Nakano Miku)
  Write-Host "`n>>> TESTING PERSONA SWITCHING & TAB INDICATOR SYNC <<<" -ForegroundColor Yellow
  CDP 'Emulation.setDeviceMetricsOverride' @{ width = 390; height = 844; deviceScaleFactor = 3; mobile = $true } | Out-Null
  CDP 'Page.navigate' @{ url = "http://127.0.0.1:$Port/index.html" } | Out-Null
  Start-Sleep -Milliseconds 2000

  $personaSwitchRes = EvalJS @'
  (() => {
    const toRect = (r) => r ? ({ x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height) }) : null;
    const nav = document.getElementById('audio-category-nav');
    
    // 1. Click Mahiru
    const mahiruTab = nav.querySelector('.cat-tab[data-cat="mahiru"]');
    if (mahiruTab) mahiruTab.click();
    return { clicked: 'mahiru' };
  })()
'@
  Start-Sleep -Milliseconds 800

  $afterMahiru = EvalJS @'
  (() => {
    const toRect = (r) => r ? ({ x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height) }) : null;
    const nav = document.getElementById('audio-category-nav');
    const ind = nav ? nav.querySelector('.liquid-glass-indicator') : null;
    const activeTab = nav ? nav.querySelector('.cat-tab.active') : null;
    const indRect = ind ? toRect(ind.getBoundingClientRect()) : null;
    const tabRect = activeTab ? toRect(activeTab.getBoundingClientRect()) : null;
    return {
      activeCat: activeTab ? activeTab.dataset.cat : null,
      aligned: Boolean(indRect && tabRect && Math.abs(indRect.x - tabRect.x) <= 4),
      indRect: indRect,
      tabRect: tabRect
    };
  })()
'@
  Write-Host "  After Mahiru switch: Active = $($afterMahiru.activeCat) | Aligned = $($afterMahiru.aligned)"
  $testResults['persona_mahiru'] = $afterMahiru

  # Click Miku (last tab)
  EvalJS @'
  (() => {
    const nav = document.getElementById('audio-category-nav');
    const mikuTab = nav.querySelector('.cat-tab[data-cat="nakanomiku"]');
    if (mikuTab) mikuTab.click();
  })()
'@ | Out-Null
  Start-Sleep -Milliseconds 800

  $afterMiku = EvalJS @'
  (() => {
    const toRect = (r) => r ? ({ x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height) }) : null;
    const nav = document.getElementById('audio-category-nav');
    const ind = nav ? nav.querySelector('.liquid-glass-indicator') : null;
    const activeTab = nav ? nav.querySelector('.cat-tab.active') : null;
    const indRect = ind ? toRect(ind.getBoundingClientRect()) : null;
    const tabRect = activeTab ? toRect(activeTab.getBoundingClientRect()) : null;
    return {
      activeCat: activeTab ? activeTab.dataset.cat : null,
      aligned: Boolean(indRect && tabRect && Math.abs(indRect.x - tabRect.x) <= 4),
      scrollLeft: nav ? nav.scrollLeft : 0,
      indRect: indRect,
      tabRect: tabRect
    };
  })()
'@
  Write-Host "  After Miku switch: Active = $($afterMiku.activeCat) | Aligned = $($afterMiku.aligned) | ScrollLeft = $($afterMiku.scrollLeft)"
  $testResults['persona_miku'] = $afterMiku

  # Test Audio Playback Trigger
  Write-Host "`n>>> TESTING AUDIO PLAYBACK TRIGGER <<<" -ForegroundColor Yellow
  $audioRes = EvalJS @'
  (() => {
    const playBtn = document.getElementById('play-pause');
    const audio = document.getElementById('audio-element');
    return {
      hasPlayBtn: Boolean(playBtn),
      hasAudio: Boolean(audio),
      paused: audio ? audio.paused : null,
      src: audio ? audio.src : null
    };
  })()
'@
  Write-Host "  Audio Element State: HasAudio = $($audioRes.hasAudio), Paused = $($audioRes.paused)"
  $testResults['audio'] = $audioRes

  # Save Summary JSON
  $summaryPath = Join-Path $ScratchDir 'verify_v3_5_summary.json'
  $summaryJson = @{
    viewports = $testResults
    consoleErrors = $script:consoleErrors
    timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
  } | ConvertTo-Json -Depth 5
  Set-Content -Path $summaryPath -Value $summaryJson -Encoding UTF8
  Write-Host "`nSummary saved to: $summaryPath" -ForegroundColor Green

  Write-Host "`n==========================================================" -ForegroundColor Green
  Write-Host " ALL MINKOI V3.5 AUTOMATED CHECKS COMPLETED" -ForegroundColor Green
  Write-Host " Console Errors: $($script:consoleErrors.Count)" -ForegroundColor $(if ($script:consoleErrors.Count -eq 0) { 'Green' } else { 'Red' })
  Write-Host "==========================================================" -ForegroundColor Green

} finally {
  try { $ws.CloseAsync([System.Net.WebSockets.WebSocketCloseStatus]::NormalClosure, 'done', [Threading.CancellationToken]::None).Wait() } catch {}
  if ($proc -and -not $proc.HasExited) { Stop-Process -Id $proc.Id -Force }
  try { $L.Stop() } catch {}
  try { $rs.Close() } catch {}
}
