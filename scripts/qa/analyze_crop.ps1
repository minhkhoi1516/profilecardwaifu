Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile('C:/Users/Admin/.gemini/antigravity/brain/676897cc-82eb-49fa-8a7e-b684c15d6e09/crop_user_avatar.png')
Write-Host "Crop size: $($img.Width) x $($img.Height)"

# Find the bounding box of the square
# The square has higher brightness/color than the background
# Background outside square: let's inspect (5, 5) vs (25, 25)
Write-Host "Pixel(5,5): $($img.GetPixel(5,5).ToString())"
Write-Host "Pixel(30,30): $($img.GetPixel(30,30).ToString())"
Write-Host "Pixel(5,90): $($img.GetPixel(5,90).ToString())"
Write-Host "Pixel(30,90): $($img.GetPixel(30,90).ToString())"
Write-Host "Pixel(160,5): $($img.GetPixel(160,5).ToString())"
Write-Host "Pixel(160,30): $($img.GetPixel(160,30).ToString())"

$img.Dispose()
