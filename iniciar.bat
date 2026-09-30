@echo off
title Brainstormer

echo.
echo  =========================================
echo     Brainstormer - Iniciando
echo  =========================================

REM [1/4] Verificar Node.js e npm
echo.
echo  [1/4] Verificando Node.js...
powershell.exe -ExecutionPolicy Bypass -File "%~dp0scripts\verificar-node.ps1"
if errorlevel 1 (
    echo.
    echo  ERRO: Node.js nao foi instalado corretamente.
    echo  Execute instalar-node.bat como administrador e tente novamente.
    echo.
    pause
    exit /b 1
)

REM [2/4] Instalar dependencias
echo.
echo  [2/4] Verificando dependencias...
powershell.exe -ExecutionPolicy Bypass -File "%~dp0scripts\instalar-dependencias.ps1"
if errorlevel 1 (
    echo.
    echo  ERRO ao instalar dependencias.
    echo  Verifique sua conexao com a internet e tente novamente.
    echo.
    pause
    exit /b 1
)

REM [3/4] Iniciar servidor Express
echo.
echo  [3/4] Iniciando servidor...
powershell.exe -ExecutionPolicy Bypass -File "%~dp0scripts\iniciar-servidor.ps1"
if errorlevel 1 (
    echo.
    echo  ERRO ao iniciar servidor. Verifique server.log.
    echo.
    pause
    exit /b 1
)

REM [4/4] Iniciar frontend e abrir browser
echo.
echo  [4/4] Iniciando interface visual...
powershell.exe -ExecutionPolicy Bypass -File "%~dp0scripts\iniciar-frontend.ps1"

echo.
echo  =========================================
echo    Brainstormer esta rodando!
echo.
echo    Acesse:   http://localhost:5173
echo    Arquivos: coloque na pasta files
echo.
echo    Mantenha esta janela aberta.
echo    Pressione qualquer tecla para encerrar.
echo  =========================================
echo.
pause >nul

REM Encerrar tudo
echo.
echo  Encerrando Brainstormer...
powershell.exe -ExecutionPolicy Bypass -Command "Get-NetTCPConnection -LocalPort 3001,5173 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }"
echo  Encerrado. Ate logo!
timeout /t 2 /nobreak >nul
exit /b 0
