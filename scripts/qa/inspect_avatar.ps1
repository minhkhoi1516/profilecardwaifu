Add-Type -AssemblyName System.Drawing
$files = Get-ChildItem "assets/avatar_*.png"
foreach ($f in $files) {
    $img = New-Object System.Drawing.Bitmap($f.FullName)
    $p0 = $img.GetPixel(0, 0)
    $p1 = $img.GetPixel($img.Width - 1, 0)
    $p2 = $img.GetPixel(0, $img.Height - 1)
    $p3 = $img.GetPixel([int]($img.Width / 2), 0)
    Write-Host "$($f.Name): $($img.Width)x$($img.Height), (0,0)=A:$($p0.A),R:$($p0.R),G:$($p0.G),B:$($p0.B); (W-1,0)=A:$($p1.A); (0,H-1)=A:$($p2.A); (mid,0)=A:$($p3.A)"
    $img.Dispose()
}
