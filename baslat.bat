@echo off
chcp 65001 > nul
title OmniHub - Yonetim Portali
cd /d "%~dp0"

where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [HATA] Node.js sisteminizde bulunamadi!
    pause
    exit /b 1
)

netstat -ano | findstr /R /C:":5200 *LISTENING" >nul 2>&1
if %errorlevel% neq 0 (
    echo [*] OmniHub sunucusu baslatiliyor - Port 5200...
    start "" /d "%~dp0" /min node --experimental-sqlite server/index.js
    powershell -NoProfile -Command "for ($i=0; $i -lt 20; $i++) { try { $c = New-Object System.Net.Sockets.TcpClient('127.0.0.1', 5200); $c.Close(); break } catch { Start-Sleep -Milliseconds 500 } }"
) else (
    echo [OK] OmniHub sunucusu zaten aktif ve calisiyor.
)

echo [OK] Tarayicida aciliyor: http://localhost:5200
start http://localhost:5200