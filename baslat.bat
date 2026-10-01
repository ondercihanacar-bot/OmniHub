@echo off
chcp 65001 >nul
title OmniHub - Merkezi Dağıtıcı ve Lisans Yönetim Portalı
color 0B
cls

echo ===============================================================================
echo                OMNIHUB - MERKEZİ DAĞITICI ^& LİSANS YÖNETİM PORTALI
echo         Designed ^& Developed by Önder Cihan ACAR © 2026. All Rights Reserved.
echo ===============================================================================
echo.
echo [*] Sistem başlatılıyor...
echo [*] Veritabanı: data/omnihub.db (SQLite WAL Mode)
echo [*] Port: http://localhost:5200
echo.

:: Check node
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [HATA] Node.js sisteminizde kurulu bulunamadı!
    echo Lütfen Node.js v22+ kurunuz.
    pause
    exit /b
)

:: Build client if dist not found
if not exist "client\dist" (
    echo [*] Frontend derlemesi yapılıyor (İlk Kurulum)...
    cd client
    call npm run build
    cd ..
)

:: Open browser after 2 seconds
start "" powershell -Command "Start-Sleep -Seconds 2; Start-Process 'http://localhost:5200'"

:: Start backend server
echo [*] OmniHub Motoru başlatılıyor (Port 5200)...
node --experimental-sqlite server/index.js

pause
