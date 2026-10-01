import React, { useState } from 'react';
import { ShieldCheck, Lock, User, ArrowRight, Activity, Radio, Key } from 'lucide-react';
import { api, setAuthToken, setCurrentUser } from '../api';

export default function LoginPage({ onLoginSuccess }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await api.login({ username, password });
      setAuthToken(res.token);
      setCurrentUser(res.user);
      onLoginSuccess(res.user);
    } catch (err) {
      setError(err.message || 'Giriş başarısız. Kullanıcı adı veya şifre hatalı.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#030712] cyber-grid flex flex-col items-center justify-between p-6 select-none relative overflow-hidden">
      {/* Background Neon Glowing Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Brand Banner */}
      <div className="pt-8 text-center relative z-10">
        {/* Beveled Logo */}
        <div className="inline-flex p-3 bg-gradient-to-br from-cyan-500/20 via-blue-600/30 to-emerald-500/20 border border-cyan-500/40 rounded-2xl shadow-[0_0_25px_rgba(6,182,212,0.35)] mb-3">
          <ShieldCheck className="w-10 h-10 text-cyan-400" />
        </div>
        <h1 className="text-3xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-emerald-400 font-mono">
          OMNIHUB
        </h1>
        <p className="text-xs uppercase tracking-wider text-slate-400 mt-1 font-semibold">
          Merkezi Dağıtıcı ve Lisans Yönetim Portalı
        </p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md relative z-10 my-auto">
        <div className="cyber-card p-8 rounded-2xl border border-slate-700/80 shadow-[0_0_40px_rgba(0,0,0,0.8)] backdrop-blur-xl">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-white tracking-wide">Yönetici Girişi</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              OMNIFlow & OmniSpot dağıtıcı kontrol paneline erişin
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-950/80 border border-rose-500/50 rounded-lg text-xs text-rose-300 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-cyan-400" />
                Yönetici Kullanıcı Adı
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-cyan-400" />
                Parola
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-lg shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>{loading ? 'Giriş Doğrulanıyor...' : 'GÜVENLİ GİRİŞ YAP'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Quick Demo Credentials hint */}
          <div className="mt-6 pt-4 border-t border-slate-800 text-center">
            <span className="text-[11px] text-slate-500 font-mono">
              Varsayılan Giriş: <strong>admin</strong> / <strong>admin123</strong>
            </span>
          </div>
        </div>
      </div>

      {/* MANDATORY AUTH FOOTER DEVELOPER SIGNATURE (Rule 1 in GEMINI.md) */}
      <div className="text-center py-4 relative z-10">
        <p className="text-xs text-slate-400 tracking-wide font-sans">
          Designed & Developed by <span className="text-cyan-400 font-semibold">Önder Cihan ACAR</span> © 2026. All Rights Reserved.
        </p>
      </div>
    </div>
  );
}
