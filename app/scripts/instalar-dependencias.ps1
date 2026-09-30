# scripts/instalar-dependencias.ps1
# Instala as dependencias npm do projeto (node_modules).
# Aplica tambem o patch de compatibilidade do rollup para Windows.
# Retorna exit code 0 em sucesso, 1 em falha.

$Root = Split-Path -Parent $PSScriptRoot

Write-Host ""
Write-Host "  Verificando dependencias do projeto..."

# ── Recarregar o PATH da maquina ──────────────────────────────
# Se o Node foi instalado agora (nesta mesma janela), o PATH da sessao
# ainda nao o conhece. Recarregamos das variaveis de ambiente do sistema.
$env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "Machine") + ";" +
            [System.Environment]::GetEnvironmentVariable("PATH", "User")

# Localizar o npm (no Windows e um .cmd, nao um .exe)
$nodeDir = "C:\Program Files\nodejs"
$npmCmd = Join-Path $nodeDir "npm.cmd"
if (-not (Test-Path $npmCmd)) {
    $found = Get-Command npm -ErrorAction SilentlyContinue
    if ($found) { $npmCmd = $found.Source }
}
if ((Test-Path "$nodeDir\node.exe") -and ($env:PATH -notlike "*$nodeDir*")) {
    $env:PATH = "$nodeDir;" + $env:PATH
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

    # Invoca 'npm install' via cmd /c (lida corretamente com o npm.cmd).
    # Roda de forma sincrona e no diretorio do projeto.
    Push-Location $Root
    & cmd.exe /c "`"$npmCmd`" install"
    $npmExit = $LASTEXITCODE
    Pop-Location

    if ($npmExit -ne 0) {
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
