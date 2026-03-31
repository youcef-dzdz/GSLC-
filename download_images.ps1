$images = @(
  @{ url = "https://images.unsplash.com/photo-1494412574643-ff11b0a5716d?w=1920&q=85&auto=format&fit=crop"; file = "C:\xampp\htdocs\GSLC\public\images\hero1.jpg" },
  @{ url = "https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=1920&q=85&auto=format&fit=crop"; file = "C:\xampp\htdocs\GSLC\public\images\hero2.jpg" },
  @{ url = "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1920&q=85&auto=format&fit=crop"; file = "C:\xampp\htdocs\GSLC\public\images\hero3.jpg" },
  @{ url = "https://images.unsplash.com/photo-1533587851505-d119e13fa0d7?w=1920&q=85&auto=format&fit=crop"; file = "C:\xampp\htdocs\GSLC\public\images\hero4.jpg" }
)

foreach ($img in $images) {
  Write-Host "Downloading $($img.file)..."
  Invoke-WebRequest -Uri $img.url -OutFile $img.file -UseBasicParsing
  Write-Host "Done: $($img.file)"
}
Write-Host "All images downloaded."
