# scripts/instalar-dependencias.ps1
# Instala as dependencias npm do projeto (node_modules).
# Aplica tambem o patch de compatibilidade do rollup para Windows.
# Retorna exit code 0 em sucesso, 1 em falha.

$Root = Split-Path -Parent $PSScriptRoot

Write-Host ""
Write-Host "  Verificando dependencias do projeto..."

# Garantir node no PATH
$nodeDir = "C:\Program Files\nodejs"
if (Test-Path "$nodeDir\node.exe") {
    if ($env:PATH -notlike "*$nodeDir*") {
        $env:PATH = "$nodeDir;" + $env:PATH
    }
}

# ── Verificar se node_modules existe ─────────────────────────
$nodeModules = Join-Path $Root "node_modules"
$tldrawOk    = Test-Path (Join-Path $nodeModules "tldraw")

if ($tldrawOk) {
    Write-Host "  Dependencias ja instaladas!" -ForegroundColor Green
} else {
    Write-Host "  Instalando dependencias pela primeira vez..." -ForegroundColor Yellow
    Write-Host "  (pode demorar alguns minutos na primeira vez)"
    Write-Host ""

    Set-Location $Root
    $result = Start-Process "npm" `
        -ArgumentList "install" `
        -WorkingDirectory $Root `
        -Wait `
        -PassThru `
        -NoNewWindow

    if ($result.ExitCode -ne 0) {
        Write-Host ""
        Write-Host "  ERRO ao instalar dependencias (npm install falhou)." -ForegroundColor Red
        Write-Host "  Verifique sua conexao com a internet e tente novamente." -ForegroundColor Yellow
        exit 1
    }

    Write-Host ""
    Write-Host "  Dependencias instaladas com sucesso!" -ForegroundColor Green
}

# ── Aplicar patch do rollup (wasm fallback para Windows) ──────
$wasmDst = Join-Path $nodeModules "rollup\dist\wasm-node"
$wasmSrc = Join-Path $nodeModules "@rollup\wasm-node\dist\wasm-node"
$nativeSrc = Join-Path $nodeModules "@rollup\wasm-node\dist\native.js"
$nativeDst = Join-Path $nodeModules "rollup\dist\native.js"

if (-not (Test-Path $wasmDst)) {
    Write-Host "  Aplicando correcao de compatibilidade do rollup..." -ForegroundColor Yellow

    if (Test-Path $wasmSrc) {
        Copy-Item -Recurse $wasmSrc $wasmDst -Force
        Write-Host "  wasm-node copiado!" -ForegroundColor Green
    }

    if (Test-Path $nativeSrc) {
        Copy-Item $nativeSrc $nativeDst -Force
        Write-Host "  native.js substituido pelo fallback wasm!" -ForegroundColor Green
    }
} else {
    Write-Host "  Patch do rollup ja aplicado!" -ForegroundColor Green
}

# ── Garantir pasta de arquivos ────────────────────────────────
$filesDir = Join-Path $Root "assets\files"
if (-not (Test-Path $filesDir)) {
    New-Item -ItemType Directory -Path $filesDir -Force | Out-Null
    Write-Host "  Pasta assets\files\ criada!" -ForegroundColor Green
}

Write-Host "  Tudo pronto!" -ForegroundColor Green
exit 0
