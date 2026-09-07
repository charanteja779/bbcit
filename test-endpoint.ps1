$ErrorActionPreference = "Stop"

Write-Host "Step 1: Login..."
$loginBody = @{
  email = "admin@bbcit.edu.in"
  password = "Admin@123"
} | ConvertTo-Json

$loginResp = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json" -UseBasicParsing
$login = $loginResp.Content | ConvertFrom-Json
$token = $login.token

Write-Host "✓ Login successful"

Write-Host "Step 2: Change Password..."
$passBody = @{
  currentPassword = "Admin@123"
  newPassword = "NewTest123"
} | ConvertTo-Json

$headers = @{
  "Authorization" = "Bearer $token"
  "Content-Type" = "application/json"
}

$passResp = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/change-password" -Method POST -Body $passBody -Headers $headers -ContentType "application/json" -UseBasicParsing

Write-Host "✓ SUCCESS! Password change endpoint returned $($passResp.StatusCode)"
Write-Host "Response: $($passResp.Content)"
