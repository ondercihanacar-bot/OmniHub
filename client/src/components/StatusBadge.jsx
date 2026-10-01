import React from 'react';
import { CheckCircle2, PauseCircle, AlertTriangle, Sparkles, XCircle } from 'lucide-react';

export default function StatusBadge({ status, size = 'md' }) {
  const norm = (status || '').toLowerCase();

  const configs = {
    active: {
      label: 'Aktif',
      bg: 'bg-emerald-950/80',
      border: 'border-emerald-500/50',
      text: 'text-emerald-400',
      dot: 'bg-emerald-400 animate-pulse',
      icon: CheckCircle2,
      shadow: 'shadow-[0_0_12px_rgba(16,185,129,0.25)]'
    },
    suspended: {
      label: 'Donduruldu',
      bg: 'bg-amber-950/80',
      border: 'border-amber-500/50',
      text: 'text-amber-400',
      dot: 'bg-amber-400',
      icon: PauseCircle,
      shadow: 'shadow-[0_0_12px_rgba(245,158,11,0.25)]'
    },
    expired: {
      label: 'Süresi Doldu',
      bg: 'bg-rose-950/80',
      border: 'border-rose-500/50',
      text: 'text-rose-400',
      dot: 'bg-rose-400',
      icon: AlertTriangle,
      shadow: 'shadow-[0_0_12px_rgba(244,63,94,0.25)]'
    },
    demo: {
      label: 'Demo',
      bg: 'bg-cyan-950/80',
      border: 'border-cyan-500/50',
      text: 'text-cyan-400',
      dot: 'bg-cyan-400',
      icon: Sparkles,
      shadow: 'shadow-[0_0_12px_rgba(6,182,212,0.25)]'
    },
    revoked: {
      label: 'İptal / Fesih',
      bg: 'bg-slate-900',
      border: 'border-slate-700',
      text: 'text-slate-400',
      dot: 'bg-slate-500',
      icon: XCircle,
      shadow: ''
    }
  };

  const cfg = configs[norm] || configs.active;
  const Icon = cfg.icon;

  const sizeClasses = size === 'sm' 
    ? 'px-2 py-0.5 text-xs gap-1' 
    : 'px-2.5 py-1 text-xs gap-1.5 font-medium tracking-wide';

  return (
    <span className={`inline-flex items-center rounded-md border ${cfg.bg} ${cfg.border} ${cfg.text} ${cfg.shadow} ${sizeClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      <Icon className="w-3.5 h-3.5" />
      <span>{cfg.label}</span>
    </span>
  );
}
