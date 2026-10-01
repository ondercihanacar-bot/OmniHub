import React, { useState, useEffect } from 'react';
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
  Cpu
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
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialFilters.status || '');
  const [productFilter, setProductFilter] = useState(initialFilters.product_id || '');
  const [copiedKey, setCopiedKey] = useState(null);

  useEffect(() => {
    loadLicenses();
  }, [statusFilter, productFilter]);

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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadLicenses();
  };

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

  return (
    <div className="p-6 space-y-6">
      {/* Top Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Lisans anahtarı, müşteri veya donanım ara..."
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
        </form>

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
            onClick={onOpenGenerator}
            className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-xs font-bold shadow-[0_0_12px_rgba(6,182,212,0.3)] flex items-center gap-2 transition-all hover:scale-[1.02]"
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
              ) : licenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    Arama kriterlerine uygun lisans bulunamadı.
                  </td>
                </tr>
              ) : (
                licenses.map((lic) => {
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
                            onClick={() => copyKey(lic.license_key)}
                            title="Anahtarı Kopyala"
                            className="text-slate-400 hover:text-cyan-300 p-0.5"
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

                      {/* Customer */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-200">
                          {lic.company_name}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {lic.contact_name} {lic.customer_city ? `• ${lic.customer_city}` : ''}
                        </div>
                      </td>

                      {/* Type & Expiry */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-300 capitalize">
                          {lic.license_type === 'yearly' && '1 Yıllık'}
                          {lic.license_type === '2year' && '2 Yıllık'}
                          {lic.license_type === '3year' && '3 Yıllık'}
                          {lic.license_type === 'monthly' && 'Aylık'}
                          {lic.license_type === 'lifetime' && 'Süresiz'}
                          {lic.license_type === 'demo' && 'Demo'}
                        </div>
                        <div className="text-[11px] font-mono mt-0.5">
                          {lic.end_date ? (
                            <span className={lic.days_remaining !== null && lic.days_remaining <= 15 ? 'text-amber-400 font-bold' : 'text-slate-400'}>
                              {lic.end_date} ({lic.days_remaining} gün)
                            </span>
                          ) : (
                            <span className="text-emerald-400">Ömür Boyu</span>
                          )}
                        </div>
                      </td>

                      {/* Quotas & Modules */}
                      <td className="py-3 px-4">
                        <div className="font-mono text-slate-300">
                          {lic.max_devices} Cihaz / {lic.max_users} Kullanıcı
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5 truncate max-w-xs" title={(lic.enabled_modules || []).join(', ')}>
                          {lic.enabled_modules?.length || 0} Aktif Modül
                        </div>
                      </td>

                      {/* HWID Hardware Lock */}
                      <td className="py-3 px-4 font-mono text-[11px]">
                        {lic.hardware_id ? (
                          <div className="flex items-center gap-1.5">
                            <Cpu className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                            <span className="text-slate-300 truncate max-w-[120px]" title={lic.hardware_id}>
                              {lic.hardware_id}
                            </span>
                            <button
                              onClick={() => handleResetHwid(lic)}
                              title="Donanım Kilidini Sıfırla (HWID Reset)"
                              className="text-slate-400 hover:text-amber-400 p-0.5"
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
                            onClick={() => handleToggleFreeze(lic)}
                            title={lic.status === 'suspended' ? 'Lisansı Yeniden Aktifleştir' : 'Uzaktan Lisansı Dondur (Askıya Al)'}
                            className={`p-1.5 rounded-md border transition-colors ${
                              lic.status === 'suspended'
                                ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300 hover:bg-emerald-900'
                                : 'bg-amber-950/80 border-amber-600 text-amber-300 hover:bg-amber-900'
                            }`}
                          >
                            {lic.status === 'suspended' ? <PlayCircle className="w-4 h-4" /> : <PauseCircle className="w-4 h-4" />}
                          </button>

                          {/* Renew / Extend */}
                          <button
                            onClick={() => onOpenRenew(lic)}
                            title="Süre Uzat / Yenile"
                            className="p-1.5 rounded-md bg-slate-900 border border-slate-700 text-slate-300 hover:text-cyan-400 hover:border-cyan-500 transition-colors"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>

                          {/* Certificate */}
                          <button
                            onClick={() => onOpenCertificate(lic)}
                            title="A4 Resmi Sertifika Görüntüle / Yazdır"
                            className="p-1.5 rounded-md bg-slate-900 border border-slate-700 text-slate-300 hover:text-cyan-400 hover:border-cyan-500 transition-colors"
                          >
                            <Award className="w-4 h-4" />
                          </button>

                          {/* Download Offline Blob */}
                          <button
                            onClick={() => handleDownloadBlob(lic)}
                            title=".omnilicense Dosyasını İndir"
                            className="p-1.5 rounded-md bg-slate-900 border border-slate-700 text-slate-300 hover:text-cyan-400 hover:border-cyan-500 transition-colors"
                          >
                            <Download className="w-4 h-4" />
                          </button>

                          {/* Test Signal */}
                          <button
                            onClick={() => onOpenSimulator(lic.license_key)}
                            title="İstemci Sinyal Testi (Simülatör)"
                            className="p-1.5 rounded-md bg-slate-900 border border-slate-700 text-slate-300 hover:text-emerald-400 transition-colors"
                          >
                            <Radio className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(lic)}
                            title="Lisansı Sil"
                            className="p-1.5 rounded-md bg-slate-900 border border-slate-700 text-slate-500 hover:text-rose-400 hover:border-rose-500 transition-colors"
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
