# First, get a valid token by logging in
$loginBody = @{
  "email" = "admin@bbcit.edu.in"
  "password" = "Admin@123"
} | ConvertTo-Json

Write-Host "Step 1: Getting login token..."
$loginResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json" -UseBasicParsing
$loginData = $loginResponse.Content | ConvertFrom-Json
$token = $loginData.token

Write-Host "Token received: $($token.Substring(0, 20))..."

# Now test the change-password endpoint with the valid token
$headers = @{
  "Authorization" = "Bearer $token"
  "Content-Type" = "application/json"
}

$passwordBody = @{
  "currentPassword" = "Admin@123"
  "newPassword" = "NewPassword123"
} | ConvertTo-Json

Write-Host "`nStep 2: Testing change-password endpoint..."
try {
  $response = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/change-password" -Method POST -Headers $headers -Body $passwordBody -UseBasicParsing
  Write-Host "Status: $($response.StatusCode)"
  Write-Host "Response:"
  $response.Content | ConvertFrom-Json | ConvertTo-Json
} catch {
  Write-Host "Error Status: $($_.Exception.Response.StatusCode.Value)"
  Write-Host "Error: $($_.Exception.Message)"
  if ($_.Exception.Response) {
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $reader.BaseStream.Position = 0
    $reader.DiscardBufferedData()
    $body = $reader.ReadToEnd()
    Write-Host "Response Body: $body"
    $reader.Close()
  }
}
