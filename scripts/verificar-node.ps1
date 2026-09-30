# scripts/verificar-node.ps1
# Verifica se Node.js e npm estao instalados.
# Se nao estiverem, chama o instalador.
# Retorna exit code 0 em sucesso, 1 em falha.

$Root = Split-Path -Parent $PSScriptRoot

Write-Host ""
Write-Host "  Verificando Node.js e npm..."

# ── Tentar encontrar node mesmo fora do PATH ──────────────────
$nodePaths = @(
    "C:\Program Files\nodejs\node.exe",
    "C:\Program Files (x86)\nodejs\node.exe",
    "$env:APPDATA\npm\node.exe",
    "$env:LOCALAPPDATA\Programs\nodejs\node.exe"
)

$nodeExe = $null
foreach ($p in $nodePaths) {
    if (Test-Path $p) { $nodeExe = $p; break }
}

# Verificar via PATH tambem
$nodeInPath = Get-Command node -ErrorAction SilentlyContinue
if ($nodeInPath) { $nodeExe = $nodeInPath.Source }

if ($nodeExe) {
    # Adicionar ao PATH desta sessao se necessario
    $nodeDir = Split-Path $nodeExe
    if ($env:PATH -notlike "*$nodeDir*") {
        $env:PATH = "$nodeDir;" + $env:PATH
        [System.Environment]::SetEnvironmentVariable("PATH", $env:PATH, "Process")
    }

    $nodeVer = & node --version 2>$null
    $npmVer  = & npm --version 2>$null
    Write-Host "  Node.js $nodeVer encontrado!" -ForegroundColor Green
    Write-Host "  npm $npmVer encontrado!" -ForegroundColor Green
    exit 0
}

# ── Node nao encontrado: chamar instalador ────────────────────
Write-Host "  Node.js nao encontrado. Iniciando instalacao..." -ForegroundColor Yellow
Write-Host ""

$installerScript = Join-Path $PSScriptRoot "instalar-node.ps1"

if (-not (Test-Path $installerScript)) {
    Write-Host "  ERRO: instalar-node.ps1 nao encontrado em $PSScriptRoot" -ForegroundColor Red
    exit 1
}

# Executar instalador como administrador
Start-Process powershell.exe `
    -ArgumentList "-ExecutionPolicy Bypass -File `"$installerScript`"" `
    -Verb RunAs `
    -Wait

# Recarregar PATH apos instalacao
$env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "Machine") + ";" +
            [System.Environment]::GetEnvironmentVariable("PATH", "User")

# Verificar novamente
$nodeCheck = Get-Command node -ErrorAction SilentlyContinue
if ($nodeCheck) {
    $nodeVer = & node --version 2>$null
    Write-Host ""
    Write-Host "  Node.js $nodeVer instalado com sucesso!" -ForegroundColor Green
    exit 0
} else {
    Write-Host ""
    Write-Host "  ERRO: Node.js nao foi detectado apos instalacao." -ForegroundColor Red
    Write-Host "  Feche esta janela, abra um novo terminal e execute iniciar.bat novamente." -ForegroundColor Yellow
    exit 1
}
