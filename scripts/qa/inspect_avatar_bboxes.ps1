Add-Type -AssemblyName System.Drawing

$files = Get-ChildItem assets/avatar_*.png
foreach ($file in $files) {
    $bmp = [System.Drawing.Bitmap]::FromFile($file.FullName)
    $w = $bmp.Width
    $h = $bmp.Height
    
    $minX = $w; $maxX = 0; $minY = $h; $maxY = 0
    for ($y = 0; $y -lt $h; $y++) {
        for ($x = 0; $x -lt $w; $x++) {
            $p = $bmp.GetPixel($x, $y)
            if ($p.A -gt 15) {
                if ($x -lt $minX) { $minX = $x }
                if ($x -gt $maxX) { $maxX = $x }
                if ($y -lt $minY) { $minY = $y }
                if ($y -gt $maxY) { $maxY = $y }
            }
        }
    }
    
    $contentW = $maxX - $minX + 1
    $contentH = $maxY - $minY + 1
    Write-Host ("{0,-22} : {1,4}x{2,-4} | Content Box: x=[{3,3}..{4,3}] y=[{5,3}..{6,3}] size={7,3}x{8,-3} | Margins: Top={9,3} Bot={10,3} L={11,3} R={12,3}" -f `
        $file.Name, $w, $h, $minX, $maxX, $minY, $maxY, $contentW, $contentH, $minY, ($h - 1 - $maxY), $minX, ($w - 1 - $maxX))
    $bmp.Dispose()
}
