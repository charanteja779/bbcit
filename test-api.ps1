$headers = @{
  "Authorization" = "Bearer invalid-token"
  "Content-Type" = "application/json"
}

$body = @{
  "currentPassword" = "Admin@123"
  "newPassword" = "NewPass123"
} | ConvertTo-Json

Write-Host "Testing change-password endpoint..."
try {
  $response = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/change-password" -Method POST -Headers $headers -Body $body -UseBasicParsing
  Write-Host "Status: $($response.StatusCode)"
  Write-Host "Response: $($response.Content)"
} catch {
  Write-Host "Error Status: $($_.Exception.Response.StatusCode.Value)"
  Write-Host "Error Message: $($_.Exception.Response.StatusDescription)"
  Write-Host "Response Body:"
  $_.Exception.Response | Select-Object -ExpandProperty Content | ForEach-Object { [System.IO.StreamReader]::new($_).ReadToEnd() }
}
