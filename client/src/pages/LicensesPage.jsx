import React, { useState, useEffect, useRef } from 'react';
import { 
  Key, 
  Search, 
  Filter, 
  Plus, 
  Copy, 
  Check, 
  PauseCircle, 
  PlayCircle, 
  RefreshCw, 
  Award, 
  Download, 
  RotateCcw, 
  Trash2, 
  Radio, 
  ShieldAlert, 
  ExternalLink,
  Cpu,
  Building,
  X
} from 'lucide-react';
import { api } from '../api';
import StatusBadge from '../components/StatusBadge';

export default function LicensesPage({ 
  onOpenGenerator, 
  onOpenCertificate, 
  onOpenRenew, 
  onOpenSimulator,
  initialFilters = {} 
}) {
  const [licenses, setLicenses] = useState([]);
  const [allCustomers, setAllCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialFilters.status || '');
  const [productFilter, setProductFilter] = useState(initialFilters.product_id || '');
  const [copiedKey, setCopiedKey] = useState(null);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const searchContainerRef = useRef(null);

  // Müşterileri arama önerileri (autocomplete) için başlangıçta yükle
  useEffect(() => {
    api.getCustomers().then(res => {
      setAllCustomers(res.customers || []);
    }).catch(() => {});
  }, []);

  // Dışarı tıklandığında öneri dropdown'ını kapat
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsSuggestionsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Arama metni, durum veya ürün filtresi değiştikçe anlık debounced sorgu
  useEffect(() => {
    const timer = setTimeout(() => {
      loadLicenses();
    }, 200);
    return () => clearTimeout(timer);
  }, [search, statusFilter, productFilter]);

  async function loadLicenses() {
    setLoading(true);
    try {
      const res = await api.getLicenses({
        status: statusFilter,
        product_id: productFilter,
        search
      });
      setLicenses(res.licenses || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const copyKey = (key) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleToggleFreeze = async (lic) => {
    const isCurrentlySuspended = lic.status === 'suspended';
    const targetStatus = isCurrentlySuspended ? 'active' : 'suspended';
    const confirmMsg = isCurrentlySuspended
      ? `"${lic.license_key}" lisansının dondurulması kaldırılacak ve sistem yeniden AKTİF hale gelecektir. Onaylıyor musunuz?`
      : `DİKKAT: "${lic.license_key}" lisansı uzaktan dondurulacak (Askıya Alınacak). Müşterinin sunucusu merkezden sinyal aldığında servisleri durduracaktır. Onaylıyor musunuz?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      await api.updateLicenseStatus(lic.id, targetStatus, isCurrentlySuspended ? 'Yönetici tarafından aktif edildi' : 'Yönetici tarafından uzaktan donduruldu');
      loadLicenses();
    } catch (err) {
      alert(err.message || 'Durum güncellenemedi');
    }
  };

  const handleResetHwid = async (lic) => {
    if (!window.confirm(`"${lic.license_key}" lisansının donanım kilidi sıfırlansın mı? Müşteri yeni bir donanımda çalıştırdığında otomatik olarak o sunucuya bağlanacaktır.`)) return;

    try {
      const res = await api.resetHwid(lic.id);
      alert(res.message);
      loadLicenses();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (lic) => {
    if (!window.confirm(`"${lic.license_key}" lisans kaydını kalıcı olarak silmek istediğinize emin misiniz?`)) return;

    try {
      await api.deleteLicense(lic.id);
      loadLicenses();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDownloadBlob = (lic) => {
    window.location.href = `/api/licenses/${lic.id}/export`;
  };

  // Eşleşen Müşteri Önerileri (Autocomplete Dropdown Listesi)
  const customerSuggestions = (allCustomers || []).filter((c) => {
    if (!search.trim()) return false;
    const term = search.trim().toLocaleLowerCase('tr-TR');
    return (
      (c.company_name || '').toLocaleLowerCase('tr-TR').includes(term) ||
      (c.contact_name || '').toLocaleLowerCase('tr-TR').includes(term) ||
      (c.city || '').toLocaleLowerCase('tr-TR').includes(term) ||
      (c.tax_number || '').includes(term)
    );
  }).slice(0, 5);

  // Tabloda Anlık 0ms İstemci Filtrelemesi (Gecikmesiz Canlı Arama)
  const displayedLicenses = licenses.filter((lic) => {
    if (!search.trim()) return true;
    const term = search.trim().toLocaleLowerCase('tr-TR');
    const compName = (lic.company_name || '').toLocaleLowerCase('tr-TR');
    const contactName = (lic.contact_name || '').toLocaleLowerCase('tr-TR');
    const key = (lic.license_key || '').toLocaleLowerCase('tr-TR');
    const hwid = (lic.hardware_id || '').toLocaleLowerCase('tr-TR');
    const prod = (lic.product_name || '').toLocaleLowerCase('tr-TR');
    return (
      compName.includes(term) ||
      contactName.includes(term) ||
      key.includes(term) ||
      hwid.includes(term) ||
      prod.includes(term)
    );
  });

  return (
    <div className="p-6 space-y-6">
      {/* Top Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Canlı Arama Kutusu ve Otomatik Tamamlama Dropdown'ı */}
        <div ref={searchContainerRef} className="relative w-full md:w-96">
          <div className="relative">
            <input
              type="text"
              value={search}
              onFocus={() => setIsSuggestionsOpen(true)}
              onChange={(e) => {
                setSearch(e.target.value);
                setIsSuggestionsOpen(true);
              }}
              placeholder="Firma adı, lisans anahtarı veya yetkili ara..."
              className="w-full bg-slate-900 border border-slate-700/80 focus:border-cyan-400 rounded-lg pl-9 pr-8 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all shadow-inner"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setIsSuggestionsOpen(false);
                }}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Aramayı Temizle"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Autocomplete Müşteri Öneri Açılır Listesi */}
          {isSuggestionsOpen && customerSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 z-40 bg-slate-900/95 border border-cyan-500/70 rounded-xl shadow-[0_10px_35px_rgba(0,0,0,0.8)] overflow-hidden backdrop-blur-xl animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="px-3 py-2 border-b border-slate-800 bg-slate-950/90 text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider flex items-center justify-between">
                <span>Eşleşen Müşteriler ({customerSuggestions.length})</span>
                <span className="text-slate-500 text-[9px] font-sans">Seçmek için tıklayınız</span>
              </div>
              <div className="divide-y divide-slate-800/60 max-h-64 overflow-y-auto">
                {customerSuggestions.map((cust) => (
                  <div
                    key={cust.id}
                    onMouseDown={() => {
                      setSearch(cust.company_name);
                      setIsSuggestionsOpen(false);
                    }}
                    className="p-2.5 hover:bg-cyan-950/50 hover:border-l-2 hover:border-l-cyan-400 transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-600 group-hover:text-white transition-colors shrink-0">
                        <Building className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                          {cust.company_name}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {cust.contact_name} {cust.city ? `• ${cust.city}` : ''} {cust.phone ? `• ${cust.phone}` : ''}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 group-hover:text-cyan-300 px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700/60 shrink-0 ml-2">
                      Filtrele →
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Filters and New License Button */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="">Tüm Durumlar</option>
            <option value="active">Aktif Lisanslar</option>
            <option value="suspended">Dondurulanlar</option>
            <option value="expired">Süresi Dolanlar</option>
            <option value="demo">Demo Lisanslar</option>
          </select>

          {/* Product Filter */}
          <select
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="">Tüm Ürünler</option>
            <option value="omniflow">OMNIFlow</option>
            <option value="omnispot">OmniSpot</option>
          </select>

          {/* New License Button */}
          <button
            type="button"
            onClick={onOpenGenerator}
            className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-xs font-bold shadow-[0_0_12px_rgba(6,182,212,0.3)] flex items-center gap-2 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>YENİ LİSANS ÜRET</span>
          </button>
        </div>
      </div>

      {/* Licenses Master Full-Width Table */}
      <div className="cyber-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Lisans Anahtarı & Ürün</th>
                <th className="py-3 px-4">Müşteri</th>
                <th className="py-3 px-4">Tip & Geçerlilik</th>
                <th className="py-3 px-4">Kotalar & Modüller</th>
                <th className="py-3 px-4">Donanım Kilidi (HWID)</th>
                <th className="py-3 px-4">Durum</th>
                <th className="py-3 px-4 text-right">Müdahale & Eylemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto text-cyan-400 mb-2" />
                    Lisans veritabanı taranıyor...
                  </td>
                </tr>
              ) : displayedLicenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 space-y-2">
                    <p>Arama kriterlerine uygun lisans bulunamadı {search ? `("${search}")` : ''}.</p>
                    {search && (
                      <button
                        type="button"
                        onClick={() => setSearch('')}
                        className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold cursor-pointer transition-colors"
                      >
                        Aramayı Sıfırla
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                displayedLicenses.map((lic) => {
                  const isCopied = copiedKey === lic.license_key;
                  return (
                    <tr key={lic.id} className="hover:bg-slate-900/50 transition-colors">
                      {/* Key & Product */}
                      <td className="py-3 px-4 font-mono">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white tracking-wide">
                            {lic.license_key}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyKey(lic.license_key)}
                            title="Anahtarı Kopyala"
                            className="text-slate-400 hover:text-cyan-300 p-0.5 cursor-pointer"
                          >
                            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1 font-sans">
                          <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-400 text-[10px] font-bold">
                            {lic.product_name}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            v{lic.last_client_version || '2.4'}
                          </span>
                        </div>
                      </td>

                      {/* Customer Info */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-200">
                          {lic.company_name}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {lic.contact_name} {lic.customer_city ? `• ${lic.customer_city}` : ''}
                        </div>
                      </td>

                      {/* Tier & Validity */}
                      <td className="py-3 px-4">
                        <span className="text-slate-300 capitalize font-medium block">
                          {lic.license_type === 'yearly' ? '1 Yıllık' : lic.license_type === 'lifetime' ? 'Süresiz' : lic.license_type}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          {lic.end_date ? (
                            <span className={lic.days_remaining <= 15 ? 'text-amber-400 font-bold' : ''}>
                              {lic.end_date} ({lic.days_remaining} gün)
                            </span>
                          ) : (
                            <span className="text-emerald-400">Ömür Boyu</span>
                          )}
                        </span>
                      </td>

                      {/* Limits & Modules */}
                      <td className="py-3 px-4">
                        <div className="text-slate-300 font-mono font-medium">
                          {lic.max_devices} Cihaz / {lic.max_users} Kullanıcı
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {lic.enabled_modules?.length || 0} Aktif Modül
                        </div>
                      </td>

                      {/* HWID Lock */}
                      <td className="py-3 px-4 font-mono text-[11px]">
                        {lic.hardware_id ? (
                          <div className="flex items-center gap-1.5 text-cyan-400/90">
                            <Cpu className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                            <span className="truncate max-w-[120px]" title={lic.hardware_id}>
                              {lic.hardware_id}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleResetHwid(lic)}
                              title="Donanım Kilidini Sıfırla (Yeni sunucuya izin ver)"
                              className="text-slate-500 hover:text-amber-400 p-0.5 cursor-pointer ml-1"
                            >
                              <RotateCcw className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">
                            İlk başlatmada kilitlenecek
                          </span>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3 px-4">
                        <StatusBadge status={lic.status} />
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Remote Killswitch / Freeze Toggle */}
                          <button
                            type="button"
                            onClick={() => handleToggleFreeze(lic)}
                            title={lic.status === 'suspended' ? 'Lisansı Yeniden Aktifleştir' : 'Uzaktan Lisansı Dondur (Askıya Al)'}
                            className={`p-1.5 rounded-md border transition-colors cursor-pointer ${
                              lic.status === 'suspended'
                                ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300 hover:bg-emerald-900'
                                : 'bg-amber-950/80 border-amber-600 text-amber-300 hover:bg-amber-900'
                            }`}
                          >
                            {lic.status === 'suspended' ? <PlayCircle className="w-4 h-4" /> : <PauseCircle className="w-4 h-4" />}
                          </button>

                          {/* Renew / Extend */}
                          <button
                            type="button"
                            onClick={() => onOpenRenew(lic)}
                            title="Süre Uzat / Yenile"
                            className="p-1.5 rounded-md bg-slate-900 border border-slate-700 text-slate-300 hover:text-cyan-400 hover:border-cyan-500 transition-colors cursor-pointer"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>

                          {/* Certificate */}
                          <button
                            type="button"
                            onClick={() => onOpenCertificate(lic)}
                            title="A4 Resmi Sertifika Görüntüle / Yazdır"
                            className="p-1.5 rounded-md bg-slate-900 border border-slate-700 text-slate-300 hover:text-cyan-400 hover:border-cyan-500 transition-colors cursor-pointer"
                          >
                            <Award className="w-4 h-4" />
                          </button>

                          {/* Download Offline Blob */}
                          <button
                            type="button"
                            onClick={() => handleDownloadBlob(lic)}
                            title=".omnilicense Dosyasını İndir"
                            className="p-1.5 rounded-md bg-slate-900 border border-slate-700 text-slate-300 hover:text-cyan-400 hover:border-cyan-500 transition-colors cursor-pointer"
                          >
                            <Download className="w-4 h-4" />
                          </button>

                          {/* Test Signal */}
                          <button
                            type="button"
                            onClick={() => onOpenSimulator(lic.license_key)}
                            title="İstemci Sinyal Testi (Simülatör)"
                            className="p-1.5 rounded-md bg-slate-900 border border-slate-700 text-slate-300 hover:text-emerald-400 transition-colors cursor-pointer"
                          >
                            <Radio className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => handleDelete(lic)}
                            title="Lisansı Sil"
                            className="p-1.5 rounded-md bg-slate-900 border border-slate-700 text-slate-500 hover:text-rose-400 hover:border-rose-500 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
