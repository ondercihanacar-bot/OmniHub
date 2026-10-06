import React, { useEffect } from 'react';
import { X, Printer, ShieldCheck, Download, CheckCircle, Cpu, Lock, Award, ArrowLeft } from 'lucide-react';
import StatusBadge from './StatusBadge';
import OmniHubLogo from './OmniHubLogo';

export default function LicenseCertificateModal({ isOpen, onClose, license }) {
  // ESC tuşu ve arkaplan kaydırmasını kilitleme
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !license) return null;

  const handlePrint = () => {
    window.print();
  };

  const enabledModules = Array.isArray(license.enabled_modules)
    ? license.enabled_modules
    : JSON.parse(license.enabled_modules || '[]');

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md p-2 sm:p-4 md:p-6"
    >
      {/* Sabit Yüzen Menüye Dön Butonu (Ekranda her zaman görünür) */}
      <div className="no-print fixed top-3 right-3 sm:top-5 sm:right-6 z-[60] flex items-center gap-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-xl bg-slate-900/95 hover:bg-slate-800 border-2 border-cyan-500/80 hover:border-cyan-400 text-white text-xs font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.4)] backdrop-blur-md cursor-pointer transition-all hover:scale-105 select-none"
        >
          <ArrowLeft className="w-4 h-4 text-cyan-400" />
          <span>Menüye Dön</span>
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] text-slate-300 font-mono">
            ESC
          </kbd>
        </button>
      </div>

      <div className="min-h-full flex items-start justify-center py-4 sm:py-8">
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Top Controls (Sticky - Sayfa kaysa bile tepede kalır) */}
          <div className="no-print sticky top-0 z-30 px-4 sm:px-6 py-3.5 border-b border-slate-800 bg-slate-950/95 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-2.5">
              <Award className="w-5 h-5 text-cyan-400 shrink-0" />
              <div>
                <span className="text-sm font-bold text-white tracking-wide block">
                  Resmi Kurumsal Lisans Sertifikası (A4)
                </span>
                <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                  {license.license_key}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={handlePrint}
                className="px-3.5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.35)] transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>YAZDIR / PDF</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-rose-950/40 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Geri Dön</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                title="Kapat (ESC)"
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* PRINTABLE CERTIFICATE BODY */}
          <div className="p-6 sm:p-8 md:p-12 bg-white text-slate-900 print:p-8 font-sans relative overflow-hidden">
            {/* Subtle Security Background Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none">
              <span className="text-[120px] font-black tracking-widest text-slate-900 transform -rotate-12">
                OMNIHUB
              </span>
            </div>

            {/* Certificate Double Border */}
            <div className="border-4 border-double border-slate-800 p-4 sm:p-6 md:p-8 rounded-lg relative z-10">
              {/* Header: Logo & Title */}
              <div className="flex flex-col sm:flex-row items-start justify-between border-b-2 border-slate-800 pb-6 mb-6 gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <OmniHubLogo size="certificate" />
                    <h1 className="text-2xl font-extrabold tracking-widest text-slate-900 font-mono">
                      OMNIHUB
                    </h1>
                  </div>
                  <p className="text-xs uppercase font-semibold text-slate-600 tracking-wider">
                    Merkezi Dağıtıcı ve Lisans Yönetim Portalı
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Resmi Yazılım Dağıtım ve Yetkilendirme Sertifikası
                  </p>
                </div>

                {/* QR Code container */}
                <div className="text-center self-center sm:self-auto">
                  {license.qr_code ? (
                    <img
                      src={license.qr_code}
                      alt="License QR"
                      className="w-24 h-24 border border-slate-400 p-1 rounded bg-white shadow-sm inline-block"
                    />
                  ) : (
                    <div className="w-24 h-24 border border-slate-400 rounded flex items-center justify-center text-[10px] text-slate-400">
                      QR Doğrulama
                    </div>
                  )}
                  <span className="block text-[9px] text-slate-500 font-mono mt-1">
                    Güvenlik Mührü
                  </span>
                </div>
              </div>

              {/* License Key Highlight Box */}
              <div className="my-6 p-4 bg-slate-100 border-2 border-dashed border-slate-400 rounded-lg text-center">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">
                  Yetkili Lisans Anahtarı (Cryptographic License Key)
                </span>
                <span className="text-lg sm:text-2xl font-mono font-black text-slate-900 tracking-widest select-all break-all">
                  {license.license_key}
                </span>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-6 text-sm">
                {/* Left Column: Customer */}
                <div className="space-y-3">
                  <div className="border-b border-slate-200 pb-1">
                    <span className="text-[11px] font-bold text-slate-500 uppercase block">Lisans Sahibi Kurum:</span>
                    <span className="text-base font-bold text-slate-900 block">{license.company_name}</span>
                  </div>
                  <div className="border-b border-slate-200 pb-1">
                    <span className="text-[11px] font-bold text-slate-500 uppercase block">Yetkili İletişim:</span>
                    <span className="text-sm font-medium text-slate-800 block">
                      {license.contact_name} {license.customer_phone ? `(${license.customer_phone})` : ''}
                    </span>
                  </div>
                  <div className="border-b border-slate-200 pb-1">
                    <span className="text-[11px] font-bold text-slate-500 uppercase block">Vergi Dairesi / No:</span>
                    <span className="text-sm text-slate-800 font-mono block">
                      {license.tax_office || '-'} / {license.tax_number || '-'}
                    </span>
                  </div>
                </div>

                {/* Right Column: Software Specs */}
                <div className="space-y-3">
                  <div className="border-b border-slate-200 pb-1">
                    <span className="text-[11px] font-bold text-slate-500 uppercase block">Yazılım Ürünü:</span>
                    <span className="text-base font-bold text-slate-900 block">
                      {license.product_name} (Sürüm: {license.product_version || '2.4'})
                    </span>
                  </div>
                  <div className="border-b border-slate-200 pb-1">
                    <span className="text-[11px] font-bold text-slate-500 uppercase block">Lisans Türü & Süre:</span>
                    <span className="text-sm font-medium text-slate-800 block">
                      {license.license_type === 'lifetime' ? 'Süresiz (Ömür Boyu)' : `${license.license_type?.toUpperCase()} (${license.start_date} / ${license.end_date || 'Süresiz'})`}
                    </span>
                  </div>
                  <div className="border-b border-slate-200 pb-1">
                    <span className="text-[11px] font-bold text-slate-500 uppercase block">Cihaz & Kullanıcı Limiti:</span>
                    <span className="text-sm text-slate-800 font-bold block">
                      {license.max_devices} Cihaz / {license.max_users} Kullanıcı
                    </span>
                  </div>
                </div>
              </div>

              {/* Modules Badges */}
              <div className="my-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-2">
                  Yetkilendirilmiş Aktif Modüller:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {enabledModules.map((m) => (
                    <span
                      key={m}
                      className="px-2.5 py-1 bg-white border border-slate-300 rounded text-xs font-medium text-slate-800 shadow-sm"
                    >
                      ✓ {m}
                    </span>
                  ))}
                </div>
              </div>

              {/* Hardware Binding & Anti-Piracy Notice */}
              <div className="my-4 p-3 bg-slate-100 rounded text-xs text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="font-bold text-slate-800">Donanım Mührü (HWID Lock):</span>{' '}
                  <span className="font-mono text-slate-900">
                    {license.hardware_id || 'İlk sunucu aktivasyonunda otomatik kilitlenecektir.'}
                  </span>
                </div>
                <div className="text-left sm:text-right text-[10px] text-slate-500">
                  AES-256 / SHA-256 Dijital İmza Korumalı
                </div>
              </div>

              {/* Signatures & Developer Copyright */}
              <div className="mt-8 pt-6 border-t-2 border-slate-800 flex items-end justify-between">
                <div className="text-left">
                  <p className="text-[10px] text-slate-400 font-mono">Doğrulama İmzası:</p>
                  <p className="text-[10px] text-slate-600 font-mono break-all max-w-xs">
                    {license.payload_signature ? license.payload_signature.slice(0, 32) + '...' : 'OMNIHUB-SECURE-SIGNATURE-VERIFIED'}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Düzenlenme Tarihi: {license.created_at ? new Date(license.created_at).toLocaleDateString('tr-TR') : new Date().toLocaleDateString('tr-TR')}
                  </p>
                </div>

                {/* Developer Seal */}
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full border-2 border-dashed border-cyan-800 flex flex-col items-center justify-center p-1 text-[9px] font-bold text-slate-800 mx-auto mb-1">
                    <span>RESMİ</span>
                    <span className="text-cyan-700 font-extrabold text-[10px]">OMNIHUB</span>
                    <span>MÜHÜR</span>
                  </div>
                  <p className="text-xs font-bold text-slate-900">Önder Cihan ACAR</p>
                  <p className="text-[10px] text-slate-600">Yazılım Mimarı & Geliştirici</p>
                </div>
              </div>

              {/* MANDATORY DEVELOPER SIGNATURE (Rule 1 in GEMINI.md) */}
              <div className="mt-6 pt-3 border-t border-slate-200 text-center">
                <p className="text-[11px] font-semibold text-slate-600 tracking-wide">
                  Designed &amp; Developed by Önder Cihan ACAR © 2026. All Rights Reserved.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Return Bar (Her zaman menüye dönebilmek için alt çubuk) */}
          <div className="no-print px-6 py-4 border-t border-slate-800 bg-slate-950 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-400">
              Designed &amp; Developed by <strong className="text-cyan-400">Önder Cihan ACAR</strong> © 2026. All Rights Reserved.
            </div>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 border border-slate-700 cursor-pointer"
              >
                <Printer className="w-4 h-4 text-cyan-400" />
                <span>Yazdır / PDF Kaydet</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-900/40 cursor-pointer transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Menüye Dön (Kapat)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
