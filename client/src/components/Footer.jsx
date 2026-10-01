import React from 'react';
import { ShieldCheck, Server, Lock } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-800/80 bg-slate-950/90 px-6 py-4 text-xs text-slate-400">
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-cyan-400 font-mono text-[11px]">
            <ShieldCheck className="w-4 h-4" />
            <span>OmniHub Enterprise Core</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <Server className="w-3.5 h-3.5 text-blue-400" />
            <span>AES-256 / HMAC-SHA256 Mühürlü</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1.5 text-emerald-400 text-[11px]">
            <Lock className="w-3.5 h-3.5" />
            <span>HWID Kilit Algoritması Aktif</span>
          </div>
        </div>

        {/* Permanent Developer Signature */}
        <div className="text-center md:text-right">
          <p className="text-slate-400 font-medium tracking-wide">
            Designed & Developed by <span className="text-cyan-400 font-semibold">Önder Cihan ACAR</span> © 2026. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
