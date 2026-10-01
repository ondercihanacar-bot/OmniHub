import React, { useState } from 'react';
import { X, Play, Radio, CheckCircle, AlertTriangle, ShieldAlert, Cpu } from 'lucide-react';
import { api } from '../api';

export default function HeartbeatSimulatorModal({ isOpen, onClose, defaultKey = '' }) {
  const [licenseKey, setLicenseKey] = useState(defaultKey);
  const [hardwareId, setHardwareId] = useState('CPU-BFEBFBFF-MB-CZC74966Q9');
  const [clientVersion, setClientVersion] = useState('2.4.0');
  const [deviceCount, setDeviceCount] = useState(42);
  const [activeUsers, setActiveUsers] = useState(128);
  const [actionType, setActionType] = useState('heartbeat'); // 'heartbeat' | 'activate'
  
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

  if (!isOpen) return null;

  const handleSimulate = async (e) => {
    e.preventDefault();
    if (!licenseKey) {
      alert('Lütfen bir lisans anahtarı giriniz.');
      return;
    }

    setLoading(true);
    setResponse(null);
    try {
      let res;
      if (actionType === 'activate') {
        res = await api.simulateActivate({
          license_key: licenseKey.trim(),
          hardware_id: hardwareId.trim(),
          client_version: clientVersion
        });
      } else {
        res = await api.simulateHeartbeat({
          license_key: licenseKey.trim(),
          hardware_id: hardwareId.trim(),
          client_version: clientVersion,
          device_count: parseInt(deviceCount, 10),
          active_users: parseInt(activeUsers, 10),
          uptime_seconds: 86400
        });
      }
      setResponse(res);
    } catch (err) {
      setResponse({ valid: false, error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden my-6">
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-400">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">
                OmniFlow & OmniSpot İstemci Sinyal Testi
              </h3>
              <p className="text-xs text-slate-400">Heartbeat & Aktivasyon API Simülasyonu</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSimulate} className="p-6 space-y-4">
          <div className="flex gap-2 p-1 bg-slate-950 rounded-lg border border-slate-800">
            <button
              type="button"
              onClick={() => setActionType('heartbeat')}
              className={`flex-1 py-1.5 rounded text-xs font-semibold transition-all ${
                actionType === 'heartbeat'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Periyodik Heartbeat (Sinyal)
            </button>
            <button
              type="button"
              onClick={() => setActionType('activate')}
              className={`flex-1 py-1.5 rounded text-xs font-semibold transition-all ${
                actionType === 'activate'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              İlk Aktivasyon (Donanım Kilitleme)
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Lisans Anahtarı
            </label>
            <input
              type="text"
              required
              value={licenseKey}
              onChange={(e) => setLicenseKey(e.target.value)}
              placeholder="Örn: OMNI-FLW-XXXX-XXXX-XXXX"
              className="w-full bg-slate-950 border border-slate-700 font-mono text-xs rounded-lg px-3 py-2 text-cyan-300 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
              <span>İstemci Donanım Kimliği (HWID)</span>
              <span className="text-[10px] text-slate-500 font-normal">CPU/Motherboard UUID</span>
            </label>
            <input
              type="text"
              value={hardwareId}
              onChange={(e) => setHardwareId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 font-mono text-xs rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Sürüm</label>
              <input
                type="text"
                value={clientVersion}
                onChange={(e) => setClientVersion(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg px-3 py-2 text-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Cihaz Sayısı</label>
              <input
                type="number"
                value={deviceCount}
                onChange={(e) => setDeviceCount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg px-3 py-2 text-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Aktif User</label>
              <input
                type="number"
                value={activeUsers}
                onChange={(e) => setActiveUsers(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg px-3 py-2 text-slate-200"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white rounded-lg text-xs font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4" />
            <span>{loading ? 'Sinyal İletiliyor...' : 'Sinyali Gönder (Simüle Et)'}</span>
          </button>

          {/* Response Inspector */}
          {response && (
            <div className={`mt-4 p-4 rounded-xl border text-xs font-mono space-y-2 ${
              response.valid
                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                : 'bg-rose-950/40 border-rose-500/50 text-rose-300'
            }`}>
              <div className="flex items-center gap-2 font-bold text-sm">
                {response.valid ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    <span>LİSANS GEÇERLİ - SİSTEM AKTİF</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-5 h-5 text-rose-400" />
                    <span>ERİŞİM ENGELLENDİ: {response.status?.toUpperCase() || 'HATA'}</span>
                  </>
                )}
              </div>

              {response.error && (
                <div className="p-2 bg-rose-900/40 rounded border border-rose-800 text-rose-200">
                  {response.error}
                </div>
              )}

              {response.message && (
                <div className="text-slate-300">{response.message}</div>
              )}

              <pre className="p-2 bg-black/60 rounded text-[11px] text-slate-300 overflow-x-auto max-h-40">
                {JSON.stringify(response, null, 2)}
              </pre>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
