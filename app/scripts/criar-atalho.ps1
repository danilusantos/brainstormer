# scripts/criar-atalho.ps1
# Cria o atalho "Brainstormer.lnk" na raiz do projeto, com icone,
# apontando para o iniciar.bat. Usa caminhos absolutos desta maquina,
# por isso e gerado localmente (nao versionado).

# Raiz = duas pastas acima deste script (scripts -> app -> raiz)
$AppDir = Split-Path -Parent $PSScriptRoot
$Root = Split-Path -Parent $AppDir

$batPath = Join-Path $Root "iniciar.bat"
$icoPath = Join-Path $AppDir "assets\brainstormer.ico"
$lnkPath = Join-Path $Root "Brainstormer.lnk"

try {
    $WshShell = New-Object -ComObject WScript.Shell
    $shortcut = $WshShell.CreateShortcut($lnkPath)
    $shortcut.TargetPath = $batPath
    $shortcut.WorkingDirectory = $Root
    if (Test-Path $icoPath) {
        $shortcut.IconLocation = "$icoPath,0"
    }
    $shortcut.Description = "Abrir o Brainstormer"
    $shortcut.Save()
    Write-Host "Atalho criado: $lnkPath"
} catch {
    Write-Host "Nao foi possivel criar o atalho: $_"
}
