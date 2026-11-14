Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile((Resolve-Path 'assets/avatar_kaoruko.png'))
Write-Host "Kaoruko image size: $($img.Width) x $($img.Height)"

# Check alpha bounding box
$minX = 9999; $maxX = -1; $minY = 9999; $maxY = -1
for ($y = 0; $y -lt $img.Height; $y++) {
    for ($x = 0; $x -lt $img.Width; $x++) {
        $p = $img.GetPixel($x, $y)
        if ($p.A -gt 10) {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}
Write-Host "Opaque bounds: X=[$minX, $maxX], Y=[$minY, $maxY]"
Write-Host "Pixel at minX, minY: $($img.GetPixel($minX, $minY).ToString())"
Write-Host "Pixel at maxX, minY: $($img.GetPixel($maxX, $minY).ToString())"
Write-Host "Pixel at minX, maxY: $($img.GetPixel($minX, $maxY).ToString())"
Write-Host "Pixel at maxX, maxY: $($img.GetPixel($maxX, $maxY).ToString())"

$img.Dispose()
