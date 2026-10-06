import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Lock, User, ArrowRight, Volume2, VolumeX, Shield, Server, Key } from 'lucide-react';
import { api, setAuthToken, setCurrentUser } from '../api';

/**
 * LoginPage
 * Tam ekran (100% Fullscreen) ve kenarlıksız hareketli/sesli OmniHub logosu.
 * Video sağa hizalanmış ve sol tarafa yumuşak siber degrade eklenmiştir;
 * böylece logo kullanıcı giriş formuna taşmaz, hem form hem logo %100 net ve ferah görünür.
 */
export default function LoginPage({ onLoginSuccess }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isMuted, setIsMuted] = useState(false);

  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Sesi ve videoyu başlatmayı dene
    video.muted = false;
    video.volume = 0.7;

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Tarayıcının otomatik ses engeline takılırsa, ilk etkileşimde sesi aç
        video.muted = true;
        setIsMuted(true);
        video.play().catch(() => {});

        const enableAudioOnInteraction = () => {
          if (videoRef.current) {
            videoRef.current.muted = false;
            setIsMuted(false);
          }
          window.removeEventListener('click', enableAudioOnInteraction);
          window.removeEventListener('keydown', enableAudioOnInteraction);
          window.removeEventListener('touchstart', enableAudioOnInteraction);
        };

        window.addEventListener('click', enableAudioOnInteraction);
        window.addEventListener('keydown', enableAudioOnInteraction);
        window.addEventListener('touchstart', enableAudioOnInteraction);
      });
    }
  }, []);

  const toggleSound = () => {
    const video = videoRef.current;
    if (video) {
      const nextMuted = !video.muted;
      video.muted = nextMuted;
      setIsMuted(nextMuted);
    }
  };

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
    <div className="relative min-h-screen min-h-[100dvh] w-screen max-w-full text-slate-100 flex flex-col justify-between overflow-x-hidden select-none bg-[#020617]">
      
      {/* 1. TAM EKRAN KENARLIKSIZ VİDEO (Sağa Hizalı & Formun Önünü Kapatmaz) */}
      <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0 bg-[#020617]">
        <video
          ref={videoRef}
          src="/giris_arkaplan.mp4"
          autoPlay
          loop
          playsInline
          className="w-full h-full object-cover object-[75%_center] lg:object-[80%_center] select-none pointer-events-none"
        />
        {/* Sol tarafta formun rahat okunmasını sağlayan ve logoyu kesmeyen yumuşak siber geçiş */}
        <div className="absolute inset-y-0 left-0 w-full sm:w-[500px] lg:w-[650px] bg-gradient-to-r from-[#020617]/95 via-[#020617]/75 to-transparent pointer-events-none" />
      </div>

      {/* 2. Üst Bilgi Barı (Kenarlıksız & Şeffaf) */}
      <header className="py-3.5 sm:py-4 px-4 sm:px-8 lg:px-12 flex items-center justify-between z-20 w-full shrink-0 bg-transparent">
        <div className="flex items-center gap-2.5">
          <span className="text-sm sm:text-base font-mono font-bold text-cyan-400 tracking-wider drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
            OMNIHUB
          </span>
          <span className="text-[9px] sm:text-[10px] px-2.5 py-0.5 rounded-full bg-slate-950/70 border border-cyan-500/30 text-cyan-300 font-mono backdrop-blur-md shadow-md">
            Merkezi Portal
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Ses Açma / Kapatma Butonu */}
          <button
            type="button"
            onClick={toggleSound}
            title={isMuted ? 'Sesi Aç' : 'Sesi Kapat'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-950/70 hover:bg-slate-900 border border-cyan-500/30 text-cyan-300 text-[11px] sm:text-xs font-mono backdrop-blur-md transition-all shadow-lg cursor-pointer"
          >
            {isMuted ? (
              <>
                <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400" />
                <span className="text-[10px] sm:text-[11px] text-rose-300 font-medium">Ses Kapalı</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 animate-pulse" />
                <span className="text-[10px] sm:text-[11px] text-emerald-300 font-medium">Ses Açık</span>
              </>
            )}
          </button>

          {/* Port 5200 Online Rozeti */}
          <div className="hidden xs:flex items-center gap-1.5 text-[10px] sm:text-[11px] font-mono text-cyan-300 bg-slate-950/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-cyan-500/30 shadow-lg">
            <span className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Port 5200 (Online)</span>
          </div>
        </div>
      </header>

      {/* 3. Ana Gövde: SOL TARAFTA FERAH YÖNETİCİ GİRİŞ PANELİ */}
      <main className="flex-1 flex items-center justify-start px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 py-4 sm:py-6 z-10 min-h-0 overflow-y-auto">
        <div className="w-full max-w-[360px] sm:max-w-[400px] lg:max-w-[420px]">
          <div className="bg-slate-950/70 hover:bg-slate-950/80 border border-cyan-500/35 hover:border-cyan-400/50 rounded-3xl p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.85)] backdrop-blur-xl transition-all">
            
            {/* Kart Başlığı */}
            <div className="mb-4 text-left">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-[11px] font-mono mb-2">
                <Lock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Güvenli Yönetim Girişi</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight drop-shadow-md">
                OmniHub Portal
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5 drop-shadow">
                OMNIFlow & OmniSpot Dağıtıcı ve Lisans Yönetimi
              </p>
            </div>

            {/* Hızlı Erişim / Varsayılan Bilgi Şeridi */}
            <div className="mb-4 px-3.5 py-2 rounded-xl bg-blue-950/60 border border-blue-600/40 flex items-center justify-between text-[11px] sm:text-xs font-mono backdrop-blur-md">
              <span className="text-slate-300">Varsayılan Yetkili:</span>
              <div className="flex items-center gap-1.5">
                <span className="text-cyan-300 font-bold">admin</span>
                <span className="text-slate-500">/</span>
                <span className="text-cyan-300 font-bold">admin123</span>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-rose-950/90 border border-rose-500/60 rounded-xl text-xs text-rose-300 font-medium">
                {error}
              </div>
            )}

            {/* Giriş Formu */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-cyan-400" />
                  Yönetici Kullanıcı Adı
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full bg-slate-900/80 border border-slate-700/80 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-400 focus:outline-none font-mono shadow-inner transition-colors backdrop-blur-md"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-cyan-400" />
                  Yönetici Parolası
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-900/80 border border-slate-700/80 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-400 focus:outline-none font-mono shadow-inner transition-colors backdrop-blur-md"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-[0_0_25px_rgba(6,182,212,0.45)] flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                >
                  <span>{loading ? 'Doğrulanıyor...' : 'GÜVENLİ GİRİŞ YAP'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* 4. MANDATORY AUTH FOOTER DEVELOPER SIGNATURE (Rule 1 in GEMINI.md) */}
      <footer className="py-2.5 sm:py-3 px-4 sm:px-6 text-center z-10 shrink-0 bg-transparent">
        <p className="text-[10px] sm:text-xs text-slate-300 tracking-wide font-sans drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
          Designed & Developed by <span className="text-cyan-400 font-semibold">Önder Cihan ACAR</span> © 2026. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
}






