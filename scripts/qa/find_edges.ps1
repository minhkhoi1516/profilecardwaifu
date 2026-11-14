Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile('C:/Users/Admin/.gemini/antigravity/brain/676897cc-82eb-49fa-8a7e-b684c15d6e09/crop_user_avatar.png')

for ($y = 0; $y -lt 80; $y++) {
    Write-Host "y=$y R=$($img.GetPixel(50, $y).R), G=$($img.GetPixel(50, $y).G), B=$($img.GetPixel(50, $y).B)"
}
$img.Dispose()
