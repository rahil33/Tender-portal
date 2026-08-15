cd 'C:\Users\rahil\Desktop\tender portal\backend'
$env:NODE_ENV='development'
Start-Process node -ArgumentList 'server.js' -Wait -RedirectStandardOutput 'output.log' -RedirectStandardError 'error.log'