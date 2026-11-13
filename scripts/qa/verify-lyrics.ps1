# ==============================================================================
# MinKoi Studio · Lyrics Engine V2 Automated Regression Suite
# Executes 15 unit tests via CDP and asserts 0 failures.
# ==============================================================================
$ErrorActionPreference = 'Stop'
$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot '..\..')
Set-Location $RepoRoot

$Port = 42890
$CdpPort = 9480

Write-Host "Starting Lyrics Engine Automated Test Runner..." -ForegroundColor Cyan

# 1. Local HTTP Server
$L = New-Object System.Net.HttpListener
$L.Prefixes.Add("http://127.0.0.1:$Port/")
$L.Start()
$rs = [runspacefactory]::CreateRunspace(); $rs.Open()
$rs.SessionStateProxy.SetVariable('L',$L); $rs.SessionStateProxy.SetVariable('R',$RepoRoot.Path)
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

# 2. Launch Browser
$ud = Join-Path $env:TEMP ('ed_qa_' + [guid]::NewGuid().ToString('N').Substring(0,8))
New-Item -ItemType Directory -Path $ud -Force | Out-Null
$EdgeExe = 'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
if (-not (Test-Path $EdgeExe)) { $EdgeExe = 'C:\Program Files\Microsoft\Edge\Application\msedge.exe' }
$proc = Start-Process -FilePath $EdgeExe -ArgumentList @('--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check',"--remote-debugging-port=$CdpPort",'--remote-allow-origins=*',"--user-data-dir=$ud",'about:blank') -PassThru

try {
  $wsUrl = $null
  Start-Sleep -Milliseconds 1200
  for ($try=0; $try -lt 25; $try++) {
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
    $callCts = [System.Threading.CancellationTokenSource]::new(20000)
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

  Write-Host "Navigating to http://127.0.0.1:$Port/tests/lyrics-v2.test.html ..." -ForegroundColor Cyan
  [void](CDP 'Page.navigate' @{ url = "http://127.0.0.1:$Port/tests/lyrics-v2.test.html" })
  Start-Sleep -Milliseconds 2500

  $evalRes = CDP 'Runtime.evaluate' @{
    expression = @"
    (function() {
      var res = window.__TEST_RESULTS__;
      if (!res) return { total: 0, passed: 0, failed: 1, text: 'No results found' };
      return {
        total: res.total,
        passed: res.passed,
        failed: res.failed,
        cases: res.cases.map(function(c) { return { id: c.id, name: c.name, pass: c.pass }; })
      };
    })()
"@
    returnByValue = $true
  }

  $testData = $evalRes.result.result.value
  Write-Host "`nTest Execution Results:" -ForegroundColor Yellow
  foreach ($c in $testData.cases) {
    $status = if ($c.pass) { "[PASS]" } else { "[FAIL]" }
    $color = if ($c.pass) { 'Green' } else { 'Red' }
    Write-Host "  $status Case $($c.id): $($c.name)" -ForegroundColor $color
  }

  Write-Host "`nSummary: $($testData.passed)/$($testData.total) PASSED (Failed: $($testData.failed))" -ForegroundColor Cyan

  if ($testData.failed -eq 0 -and $testData.passed -gt 0) {
    Write-Host "ALL LYRICS ENGINE REGRESSION TESTS PASSED" -ForegroundColor Green
    exit 0
  } else {
    Write-Host "LYRICS ENGINE TESTS FAILED" -ForegroundColor Red
    exit 1
  }

} finally {
  try { $ws.CloseAsync([Net.WebSockets.WebSocketCloseStatus]::NormalClosure, 'Done', $cts.Token).Wait() } catch {}
  try { Stop-Process -Id $proc.Id -Force } catch {}
  try { $L.Stop(); $L.Close() } catch {}
  try { Remove-Item -Path $ud -Recurse -Force -ErrorAction SilentlyContinue } catch {}
}
