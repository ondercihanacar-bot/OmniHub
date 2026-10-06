import React, { useState, useEffect, useRef } from 'react';

/**
 * SeamlessVideo
 * Kesintisiz, atlamasız, akıcı bir döngüde video oynatımı sağlayan çift oynatıcılı (crossfade) bileşen.
 * mixBlendMode ile videonun siyah arka planını saydamlaştırarak altındaki lacivert zeminle birebir bütünleştirir.
 */
export default function SeamlessVideo({
  src,
  className = 'w-full h-full object-cover object-center',
  containerClassName = 'relative w-full h-full overflow-hidden',
  fadeDuration = null,
  blendMode = 'screen', // 'screen' siyah pikselleri saydamlaştırır, lacivert arka plan doğrudan görünür
  onError = () => {},
  style = {}
}) {
  const [activePlayer, setActivePlayer] = useState(0);
  const videoARef = useRef(null);
  const videoBRef = useRef(null);
  const isCrossfadingRef = useRef(false);

  useEffect(() => {
    setActivePlayer(0);
    isCrossfadingRef.current = false;

    const vA = videoARef.current;
    const vB = videoBRef.current;

    if (vA) {
      vA.defaultMuted = true;
      vA.muted = true;
      vA.currentTime = 0;
      vA.play().catch(() => {});
    }
    if (vB) {
      vB.defaultMuted = true;
      vB.muted = true;
      vB.pause();
      vB.currentTime = 0;
    }
  }, [src]);

  const handleTimeUpdate = (playerIndex) => {
    if (playerIndex !== activePlayer) return;

    const currentEl = playerIndex === 0 ? videoARef.current : videoBRef.current;
    const nextEl = playerIndex === 0 ? videoBRef.current : videoARef.current;

    if (!currentEl || !nextEl || !currentEl.duration) return;

    const effectiveFadeDuration = fadeDuration !== null
      ? fadeDuration
      : Math.min(1.2, Math.max(0.4, currentEl.duration * 0.15));

    const timeLeft = currentEl.duration - currentEl.currentTime;

    if (timeLeft <= effectiveFadeDuration && !isCrossfadingRef.current) {
      isCrossfadingRef.current = true;
      nextEl.defaultMuted = true;
      nextEl.muted = true;
      nextEl.currentTime = 0;
      nextEl.play().then(() => {
        setActivePlayer(playerIndex === 0 ? 1 : 0);
      }).catch(() => {
        setActivePlayer(playerIndex === 0 ? 1 : 0);
      });
    }

    if (timeLeft > effectiveFadeDuration + 0.4) {
      isCrossfadingRef.current = false;
    }
  };

  const handleVideoEnded = (playerIndex) => {
    if (playerIndex === activePlayer) {
      const nextEl = playerIndex === 0 ? videoBRef.current : videoARef.current;
      if (nextEl) {
        nextEl.defaultMuted = true;
        nextEl.muted = true;
        nextEl.currentTime = 0;
        nextEl.play().catch(() => {});
      }
      setActivePlayer(playerIndex === 0 ? 1 : 0);
      isCrossfadingRef.current = false;
    }
    const finishedEl = playerIndex === 0 ? videoARef.current : videoBRef.current;
    if (finishedEl) {
      finishedEl.pause();
    }
  };

  const effectiveTransition = fadeDuration !== null ? `${fadeDuration}s` : '1.2s';

  return (
    <div className={containerClassName} style={style}>
      {/* Video Player A */}
      <video
        ref={videoARef}
        src={src}
        autoPlay
        muted
        playsInline
        onTimeUpdate={() => handleTimeUpdate(0)}
        onEnded={() => handleVideoEnded(0)}
        onError={onError}
        className={`absolute inset-0 ${className} pointer-events-none select-none`}
        style={{
          opacity: activePlayer === 0 ? 1 : 0,
          transition: `opacity ${effectiveTransition} ease-in-out`,
          zIndex: activePlayer === 0 ? 2 : 1,
          mixBlendMode: blendMode
        }}
      />

      {/* Video Player B */}
      <video
        ref={videoBRef}
        src={src}
        muted
        playsInline
        onTimeUpdate={() => handleTimeUpdate(1)}
        onEnded={() => handleVideoEnded(1)}
        onError={onError}
        className={`absolute inset-0 ${className} pointer-events-none select-none`}
        style={{
          opacity: activePlayer === 1 ? 1 : 0,
          transition: `opacity ${effectiveTransition} ease-in-out`,
          zIndex: activePlayer === 1 ? 2 : 1,
          mixBlendMode: blendMode
        }}
      />
    </div>
  );
}
