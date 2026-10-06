import React, { useState } from 'react';
import SeamlessVideo from './SeamlessVideo';
import { ShieldCheck } from 'lucide-react';

/**
 * OmniHubLogo
 * OmniHub kurumsal hareketli Logo-OmniHub.mp4 videosunu
 * Giriş kartında ve üst başlık (Header) sol üst alanda
 * tam sığdırılmış (16:9 aspect-video), ne eksik ne fazla,
 * köşeden köşeye kusursuz biçimde render eder.
 */
export default function OmniHubLogo({
  src = '/Logo-OmniHub.mp4',
  size = 'admin', // 'admin' | 'auth' | 'sidebar' | 'login' | 'header' | 'certificate' | 'mini'
  className = '',
  showText = true
}) {
  const [hasError, setHasError] = useState(false);

  // 1. Program İçi Sol Üst Header Logosu (Ne eksik ne taşsın - Tam 16:9 sığdırma)
  if (size === 'admin' || size === 'header-brand' || size === 'sidebar') {
    return (
      <div className={`relative h-12 sm:h-14 aspect-video rounded-xl border border-blue-500/40 bg-[#081222] shadow-md shadow-blue-950/50 overflow-hidden flex items-center justify-center shrink-0 cursor-pointer group hover:border-cyan-400/50 transition-all ${className}`}>
        {!hasError ? (
          <SeamlessVideo
            src={src}
            fadeDuration={0.8}
            blendMode="normal"
            onError={() => setHasError(true)}
            className="w-full h-full object-cover object-center"
            containerClassName="relative w-full h-full overflow-hidden rounded-lg flex items-center justify-center"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full p-1">
            <img
              src="/app_icon.png"
              alt="OmniHub"
              className="h-9 w-auto object-contain drop-shadow-[0_0_12px_rgba(56,189,248,0.25)] select-none hover:brightness-110 transition-all"
            />
          </div>
        )}
      </div>
    );
  }

  // 2. Giriş Ekranı Kart İçi Logo Banner (Kullanıcının ilettiği çerçeveye tam oturan 16:9 video)
  if (size === 'auth' || size === 'login') {
    return (
      <div className={`relative w-full aspect-video rounded-2xl border border-blue-500/40 bg-[#081222] shadow-2xl shadow-black/80 overflow-hidden flex items-center justify-center group hover:border-cyan-400/50 transition-all ${className}`}>
        {!hasError ? (
          <SeamlessVideo
            src={src}
            fadeDuration={0.8}
            blendMode="normal"
            onError={() => setHasError(true)}
            className="w-full h-full object-cover object-center"
            containerClassName="relative w-full h-full overflow-hidden rounded-xl flex items-center justify-center"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full p-3">
            <img
              src="/app_icon.png"
              alt="OmniHub"
              className="h-16 w-auto object-contain drop-shadow-[0_0_16px_rgba(56,189,248,0.35)]"
            />
          </div>
        )}
      </div>
    );
  }

  // 3. Header İkonu
  if (size === 'header') {
    return (
      <div className={`relative w-10 h-10 rounded-lg bg-[#081222] border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.3)] overflow-hidden flex items-center justify-center shrink-0 ${className}`}>
        {!hasError ? (
          <SeamlessVideo
            src={src}
            onError={() => setHasError(true)}
            blendMode="normal"
            className="w-full h-full object-cover object-center"
            containerClassName="relative w-full h-full overflow-hidden rounded-md"
          />
        ) : (
          <ShieldCheck className="w-5 h-5 text-cyan-400" />
        )}
      </div>
    );
  }

  // 4. Sertifika / Belge Logosu
  if (size === 'certificate') {
    return (
      <div className={`relative w-14 h-14 rounded-xl bg-[#081222] border border-slate-700 shadow-md overflow-hidden flex items-center justify-center shrink-0 ${className}`}>
        {!hasError ? (
          <SeamlessVideo
            src={src}
            onError={() => setHasError(true)}
            blendMode="normal"
            className="w-full h-full object-cover object-center"
            containerClassName="relative w-full h-full overflow-hidden rounded-lg"
          />
        ) : (
          <div className="w-full h-full bg-slate-900 text-cyan-400 font-bold font-mono flex items-center justify-center text-sm">
            OH
          </div>
        )}
      </div>
    );
  }

  // 5. Mini / Footer Rozet
  if (size === 'mini') {
    return (
      <div className={`relative w-6 h-6 rounded-md bg-[#081222] border border-cyan-500/40 overflow-hidden flex items-center justify-center shrink-0 ${className}`}>
        {!hasError ? (
          <SeamlessVideo
            src={src}
            onError={() => setHasError(true)}
            blendMode="normal"
            className="w-full h-full object-cover object-center"
            containerClassName="relative w-full h-full overflow-hidden"
          />
        ) : (
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
        )}
      </div>
    );
  }

  // Standart fallback
  return (
    <div className={`relative w-14 h-14 rounded-xl bg-[#081222] border border-blue-500/30 overflow-hidden flex items-center justify-center ${className}`}>
      {!hasError ? (
        <SeamlessVideo
          src={src}
          onError={() => setHasError(true)}
          blendMode="normal"
          className="w-full h-full object-cover object-center"
          containerClassName="relative w-full h-full overflow-hidden rounded-lg"
        />
      ) : (
        <ShieldCheck className="w-6 h-6 text-cyan-400" />
      )}
    </div>
  );
}

