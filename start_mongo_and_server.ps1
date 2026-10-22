# Start MongoDB if not running
Write-Host "Checking MongoDB..."

# Start the backend server
Write-Host "Starting backend server..."
cd "C:\Users\rahil\Desktop\tender portal\backend"
$env:NODE_ENV = "development"
Write-Host "NODE_ENV set to $env:NODE_ENV"

# Start node server in background
$proc = Start-Process node -ArgumentList "server.js" -NoNewWindow -Wait -PassThru
Write-Host "Backend process started: $($proc.Id)"

# Wait a bit for startup
Start-Sleep -Seconds 5
Write-Host "Waiting completed"