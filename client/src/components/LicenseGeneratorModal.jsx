import React, { useState, useEffect } from 'react';
import { 
  X, 
  Key, 
  ShieldCheck, 
  Cpu, 
  Check, 
  Copy, 
  Download, 
  FileText, 
  Sparkles, 
  Building, 
  Layers, 
  Calendar 
} from 'lucide-react';
import { api } from '../api';

export default function LicenseGeneratorModal({ isOpen, onClose, onGenerated, initialCustomerId = null }) {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [createdLicense, setCreatedLicense] = useState(null);
  const [copied, setCopied] = useState(false);

  // Form State
  const [customerId, setCustomerId] = useState(initialCustomerId || '');
  const [productId, setProductId] = useState('omniflow');
  const [licenseType, setLicenseType] = useState('yearly');
  const [durationMonths, setDurationMonths] = useState(12);
  const [durationDays, setDurationDays] = useState(15);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [maxDevices, setMaxDevices] = useState(50);
  const [maxUsers, setMaxUsers] = useState(100);
  const [enabledModules, setEnabledModules] = useState([]);
  const [hardwareId, setHardwareId] = useState('');
  const [hwidLockEnabled, setHwidLockEnabled] = useState(true);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
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

  useEffect(() => {
    if (isOpen) {
      loadInitialData();
      setCreatedLicense(null);
      setCopied(false);
      if (initialCustomerId) setCustomerId(initialCustomerId);
    }
  }, [isOpen, initialCustomerId]);

  async function loadInitialData() {
    setLoading(true);
    try {
      const [cRes, pRes] = await Promise.all([
        api.getCustomers(),
        api.getProducts()
      ]);
      setCustomers(cRes.customers || []);
      setProducts(pRes.products || []);
      
      // Default to first customer if not set
      if (!customerId && cRes.customers?.length > 0) {
        setCustomerId(cRes.customers[0].id);
      }
      
      // Set initial product modules
      const selectedP = pRes.products?.find(p => p.id === productId) || pRes.products?.[0];
      if (selectedP) {
        setProductId(selectedP.id);
        setEnabledModules(selectedP.available_modules || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Handle product change
  const handleProductChange = (prodId) => {
    setProductId(prodId);
    const prod = products.find(p => p.id === prodId);
    if (prod) {
      setEnabledModules(prod.available_modules || []);
      if (prod.id === 'omniflow') {
        setMaxDevices(50);
        setMaxUsers(100);
      } else {
        setMaxDevices(10);
        setMaxUsers(500);
      }
    }
  };

  const toggleModule = (mod) => {
    if (enabledModules.includes(mod)) {
      setEnabledModules(enabledModules.filter(m => m !== mod));
    } else {
      setEnabledModules([...enabledModules, mod]);
    }
  };

  const selectAllModules = () => {
    const prod = products.find(p => p.id === productId);
    if (prod) setEnabledModules(prod.available_modules || []);
  };

  const clearAllModules = () => {
    setEnabledModules([]);
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!customerId) {
      alert('Lütfen bir müşteri seçiniz.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.generateLicense({
        customer_id: customerId,
        product_id: productId,
        license_type: licenseType,
        duration_months: licenseType === 'monthly' ? durationMonths : (licenseType === '2year' ? 24 : (licenseType === '3year' ? 36 : 12)),
        duration_days: durationDays,
        start_date: startDate,
        max_devices: parseInt(maxDevices, 10) || 1,
        max_users: parseInt(maxUsers, 10) || 50,
        enabled_modules: enabledModules,
        hardware_id: hardwareId ? hardwareId.trim() : null,
        hwid_lock_enabled: hwidLockEnabled,
        notes
      });

      setCreatedLicense(res.license);
      if (onGenerated) onGenerated(res.license);
    } catch (err) {
      alert(err.message || 'Lisans oluşturulurken bir hata meydana geldi');
    } finally {
      setSubmitting(false);
    }
  };

  const copyKey = () => {
    if (!createdLicense) return;
    navigator.clipboard.writeText(createdLicense.license_key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadOfflineFile = () => {
    if (!createdLicense) return;
    const blob = new Blob([JSON.stringify(createdLicense, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${createdLicense.license_key}.omnilicense`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  const currentProd = products.find(p => p.id === productId);

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm p-3 sm:p-6"
    >
      <div className="min-h-full flex items-start justify-center py-4 sm:py-6">
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl overflow-hidden"
        >
        {/* Modal Top Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                Kriptografik Lisans Üretici
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                  AES-256 HMAC
                </span>
              </h3>
              <p className="text-xs text-slate-400">OMNIFlow & OmniSpot kurumsal lisans tahsisi</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {createdLicense ? (
          /* SUCCESS SCREEN AFTER GENERATION */
          <div className="p-8 space-y-6 bg-slate-950/60 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-950/80 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.3)]">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 font-mono">
                Lisans Başarıyla Üretildi & İmzalandı
              </span>
              <h2 className="text-2xl font-mono font-bold text-white mt-2 select-all tracking-wider p-3 bg-slate-900 border border-cyan-500/40 rounded-lg text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                {createdLicense.license_key}
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-left">
              <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg">
                <span className="text-[10px] text-slate-500 block">MÜŞTERİ</span>
                <span className="text-xs font-semibold text-slate-200 truncate block">
                  {createdLicense.customer_name}
                </span>
              </div>
              <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg">
                <span className="text-[10px] text-slate-500 block">ÜRÜN</span>
                <span className="text-xs font-semibold text-cyan-400 block">
                  {createdLicense.product_name}
                </span>
              </div>
              <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg">
                <span className="text-[10px] text-slate-500 block">GEÇERLİLİK</span>
                <span className="text-xs font-semibold text-slate-200 block">
                  {createdLicense.end_date || 'Süresiz (Lifetime)'}
                </span>
              </div>
              <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg">
                <span className="text-[10px] text-slate-500 block">KOTA / LİMİT</span>
                <span className="text-xs font-semibold text-slate-200 block">
                  {createdLicense.max_devices} Cihaz / {createdLicense.max_users} Kullanıcı
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={copyKey}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-[0_0_12px_rgba(6,182,212,0.3)] transition-all"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Anahtar Kopyalandı!' : 'Lisans Anahtarını Kopyala'}</span>
              </button>

              <button
                onClick={downloadOfflineFile}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-2 transition-all"
              >
                <Download className="w-4 h-4 text-cyan-400" />
                <span>.omnilicense Dosyasını İndir</span>
              </button>

              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium"
              >
                Kapat
              </button>
            </div>
          </div>
        ) : (
          /* FORM SCREEN */
          <form onSubmit={handleGenerate} className="p-6 space-y-5">
            {/* 1. Row: Customer & Product */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-cyan-400" />
                  Müşteri Seçimi *
                </label>
                <select
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                  required
                >
                  <option value="">-- Müşteri Seçiniz --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.company_name} ({c.contact_name}) - {c.city || 'Belirtilmedi'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  Yazılım Ürünü *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {products.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleProductChange(p.id)}
                      className={`px-3 py-2 rounded-lg border text-left text-xs font-medium transition-all flex items-center justify-between ${
                        productId === p.id
                          ? 'bg-cyan-950/70 border-cyan-500 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <span className="font-bold block text-slate-200">{p.name}</span>
                        <span className="text-[10px] text-slate-500">v{p.version} ({p.code})</span>
                      </div>
                      {productId === p.id && <Check className="w-4 h-4 text-cyan-400" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 2. Row: License Tier & Expiration */}
            <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-3">
              <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                Lisans Tipi & Süre Belirleme
              </label>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {[
                  { id: 'yearly', label: '1 Yıllık Abonelik' },
                  { id: '2year', label: '2 Yıllık Abonelik' },
                  { id: '3year', label: '3 Yıllık Abonelik' },
                  { id: 'demo', label: 'Demo / Deneme' },
                  { id: 'lifetime', label: 'Süresiz (Lifetime)' }
                ].map((tier) => (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => setLicenseType(tier.id)}
                    className={`p-2.5 rounded-lg border text-xs text-center transition-all ${
                      licenseType === tier.id
                        ? 'bg-cyan-600/20 border-cyan-500 text-cyan-300 font-semibold shadow-[0_0_8px_rgba(6,182,212,0.2)]'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {tier.label}
                  </button>
                ))}
              </div>

              {/* Extra duration controls for demo or monthly */}
              {licenseType === 'demo' && (
                <div className="flex items-center gap-3 pt-2">
                  <span className="text-xs text-slate-400">Demo Süresi:</span>
                  {[15, 30, 45].map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setDurationDays(days)}
                      className={`px-3 py-1 rounded text-xs border ${
                        durationDays === days
                          ? 'bg-amber-950/80 border-amber-500 text-amber-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      {days} Gün
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Row: Quotas (Devices / Users) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Maksimum Cihaz / Node Limiti
                </label>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={maxDevices}
                  onChange={(e) => setMaxDevices(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                />
                <span className="text-[10px] text-slate-500">
                  {productId === 'omniflow' ? 'İzlenecek Router, Switch ve Sunucu sayısı' : 'Bağlı Access Point sayısı'}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Eşzamanlı Kullanıcı / İstemci Limiti
                </label>
                <input
                  type="number"
                  min="1"
                  max="100000"
                  value={maxUsers}
                  onChange={(e) => setMaxUsers(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                />
                <span className="text-[10px] text-slate-500">
                  {productId === 'omnispot' ? 'Aynı anda bağlı kalabilecek Hotspot kullanıcı sayısı' : 'Tanımlanabilir operatör sayısı'}
                </span>
              </div>
            </div>

            {/* 4. Row: Active Modules Checklist */}
            <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  Aktif Yetkili Modüller ({enabledModules.length} seçildi)
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={selectAllModules}
                    className="text-[11px] text-cyan-400 hover:underline"
                  >
                    Tümünü Seç
                  </button>
                  <span className="text-slate-700">|</span>
                  <button
                    type="button"
                    onClick={clearAllModules}
                    className="text-[11px] text-slate-500 hover:text-slate-300"
                  >
                    Temizle
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pt-1">
                {(currentProd?.available_modules || []).map((mod) => {
                  const isChecked = enabledModules.includes(mod);
                  return (
                    <label
                      key={mod}
                      onClick={() => toggleModule(mod)}
                      className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer select-none transition-colors ${
                        isChecked
                          ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-200'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="rounded border-slate-700 text-cyan-500 focus:ring-0 focus:ring-offset-0 bg-slate-900"
                      />
                      <span className="truncate">{mod}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* 5. Row: Anti-Piracy Hardware Fingerprint */}
            <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                  Donanım Kilidi (Anti-Piracy HWID Lock)
                </label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hwidLockEnabled}
                    onChange={(e) => setHwidLockEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-600"></div>
                </label>
              </div>

              {hwidLockEnabled && (
                <div>
                  <input
                    type="text"
                    value={hardwareId}
                    onChange={(e) => setHardwareId(e.target.value)}
                    placeholder="Örn: CPU-BFEBFBFF-MB-CZC74966Q9 (Boş bırakılırsa ilk aktivasyonda kilitlenir)"
                    className="w-full bg-slate-950 border border-slate-700 font-mono text-xs rounded-lg px-3 py-2 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Önceden biliniyorsa donanım kimliğini girin; boş bırakılırsa müşteri uygulamayı ilk başlattığında sunucuya otomatik mühürlenir.
                  </span>
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Özel Lisans Notu / Fatura Referansı
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Örn: 2026/04 Kurumsal Sözleşme - Bölge Dağıtıcısı"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Footer Buttons */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-xs font-bold shadow-[0_0_15px_rgba(6,182,212,0.35)] flex items-center gap-2 transition-all hover:scale-[1.02]"
              >
                <Key className="w-4 h-4 text-cyan-200" />
                <span>{submitting ? 'Lisans Hesaplanıyor...' : 'LİSANSI ÜRET VE İMZALA'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
      </div>
    </div>
  );
}
