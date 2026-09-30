@echo off
title Brainstormer

REM Criar/atualizar o atalho com icone (caminhos corretos desta maquina)
if not exist "%~dp0Brainstormer.lnk" (
    powershell.exe -ExecutionPolicy Bypass -File "%~dp0app\scripts\criar-atalho.ps1" >nul 2>&1
)

echo.
echo  =========================================
echo     Brainstormer - Iniciando
echo  =========================================

REM [1/3] Verificar Node.js e npm
echo.
echo  [1/3] Verificando Node.js...
powershell.exe -ExecutionPolicy Bypass -File "%~dp0app\scripts\verificar-node.ps1"
if errorlevel 1 (
    echo.
    echo  ERRO: Node.js nao foi instalado corretamente.
    echo  Verifique sua conexao com a internet e execute este arquivo novamente.
    echo  Se o problema persistir, instale o Node.js manualmente em https://nodejs.org
    echo.
    pause
    exit /b 1
)

REM [2/3] Instalar dependencias (apenas na primeira vez)
echo.
echo  [2/3] Verificando dependencias...
powershell.exe -ExecutionPolicy Bypass -File "%~dp0app\scripts\instalar-dependencias.ps1"
if errorlevel 1 (
    echo.
    echo  ERRO ao instalar dependencias.
    echo  Verifique sua conexao com a internet e tente novamente.
    echo.
    pause
    exit /b 1
)

REM [3/3] Iniciar o servidor e abrir o navegador
echo.
echo  [3/3] Iniciando o servidor...
powershell.exe -ExecutionPolicy Bypass -File "%~dp0app\scripts\iniciar-servidor.ps1"

echo.
echo  =========================================
echo    Brainstormer esta rodando!
echo.
echo    Acesse:   http://localhost:3001
echo    Arquivos: pasta files
echo.
echo    Mantenha esta janela aberta.
echo    Pressione qualquer tecla para encerrar.
echo  =========================================
echo.
pause >nul

REM Encerrar o servidor ao fechar
echo.
echo  Encerrando Brainstormer...
powershell.exe -ExecutionPolicy Bypass -Command "Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }"
echo  Encerrado. Ate logo!
timeout /t 2 /nobreak >nul
exit /b 0
