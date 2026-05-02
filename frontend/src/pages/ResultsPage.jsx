import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHairFlip } from '../context/HairFlipContext';
import { CheckCircle, Download, MessageCircle, RefreshCw, Home, ArrowLeftRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function ResultsPage() {
  const navigate = useNavigate();
  const {
    uploadedImageUrl, resultImageUrl, selectedStyle, faceShape,
    sessionHistory, addToHistory,
    setResultImageUrl, setSelectedStyle, resetSession,
  } = useHairFlip();

  const [sliderPosition,  setSliderPosition]  = useState(50);
  const [isDragging,      setIsDragging]      = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const containerRef   = useRef(null);
  const confettiFired  = useRef(false);
  const gentleShower   = useRef(null);

  /* ── Audio chime ─────────────────────────────────────────── */
  const playChime = () => {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      const ctx = new AC();
      [523, 659, 784].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const g   = ctx.createGain();
        osc.connect(g); g.connect(ctx.destination);
        osc.frequency.value = freq; osc.type = 'sine';
        const t0 = ctx.currentTime + i * 0.12, t1 = t0 + 0.3;
        g.gain.setValueAtTime(0, t0);
        g.gain.linearRampToValueAtTime(0.15, t0 + 0.02);
        g.gain.linearRampToValueAtTime(0, t1);
        osc.start(t0); osc.stop(t1);
      });
    } catch {}
  };

  /* ── Confetti ────────────────────────────────────────────── */
  const fireConfetti = useCallback(() => {
    playChime();
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 2500);
    const isMobile = window.innerWidth < 768;
    const n = isMobile ? 40 : 80;
    const colors = ['#7C3AED','#A78BFA','#DDD6FE','#FFFFFF','#FCD34D','#F9A8D4','#6EE7B7'];
    confetti({ particleCount:n, spread:70, angle:60,  origin:{x:0,y:1}, colors, startVelocity:45, gravity:0.8, scalar:1.1, drift:0.5,  ticks:300 });
    confetti({ particleCount:n, spread:70, angle:120, origin:{x:1,y:1}, colors, startVelocity:45, gravity:0.8, scalar:1.1, drift:-0.5, ticks:300 });
    setTimeout(() => confetti({ particleCount:50, spread:120, angle:270, origin:{x:0.5,y:0}, colors, startVelocity:20, gravity:0.6, scalar:0.9, ticks:400 }), 600);
    setTimeout(() => {
      const end = Date.now() + 3000;
      const drizzle = () => {
        if (Date.now() > end) return;
        confetti({ particleCount:3, spread:60, angle:80+Math.random()*40, origin:{x:Math.random(),y:0}, colors:['#7C3AED','#A78BFA','#FFFFFF','#FCD34D'], startVelocity:15, gravity:0.5, scalar:0.7, ticks:350, drift:(Math.random()-0.5)*0.5 });
        gentleShower.current = requestAnimationFrame(drizzle);
      };
      drizzle();
    }, 1000);
  }, []);

  useEffect(() => () => { if (gentleShower.current) cancelAnimationFrame(gentleShower.current); }, []);

  useEffect(() => {
    if (resultImageUrl && !confettiFired.current) {
      confettiFired.current = true;
      setTimeout(() => fireConfetti(), 400);
    }
  }, [resultImageUrl, fireConfetti]);

  useEffect(() => { if (!resultImageUrl || !uploadedImageUrl) navigate('/upload'); }, [resultImageUrl, uploadedImageUrl, navigate]);

  useEffect(() => {
    if (resultImageUrl && selectedStyle && uploadedImageUrl) {
      addToHistory({ id:Date.now(), style:selectedStyle, resultUrl:resultImageUrl, originalUrl:uploadedImageUrl, timestamp:new Date().toLocaleTimeString() });
    }
  }, [resultImageUrl, selectedStyle]); // eslint-disable-line

  /* ── Slider intro pulse ──────────────────────────────────── */
  useEffect(() => {
    let t1 = setTimeout(() => { setSliderPosition(30); let t2 = setTimeout(() => setSliderPosition(50), 700); return () => clearTimeout(t2); }, 800);
    return () => clearTimeout(t1);
  }, []);

  /* ── Drag logic ──────────────────────────────────────────── */
  const handleMove = useCallback((clientX) => {
    if (!containerRef.current || !isDragging) return;
    const rect = containerRef.current.getBoundingClientRect();
    setSliderPosition(Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100)));
  }, [isDragging]);

  const onMouseMove = useCallback((e) => handleMove(e.clientX), [handleMove]);
  const onTouchMove = useCallback((e) => { e.preventDefault(); handleMove(e.touches[0].clientX); }, [handleMove]);
  const stopDrag    = useCallback(() => setIsDragging(false), []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup',   stopDrag);
      window.addEventListener('touchmove', onTouchMove, { passive:false });
      window.addEventListener('touchend',  stopDrag);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup',   stopDrag);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend',  stopDrag);
    };
  }, [isDragging, onMouseMove, onTouchMove, stopDrag]);

  /* ── Actions ─────────────────────────────────────────────── */
  const handleDownload = async () => {
    try {
      const blob = await (await fetch(resultImageUrl)).blob();
      const url  = URL.createObjectURL(blob);
      const a    = Object.assign(document.createElement('a'), { href:url, download:`hairflip-${selectedStyle||'result'}.jpg` });
      document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    } catch {}
  };

  const handleShareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(`Check out my new hairstyle with HairFlip AI — "${selectedStyle}" 💇✨`)}`, '_blank');
  };

  const handleTryAnother = () => { setResultImageUrl(null); setSelectedStyle(null); navigate('/style-selector'); };
  const handleStartOver  = () => { resetSession(); navigate('/upload'); };
  const selectHistory    = (item) => { setResultImageUrl(item.resultUrl); setSelectedStyle(item.style); setSliderPosition(50); window.scrollTo({top:0,behavior:'smooth'}); };

  if (!resultImageUrl || !uploadedImageUrl) return null;

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gradient-to-b from-purple-50 to-white dark:from-gray-950 dark:to-gray-900 transition-colors duration-300">
      <Navbar />

      <main className="flex-grow pt-6 sm:pt-10 pb-20 sm:pb-24 max-w-4xl mx-auto px-4 w-full">

        {/* Step breadcrumb */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 mb-6 text-xs sm:text-sm font-medium text-gray-400 dark:text-gray-500">
          <div className="flex items-center gap-1 text-green-600 dark:text-green-400"><CheckCircle size={13} /> <span className="line-through">Upload</span></div>
          <span>→</span>
          <div className="flex items-center gap-1 text-green-600 dark:text-green-400"><CheckCircle size={13} /> <span className="line-through">Style</span></div>
          <span>→</span>
          <div className="text-purple-600 dark:text-purple-400 font-bold">Result</div>
        </div>

        {/* Success banner */}
        <div className="w-full bg-green-50 dark:bg-green-900/20 rounded-xl p-4 mb-6 text-center border border-green-200 dark:border-green-800">
          <h2 className="text-green-800 dark:text-green-300 font-bold text-lg sm:text-xl mb-0.5">✨ Your new hairstyle is ready!</h2>
          <p className="text-green-600 dark:text-green-400 text-sm">Here is what you'd look like with {selectedStyle}</p>
        </div>

        {/* Celebration pop */}
        {showCelebration && (
          <div className="text-center mb-4" style={{ animation:'celebrationPop 0.4s ease-out forwards' }}>
            <div className="text-5xl sm:text-6xl mb-1">🎉</div>
            <p className="text-xl sm:text-2xl font-bold text-purple-700 dark:text-purple-400">Looking amazing!</p>
          </div>
        )}

        {/* Title */}
        <div className="text-center mb-4 sm:mb-6">
          <h1 className="font-black text-2xl sm:text-3xl text-gray-900 dark:text-white mb-1">Your New Look</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Drag the slider to compare before & after</p>
        </div>

        {/* Before/After slider — FULL WIDTH on mobile */}
        <div className="flex flex-col items-center mb-8">
          <div
            ref={containerRef}
            className="relative w-full aspect-square sm:aspect-[4/3] sm:max-w-lg rounded-2xl overflow-hidden shadow-2xl bg-gray-100 dark:bg-gray-800 touch-none select-none"
          >
            {/* Before */}
            <img src={uploadedImageUrl} alt="Before" className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
            <div className="absolute top-3 left-3 bg-black/60 dark:bg-black/80 text-white text-xs font-bold px-3 py-1 rounded-full tracking-wider pointer-events-none">BEFORE</div>

            {/* After */}
            <div className="absolute inset-0 pointer-events-none" style={{ clipPath:`inset(0 0 0 ${sliderPosition}%)` }}>
              <img src={resultImageUrl} alt="After" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute top-3 right-3 bg-purple-600 dark:bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full tracking-wider">AFTER</div>
            </div>

            {/* Drag handle — 48px on mobile for easy touch */}
            <div
              className="absolute top-0 bottom-0 z-10 flex items-center justify-center cursor-ew-resize"
              style={{ left:`${sliderPosition}%`, transform:'translateX(-50%)', width:'4px' }}
              onMouseDown={() => setIsDragging(true)}
              onTouchStart={() => setIsDragging(true)}
            >
              <div className="w-[2px] h-full bg-white shadow-[0_0_8px_rgba(0,0,0,0.5)]" />
              <div className="absolute w-12 h-12 bg-white dark:bg-gray-200 rounded-full shadow-xl flex items-center justify-center text-purple-600 dark:text-purple-800 animate-pulse">
                <ArrowLeftRight size={22} />
              </div>
            </div>
          </div>
          <p className="text-gray-400 dark:text-gray-500 text-xs mt-3 font-medium opacity-0" style={{ animation:'revealUp 1s ease-out 0.3s forwards' }}>
            ← Drag or swipe to compare →
          </p>
        </div>

        {/* Style info card */}
        <div className="max-w-lg mx-auto bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4 sm:p-5 mb-6 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-indigo-500" />
          <p className="text-gray-900 dark:text-white font-semibold flex items-center justify-center gap-2 mb-1 flex-wrap">
            Style Applied:
            <span className="bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full text-sm font-black">{selectedStyle}</span>
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-xs font-semibold uppercase tracking-widest mb-2">Generated by HairFlip AI</p>
          {faceShape && (
            <p className="text-green-600 dark:text-green-400 text-xs font-medium flex items-center justify-center gap-1">
              Recommended for your {faceShape} face <CheckCircle size={12} />
            </p>
          )}
        </div>

        {/* Action buttons — 2×2 on mobile */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 max-w-3xl mx-auto">
          <button onClick={handleDownload} className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 bg-purple-600 dark:bg-purple-500 hover:bg-purple-700 text-white p-3 sm:p-4 rounded-2xl sm:rounded-full font-semibold min-h-[56px] transition-all text-sm">
            <Download size={18} /> <span>Download</span>
          </button>
          <button onClick={handleShareWhatsApp} className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 bg-[#25D366] text-white p-3 sm:p-4 rounded-2xl sm:rounded-full font-semibold min-h-[56px] transition-all text-sm">
            <MessageCircle size={18} /> <span>WhatsApp</span>
          </button>
          <button onClick={handleTryAnother} className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 border border-purple-600 dark:border-purple-400 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 p-3 sm:p-4 rounded-2xl sm:rounded-full font-semibold min-h-[56px] transition-all text-sm">
            <RefreshCw size={18} /> <span>Try Another</span>
          </button>
          <button onClick={handleStartOver} className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 p-3 sm:p-4 rounded-2xl sm:rounded-full font-semibold min-h-[56px] transition-all text-sm">
            <Home size={18} /> <span>Start Over</span>
          </button>
        </div>

        {/* Celebrate again */}
        <div className="flex justify-center mb-10">
          <button onClick={() => { confettiFired.current=false; fireConfetti(); confettiFired.current=true; }} className="text-sm text-purple-400 hover:text-purple-600 dark:hover:text-purple-300 underline underline-offset-2 transition-colors min-h-[44px] flex items-center px-3">
            🎉 Celebrate again
          </button>
        </div>

        {/* Session history */}
        {sessionHistory?.length > 0 && (
          <div className="mb-10">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-1">Session History</h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-4">All styles you've tried today</p>
            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x">
              {sessionHistory.map(item => {
                const isCurrent = item.resultUrl === resultImageUrl;
                return (
                  <div key={item.id} onClick={() => selectHistory(item)} className={`w-28 sm:w-36 shrink-0 snap-center rounded-xl overflow-hidden shadow cursor-pointer transition-all hover:-translate-y-1 ${isCurrent ? 'border-2 border-purple-600 dark:border-purple-400' : 'border border-gray-100 dark:border-gray-700 opacity-75 hover:opacity-100'}`}>
                    <div className="relative h-20 sm:h-24">
                      <img src={item.resultUrl} alt={item.style} className="w-full h-full object-cover" />
                      {isCurrent && <span className="absolute top-1 left-1 bg-purple-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase">Current</span>}
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-2 text-center">
                      <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{item.style}</p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500">{item.timestamp}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Pro tips */}
        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-xl p-5 mb-10">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><span>💡</span> Pro Tips</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { icon:'📱', title:'Show your stylist', desc:'Screenshot this and show your hairdresser exactly what you want.' },
              { icon:'💬', title:'Share with friends', desc:'Send to WhatsApp and get opinions before your salon visit.' },
              { icon:'🔄', title:'Try more styles',   desc:"Go back and try different hairstyles — it's free and fast." },
            ].map(tip => (
              <div key={tip.title}>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">{tip.icon} {tip.title}</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{tip.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <p className="text-gray-900 dark:text-white font-bold mb-4">Want a completely different look?</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button onClick={handleTryAnother} className="w-full sm:w-auto bg-purple-600 dark:bg-purple-500 hover:bg-purple-700 text-white font-bold px-8 py-3.5 rounded-full flex items-center justify-center gap-2 transition-all min-h-[52px]">
              ← Try Another Style
            </button>
            <button onClick={handleStartOver} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 text-sm font-semibold underline underline-offset-4 min-h-[44px] flex items-center">
              Change your photo
            </button>
          </div>
        </div>

      </main>
      <Footer />
    </div>
  );
}
