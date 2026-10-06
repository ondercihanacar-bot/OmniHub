import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Key, 
  Radio, 
  Layers, 
  Sliders, 
  Clock, 
  PlayCircle
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, onOpenGenerator, onOpenSimulator }) {
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
    <aside className="w-full md:w-64 bg-slate-900/60 border-r border-slate-800/80 p-3 flex md:flex-col justify-between shrink-0 select-none overflow-y-auto">
      {/* Navigation Menu (Kullanıcı ekran görüntüsündeki gibi Genel Bakış ile başlar) */}
      <div className="space-y-1 w-full">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950/70 border border-amber-600/40 text-amber-400 font-mono">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Alt Alan: Test Simülatörü & Kalıcı Geliştirici Telif İmzası */}
      <div className="pt-4 border-t border-slate-800/60 mt-4 space-y-3">
        {/* Heartbeat Sinyal Simülatörü Butonu */}
        <button
          type="button"
          onClick={onOpenSimulator}
          className="w-full py-2 px-2.5 bg-slate-950/80 hover:bg-slate-800 border border-slate-800 rounded-xl text-[11px] text-slate-400 hover:text-cyan-300 flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <PlayCircle className="w-3.5 h-3.5 text-emerald-400" />
          <span>Sinyal Simülatörü (Test)</span>
        </button>

        {/* PERMANENT DEVELOPER SIGNATURE (Rule 1 in GEMINI.md) */}
        <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/70 text-center">
          <p className="text-[10px] text-slate-400 leading-tight tracking-wide font-sans">
            Designed & Developed by <br />
            <span className="text-cyan-400 font-semibold">Önder Cihan ACAR</span> © 2026. <br />
            <span className="text-slate-500">All Rights Reserved.</span>
          </p>
        </div>
      </div>
    </aside>
  );
}
