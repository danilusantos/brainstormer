@echo off
:: Verifica se ja esta rodando como administrador
net session >nul 2>&1
if %errorlevel% == 0 (
    :: Ja e admin, executa o script diretamente
    powershell.exe -ExecutionPolicy Bypass -File "%~dp0instalar-node.ps1"
) else (
    :: Nao e admin, relanca como administrador
    echo Solicitando permissao de administrador...
    powershell.exe -Command "Start-Process -FilePath 'powershell.exe' -ArgumentList '-ExecutionPolicy Bypass -File \"%~dp0instalar-node.ps1\"' -Verb RunAs -Wait"
)
