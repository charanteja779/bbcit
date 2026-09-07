$body = @{
  "email" = "admin@bbcit.edu.in"
  "password" = "Admin@123"
} | ConvertTo-Json

Write-Host "Testing login endpoint..."
try {
  $response = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing
  Write-Host "Status: $($response.StatusCode)"
  Write-Host "Response:"
  $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
} catch {
  Write-Host "Error Status: $($_.Exception.Response.StatusCode.Value)"
  Write-Host "Error: $($_.Exception.Message)"
}
