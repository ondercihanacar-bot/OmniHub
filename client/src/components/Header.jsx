import React from 'react';
import { RefreshCw, Key, LogOut, ShieldCheck, Activity } from 'lucide-react';
import OmniHubLogo from './OmniHubLogo';

/**
 * Top Navigation Bar (Header)
 * Kullanıcının ilettiği örnek ekran görüntüsündeki gibi (OmniSpot tarzı):
 * Sol tarafta video logo kartı + ADMIN CONSOLE v1.0 rozeti,
 * Ortada canlı telemetri/durum widget'ı, sağ tarafta hızlı eylemler ve kullanıcı paneli yer alır.
 */
export default function Header({
  title,
  subtitle,
  onRefresh,
  isRefreshing,
  onOpenGenerator,
  user,
  onLogout
}) {
  return (
    <header className="bg-slate-900/90 border-b border-slate-800/80 backdrop-blur-xl px-4 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between sticky top-0 z-30 shadow-lg select-none">
      {/* Sol: Örnek resimdeki gibi Logo Kartı + ADMIN CONSOLE v1.0 Rozeti */}
      <div className="flex items-center gap-2 sm:gap-4">
        <OmniHubLogo size="admin" />
        <span className="hidden md:inline-flex items-center px-3 py-1 rounded-full bg-blue-950/90 border border-blue-700/60 text-[11px] font-mono font-semibold text-cyan-300 shadow-sm ml-1 sm:ml-2">
          ADMIN CONSOLE v1.0
        </span>
      </div>

      {/* Orta: Aktif Sayfa & Port Durum Bilgisi */}
      <div className="hidden lg:flex items-center gap-3 bg-slate-950/60 border border-slate-800 rounded-full px-4 py-1.5 text-xs font-mono">
        <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Merkez: Port 5200 (Online)</span>
        </div>
        <span className="text-slate-600">|</span>
        <span className="text-slate-300 font-sans font-medium">{title}</span>
      </div>

      {/* Sağ: Eylemler & Kullanıcı Bilgisi */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Verileri Yenile Butonu */}
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40 transition-colors cursor-pointer"
            title="Verileri Yenile"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        )}

        {/* Yeni Lisans Üret Hızlı Butonu */}
        <button
          type="button"
          onClick={onOpenGenerator}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-[0_0_12px_rgba(6,182,212,0.3)] transition-all cursor-pointer"
        >
          <Key className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Yeni Lisans Üret</span>
        </button>

        {/* Kullanıcı Profili ve Güvenli Çıkış */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-semibold text-white leading-tight">{user?.name || 'Önder Cihan ACAR'}</span>
            <span className="text-[10px] text-cyan-400 font-mono">Root Authority</span>
          </div>
          <button
            type="button"
            onClick={onLogout}
            title="Güvenli Çıkış"
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-xl border border-transparent hover:border-rose-800/50 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
