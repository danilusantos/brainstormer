# instalar-node.ps1
# Instala o Node.js LTS automaticamente no Windows
# Execute como Administrador

Write-Host ""
Write-Host "========================================"
Write-Host "   Instalador do Node.js LTS"
Write-Host "========================================"
Write-Host ""

# Verificar se o Node.js ja esta instalado
Write-Host "Verificando se o Node.js ja esta instalado..."
$nodeVersion = $null
try {
    $nodeVersion = & node --version 2>$null
} catch {}

if ($nodeVersion) {
    Write-Host "Node.js ja esta instalado: $nodeVersion"
    Write-Host "Nenhuma acao necessaria."
    Write-Host ""
    pause
    exit 0
}

Write-Host "Node.js nao encontrado. Iniciando instalacao..."
Write-Host ""

# Tentar instalar via winget
$wingetAvailable = $false
try {
    $null = & winget --version 2>$null
    $wingetAvailable = $true
} catch {}

if ($wingetAvailable) {
    Write-Host "[Metodo 1] Instalando Node.js LTS via winget..."
    winget install --id OpenJS.NodeJS.LTS --silent --accept-package-agreements --accept-source-agreements

    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "Node.js instalado com sucesso via winget!"
    } else {
        Write-Host "Falha ao instalar via winget. Tentando via MSI..."
        $wingetAvailable = $false
    }
}

if (-not $wingetAvailable) {
    Write-Host "[Metodo 2] Instalando Node.js LTS via MSI direto do nodejs.org..."
    Write-Host ""

    # Detectar arquitetura
    $arch = if ([Environment]::Is64BitOperatingSystem) { "x64" } else { "x86" }
    Write-Host "Arquitetura detectada: $arch"

    # Buscar a versao LTS mais recente
    Write-Host "Buscando versao LTS mais recente..."
    try {
        $releases = Invoke-RestMethod "https://nodejs.org/dist/index.json"
        $ltsVersion = ($releases | Where-Object { $_.lts -ne $false } | Select-Object -First 1).version
    } catch {
        Write-Host "ERRO: Nao foi possivel buscar a versao do Node.js. Verifique sua conexao com a internet."
        pause
        exit 1
    }

    Write-Host "Versao LTS encontrada: $ltsVersion"

    # Montar URL do MSI
    $msiUrl = "https://nodejs.org/dist/$ltsVersion/node-$ltsVersion-$arch.msi"
    $installer = "$env:TEMP\nodejs-lts.msi"

    # Baixar o instalador
    Write-Host "Baixando Node.js $ltsVersion ($arch)..."
    Write-Host "URL: $msiUrl"
    try {
        Invoke-WebRequest -Uri $msiUrl -OutFile $installer -UseBasicParsing
    } catch {
        Write-Host "ERRO: Falha ao baixar o instalador. Verifique sua conexao com a internet."
        pause
        exit 1
    }

    # Instalar silenciosamente
    Write-Host "Executando instalador silencioso..."
    Write-Host "(Isso pode demorar alguns minutos...)"
    try {
        Start-Process msiexec.exe -ArgumentList "/i `"$installer`" /qn /norestart" -Wait -Verb RunAs
    } catch {
        Write-Host "ERRO: Falha ao executar o instalador. Execute este script como Administrador."
        pause
        exit 1
    }

    # Limpar arquivo temporario
    Remove-Item $installer -Force -ErrorAction SilentlyContinue
    Write-Host "Node.js $ltsVersion instalado com sucesso!"
}

# Atualizar PATH na sessao atual
Write-Host ""
Write-Host "Atualizando variaveis de ambiente..."
$env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH", "User")

# Verificar instalacao
Write-Host ""
$nodeVersionCheck = $null
try {
    $nodeVersionCheck = & node --version 2>$null
} catch {}

if ($nodeVersionCheck) {
    Write-Host "========================================"
    Write-Host "   Instalacao concluida com sucesso!"
    Write-Host "   Node.js versao: $nodeVersionCheck"
    $npmVersion = & npm --version 2>$null
    Write-Host "   npm versao:     $npmVersion"
    Write-Host "========================================"
    Write-Host ""
    Write-Host "Voce ja pode fechar esta janela e executar o iniciar.bat"
} else {
    Write-Host "========================================"
    Write-Host "   ATENCAO: Node.js instalado, mas nao"
    Write-Host "   detectado nesta sessao do terminal."
    Write-Host "   Feche e abra um novo terminal e"
    Write-Host "   execute: node --version"
    Write-Host "========================================"
}

Write-Host ""
pause
