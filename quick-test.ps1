# Test login and change-password
$loginBody = @{
  "email" = "admin@bbcit.edu.in"
  "password" = "Admin@123"
} | ConvertTo-Json

try {
  $loginResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json" -UseBasicParsing -ErrorAction Stop
  $loginData = $loginResponse.Content | ConvertFrom-Json
  $token = $loginData.token
  
  Write-Host "✓ Login successful, token received"
  
  # Now test change-password
  $headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
  }
  
  $passwordBody = @{
    "currentPassword" = "Admin@123"
    "newPassword" = "NewPassword456"
  } | ConvertTo-Json
  
  $changeResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/change-password" -Method POST -Headers $headers -Body $passwordBody -UseBasicParsing -ErrorAction Stop
  Write-Host "✓ Change-password endpoint WORKS! Status: $($changeResponse.StatusCode)"
  Write-Host "Response:"
  $changeResponse.Content | ConvertFrom-Json | ConvertTo-Json
} catch {
  Write-Host "✗ Error: $($_.Exception.Message)"
  Write-Host "Status Code: $($_.Exception.Response.StatusCode.Value)"
}
