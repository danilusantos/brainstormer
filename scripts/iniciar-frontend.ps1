# scripts/iniciar-frontend.ps1
# Inicia o Vite dev server (porta 5173) em segundo plano.
# Aguarda a porta ficar disponivel e abre o navegador.
# Retorna exit code 0 em sucesso, 1 em falha.

$Root = Split-Path -Parent $PSScriptRoot

Write-Host ""
Write-Host "  Iniciando interface visual (Vite)..."

# Garantir node/npm no PATH
$nodeDir = "C:\Program Files\nodejs"
if (Test-Path "$nodeDir\node.exe") {
    if ($env:PATH -notlike "*$nodeDir*") {
        $env:PATH = "$nodeDir;" + $env:PATH
    }
}

# ── Encerrar instancia anterior na porta 5173 ─────────────────
$procs = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
foreach ($conn in $procs) {
    $procId = $conn.OwningProcess
    if ($procId -and $procId -ne 0) {
        Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
    }
}

# ── Iniciar Vite em nova janela minimizada ────────────────────
$vbsContent = @"
Set oShell = CreateObject("WScript.Shell")
oShell.Run "powershell.exe -ExecutionPolicy Bypass -NoProfile -WindowStyle Minimized -Command ""Set-Location '$($Root -replace "'","''")'; `$env:PATH = 'C:\Program Files\nodejs;' + `$env:PATH; npm run dev""", 1, False
"@
$vbsFile = Join-Path $env:TEMP "brainstormer-frontend.vbs"
$vbsContent | Out-File -FilePath $vbsFile -Encoding ASCII -Force
Start-Process "wscript.exe" -ArgumentList "`"$vbsFile`""

# ── Aguardar porta 5173 ficar disponivel (max 90s) ────────────
Write-Host "  Aguardando interface inicializar (pode demorar na 1a vez)" -NoNewline
$tries = 0
$maxTries = 45
$ready = $false

while ($tries -lt $maxTries) {
    Start-Sleep -Seconds 2
    $tries++
    Write-Host "." -NoNewline

    try {
        $tcp = New-Object System.Net.Sockets.TcpClient
        $tcp.Connect("localhost", 5173)
        $tcp.Close()
        $ready = $true
        break
    } catch {
        # ainda nao pronto
    }
}

Write-Host ""

if ($ready) {
    Write-Host "  Interface pronta em http://localhost:5173" -ForegroundColor Green
} else {
    Write-Host "  Aviso: interface demorou mais que o esperado." -ForegroundColor Yellow
    Write-Host "  Abrindo navegador mesmo assim..." -ForegroundColor Yellow
}

# ── Abrir navegador ───────────────────────────────────────────
Write-Host "  Abrindo navegador..."
Start-Process "http://localhost:5173"

exit 0
