Add-Type -AssemblyName System.Drawing
$imgPath = 'C:/Users/Admin/.gemini/antigravity/brain/676897cc-82eb-49fa-8a7e-b684c15d6e09/.user_uploaded/media_1794637514640_0571d62e.jpg'
$img = [System.Drawing.Bitmap]::FromFile($imgPath)
Write-Host "Image size: $($img.Width) x $($img.Height)"

# Avatar area
$rectAvatar = New-Object System.Drawing.Rectangle(190, 220, 180, 200)
$avatarCrop = $img.Clone($rectAvatar, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$avatarCrop.Save('C:/Users/Admin/.gemini/antigravity/brain/676897cc-82eb-49fa-8a7e-b684c15d6e09/crop_user_avatar.png')
$avatarCrop.Dispose()

# Vinyl area
$rectVinyl = New-Object System.Drawing.Rectangle(430, 180, 120, 120)
$vinylCrop = $img.Clone($rectVinyl, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$vinylCrop.Save('C:/Users/Admin/.gemini/antigravity/brain/676897cc-82eb-49fa-8a7e-b684c15d6e09/crop_user_vinyl.png')
$vinylCrop.Dispose()

$img.Dispose()
Write-Host "Cropped successfully"
