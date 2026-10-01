import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Key, 
  Radio, 
  Layers, 
  Sliders, 
  LogOut, 
  ShieldCheck, 
  Cpu, 
  Clock, 
  PlayCircle
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, onLogout, user, onOpenGenerator, onOpenSimulator }) {
  const menuItems = [
    { id: 'dashboard', label: 'Genel Bakış', icon: LayoutDashboard },
    { id: 'licenses', label: 'Lisans Yönetimi', icon: Key },
    { id: 'customers', label: 'Müşteri CRM', icon: Users },
    { id: 'renewals', label: 'Yenileme Radarı', icon: Clock, badge: 'Süreler' },
    { id: 'telemetry', label: 'Canlı Telemetri', icon: Radio },
    { id: 'products', label: 'Ürün & Modüller', icon: Layers },
    { id: 'settings', label: 'Sistem & Güvenlik', icon: Sliders }
  ];

  return (
    <aside className="w-64 bg-slate-950/95 border-r border-slate-800 flex flex-col justify-between h-screen sticky top-0 select-none z-30">
      {/* Top Header & Brand */}
      <div>
        {/* Beveled Logo Brand Header */}
        <div className="p-4 border-b border-slate-800/80 bg-gradient-to-b from-slate-900/60 to-transparent">
          <div className="flex items-center gap-3">
            {/* Beveled Logo Frame */}
            <div className="relative p-2.5 bg-gradient-to-br from-cyan-500/20 via-blue-600/30 to-emerald-500/20 border border-cyan-500/40 rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <ShieldCheck className="w-6 h-6 text-cyan-400" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-emerald-400 font-mono">
                  OMNIHUB
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 font-mono">
                  v1.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium tracking-tight">
                Merkezi Dağıtıcı Portalı
              </p>
            </div>
          </div>
        </div>

        {/* Action Button: Quick Generate */}
        <div className="p-3">
          <button
            onClick={onOpenGenerator}
            className="w-full py-2.5 px-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg font-semibold text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.35)] transition-all hover:scale-[1.02] active:scale-[0.98] border border-cyan-400/30"
          >
            <Key className="w-4 h-4 text-cyan-200" />
            <span>YENİ LİSANS ÜRET</span>
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="px-3 py-2 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-950/80 to-blue-950/40 text-cyan-300 border-l-4 border-cyan-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950/70 border border-amber-600/40 text-amber-400 font-mono">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom User Profile & Developer Signature Footer */}
      <div className="border-t border-slate-800/80 bg-slate-950">
        {/* Heartbeat simulator quick launcher */}
        <div className="px-3 pt-3">
          <button
            onClick={onOpenSimulator}
            className="w-full py-1.5 px-2 bg-slate-900 hover:bg-slate-850 border border-slate-700/70 rounded text-[11px] text-slate-300 flex items-center justify-center gap-1.5 transition-colors"
          >
            <PlayCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sinyal Simülatörü (Test)</span>
          </button>
        </div>

        {/* User bar */}
        <div className="p-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-cyan-950 border border-cyan-600/40 flex items-center justify-center text-cyan-400 font-bold text-xs">
              ÖC
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-slate-200 truncate">{user?.name || 'Önder Cihan ACAR'}</p>
              <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Root Authority
              </p>
            </div>
          </div>

          <button
            onClick={onLogout}
            title="Güvenli Çıkış"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-md transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* PERMANENT DEVELOPER SIGNATURE FOOTER (Rule 1 in GEMINI.md) */}
        <div className="p-2.5 border-t border-slate-800/60 bg-black/40 text-center">
          <p className="text-[10px] text-slate-400 leading-tight tracking-wide font-sans">
            Designed & Developed by <br />
            <span className="text-cyan-400 font-semibold">Önder Cihan ACAR</span> © 2026. <br />
            <span className="text-slate-400">All Rights Reserved.</span>
          </p>
        </div>
      </div>
    </aside>
  );
}
