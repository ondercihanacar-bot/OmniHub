# OmniHub - Proje Kuralları & Geliştirme Kılavuzu

## 1. Geliştirici İmzası (Telif Hakkı)
- Altlıklarda (Sidebar footer, Page footer, Auth footer):
  **"Designed & Developed by Önder Cihan ACAR © 2026. All Rights Reserved."**
  imzası kalıcıdır ve asla kaldırılmaz.

## 2. Arayüz ve Tasarım Standartları
- Koyu siber estetik (Slate 950 zemin, Cyan/Mavi/Zümrüt neon vurgular).
- Tam genişlik (Full-Width), yapay max-w daraltmaları yok.
- Beveled logo çerçevesi.
- Lisans ve müşteri tablolarında net durum rozetleri (Aktif, Donduruldu, Süresi Doldu, Demo).

## 3. Mimari ve Derleme Standartları
- Backend (`server/index.js`) port 5200 üzerinde çalışır.
- Veritabanı Node.js yerleşik `node:sqlite` kütüphanesini kullanır (`data/omnihub.db`).
- `client` klasöründe Vite + React kullanılır.

## 4. Marka Standardı
- Programın adı: **"OmniHub"** (Merkezi Dağıtıcı ve Lisans Yönetim Portalı).

## 5. Kurumsal Hareketli Logo Kuralı (Kalıcı Standart)
- OmniHub'ın resmi hareketli kurumsal logosu YALNIZCA **`C:\Users\Onder\Desktop\OmniHub\Logo-OmniHub.mp4`** (`/Logo-OmniHub.mp4`) dosyasıdır.
- Giriş sayfasında (Login), sol menüde (Sidebar) ve program içindeki tüm logo alanlarında başka hiçbir logo veya video kullanılmaz; bu video kalıcıdır ve asla değiştirilmez/eski haline döndürülmez.
- Arka planı derin siber lacivert (`#020617` / Slate-950) ile tam uyumlu ve `screen` harmanlama moduyla saydamlaştırılmış olarak çalışır.
