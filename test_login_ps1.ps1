# Start server in background
cd 'C:\Users\rahil\Desktop\tender portal\backend'
$nodePath = 'C:\Program Files\nodejs\node.exe'
$serverJs = '.\server.js'

Write-Output "Starting server..."
$proc = Start-Process -FilePath $nodePath -ArgumentList $serverJs -WorkingDirectory 'C:\Users\rahil\Desktop\tender portal\backend' -NoNewWindow -PassThru
Start-Sleep -Seconds 2

Write-Output "Testing login..."
try {
  $body = @{email='admin@phoenixtech.in'; password='Xh34@7sfPyOtp$YnqAPE'} | ConvertTo-Json
  $result = Invoke-RestMethod -Method Post -Uri 'http://localhost:5000/api/auth/login' -Body $body -ContentType 'application/json'
  Write-Output "LOGIN RESULT:"
  Write-Output $result
} catch {
  Write-Output "LOGIN ERROR:" $_.Exception.Message
}