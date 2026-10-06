@echo off
chcp 65001 > nul
title OmniHub - Yonetim Portali
cd /d "%~dp0"

echo ===============================================================================
echo                OMNIHUB - MERKEZI DAGITICI VE LISANS YONETIM PORTALI
echo         Designed and Developed by Onder Cihan ACAR 2026. All Rights Reserved.
echo ===============================================================================
echo.

where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [HATA] Node.js sisteminizde bulunamadi!
    pause
    exit /b 1
)

netstat -ano | findstr /R /C:":5200 *LISTENING" >nul 2>&1
if %errorlevel% neq 0 (
    echo [*] OmniHub sunucusu baslatiliyor - Port 5200...
    start "OmniHub Server" /min cmd /c "node --experimental-sqlite server/index.js"
    powershell -NoProfile -Command "for ($i=0; $i -lt 15; $i++) { try { $c = New-Object System.Net.Sockets.TcpClient('127.0.0.1', 5200); $c.Close(); break } catch { Start-Sleep -Milliseconds 500 } }"
) else (
    echo [OK] OmniHub sunucusu zaten aktif ve calisiyor.
)

echo [OK] Tarayicida aciliyor: http://localhost:5200
start http://localhost:5200