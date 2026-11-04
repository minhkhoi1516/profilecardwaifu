# MINKOI STUDIO - Music Scanner
$ErrorActionPreference = "SilentlyContinue"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectDir = Split-Path -Parent $ScriptDir
$MusicDir = Join-Path $ProjectDir "music"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  MINKOI STUDIO - AUDIO LIBRARY AUTOMATION SCANNER" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

if (-not (Test-Path $MusicDir)) {
    Write-Host "[!] Cannot find music directory at: $MusicDir" -ForegroundColor Red
    exit 1
}

$shell = New-Object -ComObject Shell.Application
$folder = $shell.Namespace($MusicDir)
$files = Get-ChildItem -Path $MusicDir -Filter *.mp3 | Sort-Object Name

Write-Host "[+] Found $($files.Count) MP3 tracks in music/ directory`n" -ForegroundColor Green

$results = @()
$id = 1

foreach ($f in $files) {
    $item = $folder.ParseName($f.Name)
    $rawDuration = $folder.GetDetailsOf($item, 27)
    
    $durationStr = "3:30"
    if ($rawDuration) {
        $parts = $rawDuration.Trim() -split ":"
        if ($parts.Count -eq 3) {
            $h = [int]$parts[0]
            $m = [int]$parts[1]
            $s = [int]$parts[2]
            if ($h -gt 0) {
                $durationStr = "{0}:{1:D2}" -f ($h * 60 + $m), $s
            } else {
                $durationStr = "{0}:{1:D2}" -f $m, $s
            }
        } elseif ($parts.Count -eq 2) {
            $durationStr = "{0}:{1}" -f [int]$parts[0], $parts[1]
        }
    }

    $persona = "alya"
    if ($f.Name -match "^angel|^mahiru") { $persona = "mahiru" }
    elseif ($f.Name -match "^kaoruko") { $persona = "kaoruko" }
    elseif ($f.Name -match "^sakuramiku") { $persona = "sakuramiku" }
    elseif ($f.Name -match "^shinobu") { $persona = "shinobu" }
    elseif ($f.Name -match "^hinako") { $persona = "hinako" }
    elseif ($f.Name -match "^umi|Submarine|Zutto") { $persona = "umi" }
    elseif ($f.Name -match "^alya|CHE\.R\.RY") { $persona = "alya" }

    $trackName = [System.IO.Path]::GetFileNameWithoutExtension($f.Name)
    $cleanName = $trackName -replace "^[a-z0-9]+_\d+_", "" -replace "_", " "

    $results += [PSCustomObject]@{
        id = $id
        persona = $persona
        name = $cleanName
        artist = "MinKoi Studio"
        file = "music/$($f.Name)"
        duration = $durationStr
    }
    $id++
}

Write-Host "Ready-to-paste JSON snippet for js/config.js (CONFIG.music.playlist):" -ForegroundColor Yellow
Write-Host "--------------------------------------------------------------------------" -ForegroundColor DarkGray

$json = $results | ConvertTo-Json -Depth 3
Write-Host $json -ForegroundColor White

Write-Host "`n--------------------------------------------------------------------------" -ForegroundColor DarkGray
Write-Host "[OK] Complete! Run this script whenever you drop new songs into music/." -ForegroundColor Green
