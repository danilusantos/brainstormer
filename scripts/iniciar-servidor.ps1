# scripts/iniciar-servidor.ps1
# Inicia o servidor Express (porta 3001) em segundo plano.
# Aguarda a porta ficar disponivel antes de retornar.
# Retorna exit code 0 em sucesso, 1 em falha.

$Root = Split-Path -Parent $PSScriptRoot

Write-Host ""
Write-Host "  Iniciando servidor Express..."

# Garantir node/npm no PATH
$nodeDir = "C:\Program Files\nodejs"
if (Test-Path "$nodeDir\node.exe") {
    if ($env:PATH -notlike "*$nodeDir*") {
        $env:PATH = "$nodeDir;" + $env:PATH
    }
}

# ── Encerrar instancia anterior na porta 3001 ─────────────────
$procs = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue
foreach ($conn in $procs) {
    $procId = $conn.OwningProcess
    if ($procId -and $procId -ne 0) {
        Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
    }
}

# ── Iniciar servidor em nova janela minimizada ────────────────
# Usa wscript com VBS para desanexar o processo do pai sem bloquear
$vbsContent = @"
Set oShell = CreateObject("WScript.Shell")
oShell.Run "powershell.exe -ExecutionPolicy Bypass -NoProfile -WindowStyle Minimized -Command ""Set-Location '$($Root -replace "'","''")'; `$env:PATH = 'C:\Program Files\nodejs;' + `$env:PATH; npm run server""", 1, False
"@
$vbsFile = Join-Path $env:TEMP "brainstormer-server.vbs"
$vbsContent | Out-File -FilePath $vbsFile -Encoding ASCII -Force
Start-Process "wscript.exe" -ArgumentList "`"$vbsFile`""

# ── Aguardar porta 3001 ficar disponivel (max 30s) ────────────
Write-Host "  Aguardando servidor inicializar" -NoNewline
$tries = 0
$maxTries = 15
$ready = $false

while ($tries -lt $maxTries) {
    Start-Sleep -Seconds 2
    $tries++
    Write-Host "." -NoNewline

    try {
        $tcp = New-Object System.Net.Sockets.TcpClient
        $tcp.Connect("localhost", 3001)
        $tcp.Close()
        $ready = $true
        break
    } catch {
        # ainda nao pronto
    }
}

Write-Host ""

if ($ready) {
    Write-Host "  Servidor pronto em http://localhost:3001" -ForegroundColor Green
    exit 0
} else {
    Write-Host "  Aviso: servidor demorou mais que o esperado." -ForegroundColor Yellow
    Write-Host "  Verifique server.log se houver problemas." -ForegroundColor Yellow
    exit 0
}
