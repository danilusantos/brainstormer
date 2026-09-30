# scripts/iniciar-servidor.ps1
# Inicia o servidor unico (Express servindo o app + API) na porta 3001,
# aguarda ficar pronto e abre o navegador.
# Retorna exit code 0 em sucesso, 1 em falha.

$Root = Split-Path -Parent $PSScriptRoot

Write-Host ""
Write-Host "  Iniciando Brainstormer..."

# Recarregar PATH da maquina (caso o Node tenha sido instalado agora)
$env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "Machine") + ";" +
            [System.Environment]::GetEnvironmentVariable("PATH", "User")
$nodeDir = "C:\Program Files\nodejs"
if ((Test-Path "$nodeDir\node.exe") -and ($env:PATH -notlike "*$nodeDir*")) {
    $env:PATH = "$nodeDir;" + $env:PATH
}

# ── Encerrar instancia anterior na porta 3001 ─────────────────
$procs = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue
foreach ($conn in $procs) {
    $procId = $conn.OwningProcess
    if ($procId -and $procId -ne 0) {
        Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
    }
}

# ── Iniciar servidor em janela minimizada (desanexado) ────────
$vbsContent = @"
Set oShell = CreateObject("WScript.Shell")
oShell.Run "powershell.exe -ExecutionPolicy Bypass -NoProfile -WindowStyle Minimized -Command ""Set-Location '$($Root -replace "'","''")'; `$env:PATH = 'C:\Program Files\nodejs;' + `$env:PATH; npm run server""", 1, False
"@
$vbsFile = Join-Path $env:TEMP "brainstormer-server.vbs"
$vbsContent | Out-File -FilePath $vbsFile -Encoding ASCII -Force
Start-Process "wscript.exe" -ArgumentList "`"$vbsFile`""

# ── Aguardar porta 3001 ficar disponivel (max 40s) ────────────
Write-Host "  Aguardando o servidor iniciar" -NoNewline
$tries = 0
$maxTries = 20
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
    Write-Host "  Servidor pronto!" -ForegroundColor Green
} else {
    Write-Host "  Aviso: o servidor demorou mais que o esperado." -ForegroundColor Yellow
    Write-Host "  Abrindo o navegador mesmo assim..." -ForegroundColor Yellow
}

# ── Abrir o navegador ─────────────────────────────────────────
Write-Host "  Abrindo o navegador..."
Start-Process "http://localhost:3001"

exit 0
