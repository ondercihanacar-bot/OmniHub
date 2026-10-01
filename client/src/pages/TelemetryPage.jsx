import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  Activity, 
  RefreshCw, 
  Cpu, 
  ShieldCheck, 
  ShieldAlert, 
  Play, 
  Filter 
} from 'lucide-react';
import { api } from '../api';
import StatusBadge from '../components/StatusBadge';

export default function TelemetryPage({ onOpenSimulator }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadTelemetry();
  }, []);

  async function loadTelemetry() {
    setLoading(true);
    try {
      const res = await api.getDashboardStats();
      setLogs(res.stats?.recentHeartbeats || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = logs.filter((l) => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'active') return l.status_returned === 'active';
    if (filterStatus === 'suspended') return l.status_returned === 'suspended';
    if (filterStatus === 'hwid_mismatch') return l.status_returned === 'hwid_mismatch';
    if (filterStatus === 'expired') return l.status_returned === 'expired';
    return true;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Top Banner & Control */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Radio className="w-5 h-5 text-emerald-400 animate-pulse" />
            Canlı Telemetri ve Anti-Korsan Sinyal Akışı
          </h2>
          <p className="text-xs text-slate-400">
            OMNIFlow ve OmniSpot istemcilerinin merkezi doğrulama (heartbeat) denetimleri
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">Tüm Sinyaller</option>
            <option value="active">Başarılı (Aktif)</option>
            <option value="suspended">Engellenen (Dondurulmuş)</option>
            <option value="hwid_mismatch">Donanım Korsanlığı (HWID Mismatch)</option>
            <option value="expired">Süresi Dolanlar</option>
          </select>

          <button
            onClick={loadTelemetry}
            className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-cyan-400 transition-colors"
            title="Yenile"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => onOpenSimulator()}
            className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white rounded-lg text-xs font-bold shadow-[0_0_12px_rgba(16,185,129,0.3)] flex items-center gap-2"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Sinyal Testi Başlat</span>
          </button>
        </div>
      </div>

      {/* Telemetry Table */}
      <div className="cyber-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Tarih / Saat</th>
                <th className="py-3 px-4">Müşteri & Ürün</th>
                <th className="py-3 px-4">Lisans Anahtarı</th>
                <th className="py-3 px-4">Donanım Parmak İzi (HWID)</th>
                <th className="py-3 px-4">İstemci IP & Sürüm</th>
                <th className="py-3 px-4">Sistem Yükü (Cihaz/Kullanıcı)</th>
                <th className="py-3 px-4">Merkez Kararı</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-sans">
                    Telemetri günlüğü yükleniyor...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 font-sans">
                    Kayıtlı sinyal verisi bulunmuyor.
                  </td>
                </tr>
              ) : (
                filtered.map((log) => {
                  const isHwidMismatch = log.status_returned === 'hwid_mismatch';
                  const isSuspended = log.status_returned === 'suspended';
                  return (
                    <tr 
                      key={log.id} 
                      className={`hover:bg-slate-900/50 transition-colors ${
                        isHwidMismatch ? 'bg-rose-950/20' : isSuspended ? 'bg-amber-950/15' : ''
                      }`}
                    >
                      <td className="py-3 px-4 text-slate-300 text-[11px]">
                        {log.logged_at ? new Date(log.logged_at).toLocaleString('tr-TR') : '-'}
                      </td>

                      <td className="py-3 px-4 font-sans font-medium text-slate-200">
                        <div>{log.company_name || 'Bilinmeyen Müşteri'}</div>
                        <span className="text-[10px] text-cyan-400 font-mono">{log.product_name || 'OMNI'}</span>
                      </td>

                      <td className="py-3 px-4 text-cyan-300 font-bold tracking-wider">
                        {log.license_key}
                      </td>

                      <td className="py-3 px-4 text-slate-400 truncate max-w-[150px]" title={log.hardware_id}>
                        {log.hardware_id ? (
                          <div className="flex items-center gap-1">
                            <Cpu className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                            <span>{log.hardware_id}</span>
                          </div>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-slate-300">
                        <div>{log.ip_address || '127.0.0.1'}</div>
                        <span className="text-[10px] text-slate-500">v{log.client_version || '1.0.0'}</span>
                      </td>

                      <td className="py-3 px-4 text-slate-300 font-sans">
                        <span className="font-semibold text-white">{log.device_count || 0}</span> Cihaz /{' '}
                        <span className="font-semibold text-white">{log.active_users || 0}</span> User
                      </td>

                      <td className="py-3 px-4 font-sans">
                        {isHwidMismatch ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-rose-950 border border-rose-500 text-rose-300 text-xs font-bold shadow-[0_0_10px_rgba(244,63,94,0.3)]">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            HWID Uyuşmazlığı
                          </span>
                        ) : (
                          <StatusBadge status={log.status_returned} size="sm" />
                        )}
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
