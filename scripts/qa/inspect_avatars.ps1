Add-Type -AssemblyName System.Drawing

$files = Get-ChildItem assets/avatar_*.png
foreach ($file in $files) {
    $bmp = [System.Drawing.Bitmap]::FromFile($file.FullName)
    $w = $bmp.Width
    $h = $bmp.Height
    $cTL = $bmp.GetPixel(0, 0)
    $cTR = $bmp.GetPixel($w - 1, 0)
    $cBL = $bmp.GetPixel(0, $h - 1)
    $cBR = $bmp.GetPixel($w - 1, $h - 1)
    
    # Sample top edge, left edge, right edge, bottom edge
    $topMid = $bmp.GetPixel([int]($w/2), 0)
    $botMid = $bmp.GetPixel([int]($w/2), $h - 1)
    $leftMid = $bmp.GetPixel(0, [int]($h/2))
    $rightMid = $bmp.GetPixel($w - 1, [int]($h/2))
    
    Write-Host ("{0,-22} : {1,4}x{2,-4} | Corners Alpha: TL={3,3} TR={4,3} BL={5,3} BR={6,3} | Edges: T={7,3} B={8,3} L={9,3} R={10,3}" -f $file.Name, $w, $h, $cTL.A, $cTR.A, $cBL.A, $cBR.A, $topMid.A, $botMid.A, $leftMid.A, $rightMid.A)
    $bmp.Dispose()
}
