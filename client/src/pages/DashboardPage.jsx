import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Key, 
  PauseCircle, 
  AlertTriangle, 
  Sparkles, 
  Radio, 
  Clock, 
  ArrowRight, 
  ShieldCheck, 
  Activity, 
  MessageSquare,
  Cpu
} from 'lucide-react';
import { api } from '../api';
import StatusBadge from '../components/StatusBadge';

export default function DashboardPage({ onNavigate, onOpenGenerator, onOpenCertificate, onOpenRenew }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    setLoading(true);
    try {
      const res = await api.getDashboardStats();
      setStats(res.stats);
    } catch (err) {
      console.error('Dashboard load failed:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading || !stats) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center gap-3">
          <Activity className="w-8 h-8 text-cyan-400 animate-spin" />
          <p className="text-xs text-slate-400 font-mono">Telemetri ve Lisans Verileri Yükleniyor...</p>
        </div>
      </div>
    );
  }

  const { customers, licenses, productStats, upcomingRenewals, recentHeartbeats } = stats;

  return (
    <div className="p-6 space-y-6">
      {/* 1. TOP STATS ROW */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Total Customers */}
        <div 
          onClick={() => onNavigate('customers')}
          className="cyber-card p-4 rounded-xl cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Kayıtlı Müşteri</span>
            <Users className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-white font-mono">{customers}</div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span>CRM Rehberi</span>
            <ArrowRight className="w-3 h-3 text-cyan-400" />
          </p>
        </div>

        {/* Active Licenses */}
        <div 
          onClick={() => onNavigate('licenses', { status: 'active' })}
          className="cyber-card p-4 rounded-xl cursor-pointer group border-emerald-900/40 hover:border-emerald-500/50"
        >
          <div className="flex items-center justify-between text-emerald-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Aktif Lisanslar</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-emerald-300 font-mono">{licenses.active}</div>
          <p className="text-[11px] text-emerald-400/80 mt-1">
            Toplam {licenses.total} lisans içinde
          </p>
        </div>

        {/* Suspended Licenses */}
        <div 
          onClick={() => onNavigate('licenses', { status: 'suspended' })}
          className="cyber-card p-4 rounded-xl cursor-pointer group border-amber-900/40 hover:border-amber-500/50"
        >
          <div className="flex items-center justify-between text-amber-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Dondurulanlar</span>
            <PauseCircle className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-amber-300 font-mono">{licenses.suspended}</div>
          <p className="text-[11px] text-amber-400/80 mt-1">
            Uzaktan sinyali kesildi
          </p>
        </div>

        {/* Expired Licenses */}
        <div 
          onClick={() => onNavigate('licenses', { status: 'expired' })}
          className="cyber-card p-4 rounded-xl cursor-pointer group border-rose-900/40 hover:border-rose-500/50"
        >
          <div className="flex items-center justify-between text-rose-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Süresi Dolan</span>
            <AlertTriangle className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-rose-300 font-mono">{licenses.expired}</div>
          <p className="text-[11px] text-rose-400/80 mt-1">
            Yenileme bekleniyor
          </p>
        </div>

        {/* Demo Licenses */}
        <div 
          onClick={() => onNavigate('licenses', { status: 'demo' })}
          className="cyber-card p-4 rounded-xl cursor-pointer group border-cyan-900/40 hover:border-cyan-500/50"
        >
          <div className="flex items-center justify-between text-cyan-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Demo / Deneme</span>
            <Sparkles className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-cyan-300 font-mono">{licenses.demo}</div>
          <p className="text-[11px] text-cyan-400/80 mt-1">
            Satış potansiyeli
          </p>
        </div>
      </div>

      {/* 2. MIDDLE ROW: RENEWAL RADAR & PRODUCT BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Renewal Radar (2 Cols) */}
        <div className="lg:col-span-2 cyber-card p-5 rounded-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-amber-950/70 border border-amber-600/40 text-amber-400">
                  <Clock className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide">
                    Lisans Yenileme Radarı (Yaklaşan 30 Gün)
                  </h3>
                  <p className="text-xs text-slate-400">Süresi dolacak kurumsal müşteriler</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('renewals')}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
              >
                Tümünü Gör ({upcomingRenewals.length})
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-4 divide-y divide-slate-800/80">
              {upcomingRenewals.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  Önümüzdeki 30 gün içinde süresi dolacak lisans bulunmuyor.
                </div>
              ) : (
                upcomingRenewals.slice(0, 4).map((r) => (
                  <div key={r.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white truncate">
                          {r.company_name}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-400">
                          {r.product_name}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 truncate mt-0.5 font-mono">
                        {r.license_key} • Yetkili: {r.contact_name} ({r.customer_phone || 'Tel yok'})
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className={`text-xs font-bold font-mono px-2.5 py-1 rounded-md border ${
                          r.urgency === 'critical'
                            ? 'bg-rose-950/80 border-rose-500 text-rose-300 animate-pulse'
                            : r.urgency === 'warning'
                            ? 'bg-amber-950/80 border-amber-500 text-amber-300'
                            : 'bg-blue-950/80 border-blue-500 text-blue-300'
                        }`}>
                          {r.days_left === 0 ? 'Bugün Bitiyor!' : `${r.days_left} Gün Kaldı`}
                        </span>
                        <span className="block text-[10px] text-slate-500 mt-1">{r.end_date}</span>
                      </div>

                      <button
                        onClick={() => onOpenRenew(r)}
                        className="px-3 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-300 border border-cyan-500/40 text-xs font-semibold transition-colors"
                      >
                        Uzat
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Product Matrix Breakdown (1 Col) */}
        <div className="cyber-card p-5 rounded-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-800">
              <div className="p-2 rounded-lg bg-cyan-950/70 border border-cyan-600/40 text-cyan-400">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide">Ürün Matrisi Dağılımı</h3>
                <p className="text-xs text-slate-400">OMNIFlow & OmniSpot aktif portföy</p>
              </div>
            </div>

            <div className="mt-4 space-y-4">
              {productStats.map((p) => {
                const total = licenses.total || 1;
                const percent = Math.round((p.total_count / total) * 100);
                return (
                  <div key={p.id} className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-200">{p.name}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-400">
                          {p.code}
                        </span>
                      </div>
                      <span className="text-xs font-mono text-cyan-400 font-bold">{p.total_count} Lisans</span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${p.id === 'omniflow' ? 'bg-cyan-500' : 'bg-emerald-500'}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 font-mono">
                      <span>Aktif: <strong className="text-emerald-400">{p.active_count}</strong></span>
                      <span>Demo: <strong className="text-cyan-400">{p.demo_count}</strong></span>
                      <span>Oran: %{percent}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80">
            <button
              onClick={onOpenGenerator}
              className="w-full py-2 bg-slate-900 hover:bg-slate-850 border border-slate-700 rounded-lg text-xs font-semibold text-slate-200 flex items-center justify-center gap-1.5"
            >
              <Key className="w-3.5 h-3.5 text-cyan-400" />
              <span>Yeni Lisans Oluştur</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. BOTTOM ROW: LIVE HEARTBEAT TELEMETRY STREAM */}
      <div className="cyber-card p-5 rounded-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-950/70 border border-emerald-600/40 text-emerald-400">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                Canlı Telemetri & Heartbeat Akışı
              </h3>
              <p className="text-xs text-slate-400">İstemci sunucularından merkeze ulaşan son sinyaller</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('telemetry')}
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
          >
            Tüm Logları Gör
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="pb-2">Zaman</th>
                <th className="pb-2">Müşteri & Ürün</th>
                <th className="pb-2">Lisans Anahtarı</th>
                <th className="pb-2">IP Adresi</th>
                <th className="pb-2">HWID (Donanım)</th>
                <th className="pb-2">Yük / Metrik</th>
                <th className="pb-2 text-right">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {recentHeartbeats.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-500 font-sans">
                    Henüz telemetri sinyali alınmadı. İstemci simülatörünü kullanarak test sinyali gönderebilirsiniz.
                  </td>
                </tr>
              ) : (
                recentHeartbeats.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-2.5 text-slate-400 text-[11px]">
                      {h.logged_at ? new Date(h.logged_at).toLocaleTimeString('tr-TR') : '-'}
                    </td>
                    <td className="py-2.5 font-sans font-medium text-slate-200">
                      <div>{h.company_name || 'Bilinmeyen'}</div>
                      <span className="text-[10px] text-cyan-400 font-mono">{h.product_name}</span>
                    </td>
                    <td className="py-2.5 text-slate-300">{h.license_key}</td>
                    <td className="py-2.5 text-slate-400">{h.ip_address || '127.0.0.1'}</td>
                    <td className="py-2.5 text-slate-400 truncate max-w-[140px]" title={h.hardware_id}>
                      {h.hardware_id ? `${h.hardware_id.slice(0, 16)}...` : '-'}
                    </td>
                    <td className="py-2.5 text-slate-300 font-sans text-[11px]">
                      {h.device_count} Cihaz / {h.active_users} User
                    </td>
                    <td className="py-2.5 text-right font-sans">
                      <StatusBadge status={h.status_returned} size="sm" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
