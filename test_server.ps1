param(
    [int]$Port = 5000
)

# Set environment
$env:NODE_ENV = "development"

# Change to backend directory
Push-Location "C:\Users\rahil\Desktop\tender portal\backend"

# Start node server in background
Write-Host "Starting backend server on port $Port..."
$process = Start-Job { 
    param($p)
    node server.js 
} -ArgumentList $Port

Write-Host "Backend server started as job $($process.Id)"

# Wait for server to start
Start-Sleep -Seconds 5

# Test the API
try {
    $url = "http://localhost:$Port/"
    Write-Host "Testing API endpoint: $url"
    $result = Invoke-WebRequest -Uri $url -Method Get -TimeoutSec 10
    Write-Host "SUCCESS: API is running"
    Write-Host "Response status: $($result.StatusCode)"
} catch {
    Write-Host "ERROR: Could not connect to API"
    Write-Host $_.Exception.Message
}

# Return to original location
Pop-Location