# OmniHub - Merkezi Dağıtıcı & Lisans Yönetim Portalı

## 1. Proje Amacı ve Vizyonu
Bu proje, **Önder Cihan ACAR** tarafından geliştirilen kurumsal yazılımların (**OMNIFlow** ve **OmniSpot**) distribütör/üretici seviyesinde merkezi olarak yönetilmesini, bağımsız müşterilere lisanslanmasını ve lisans sürelerinin/durumlarının takip edilmesini sağlayan ana kontrol merkezidir.

## 2. Geliştirici İmzası & Telif Hakkı
- **"Designed & Developed by Önder Cihan ACAR © 2026. All Rights Reserved."**
- Tüm altlıklarda, giriş ekranında ve sertifikalarda kalıcıdır.

## 3. Temel Mimari ve Özellikler
1. **Müşteri CRM & Rehberi:**
   - Firma Adı, Yetkili Kişi, Telefon, E-Posta, Şehir, Vergi No, Adres ve Özel Notlar.
2. **Ürün Matrisi:**
   - Desteklenen Ürünler:
     - **OMNIFlow** (Bilişim ve Altyapı Yönetim Sistemi)
     - **OmniSpot** (Kurumsal Hotspot & 5651 Misafir Ağı)
     - Gelecekte eklenebilecek yeni Omni ürünleri modüler mimari.
3. **Kriptografik Lisans Üretici (Key Generator):**
   - Kırılamaz ve taklit edilemez AES-256 / HMAC tabanlı lisans anahtarı üretimi (`OMNI-FLW-XXXX-XXXX-XXXX`).
   - Lisans Tipleri:
     - Yıllık Abonelik (1 Yıl, 2 Yıl, 3 Yıl)
     - Aylık Abonelik
     - Süresiz / Ömür Boyu (Lifetime)
     - Demo / Deneme Sürümü (15 - 30 Gün)
   - Cihaz ve kullanıcı kotaları, aktif modül yetkileri.
4. **Anti-Korsan ve Donanım Kilidi (Hardware Fingerprint):**
   - Müşterinin sunucu donanım kimliğine (CPU / Anakart UUID) kilitlenme.
   - Yazılımın kopyalanıp başka bilgisayarlarda çalıştırılmasını engelleme.
5. **Uzaktan Müdahale & Heartbeat API:**
   - Müşterideki OmniFlow ve OmniSpot uygulamaları günde 1 kez merkeze online sinyal gönderir.
   - Ödeme gecikmesi veya fesih durumunda tek tıkla lisansı askıya alma / dondurma / iptal etme.
6. **Yenileme Alarmları & Satış Fırsatları:**
   - Süresi bitmeye 30, 15 ve 7 gün kalan müşteriler için renkli alarmlar.
   - Otomatik WhatsApp / E-posta lisans yenileme teklif şablonları.
7. **Resmi Lisans Sertifikası:**
   - Müşteriye teslim edilecek QR kodlu, güvenlik mühürlü A4 Lisans Belgesi çıktısı.

## 4. Teknik Altyapı
- **Port:** `http://localhost:5200`
- **Backend:** Node.js (`--experimental-sqlite`), `server/index.js`, `server/db.js`
- **Veritabanı:** SQLite (`server/data/omnihub.db`)
- **Frontend:** React + Vite + Tailwind CSS + Lucide Icons (Koyu siber tema)
- **Başlatıcı:** `baslat.bat` ve masaüstü kısayolu
