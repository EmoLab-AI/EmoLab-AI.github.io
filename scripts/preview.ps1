param(
    [int]$Port = 8000
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Resolve-Path (Join-Path $scriptDir "..")

Write-Host "Serving $projectRoot at http://127.0.0.1:$Port"
Set-Location $projectRoot
py -3 -m http.server $Port --bind 127.0.0.1
