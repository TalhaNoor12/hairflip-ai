import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useInView from '../hooks/useInView';
import { ArrowRight, Play, Scissors } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const RevealSection = ({ children, className = '', delay = 0 }) => {
  const [ref, isVisible] = useInView();
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`${className} transition-all duration-700 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      {children}
    </div>
  );
};

const PrimaryBtn = ({ children, onClick, className = '' }) => (
  <button
    onClick={onClick}
    className={`bg-purple-600 dark:bg-purple-500 text-white font-bold rounded-2xl px-8 py-4 text-base
      hover:bg-purple-700 dark:hover:bg-purple-400 active:scale-95 transition-all duration-200
      min-h-[52px] ${className}`}
  >
    {children}
  </button>
);

/* ── Hero ─────────────────────────────────────────────────── */
const Hero = () => {
  const navigate = useNavigate();
  const [activeStyle, setActiveStyle] = useState(0);
  const styles = ['Buzz Cut', 'Bob', 'Braids', 'Fade'];

  const heroRef      = useRef(null);
  const glowRef      = useRef(null);
  const glowRef2     = useRef(null);
  const mousePos     = useRef({ x: 0, y: 0 });
  const currentPos   = useRef({ x: 0, y: 0 });
  const currentPos2  = useRef({ x: 0, y: 0 });
  const animFrameRef = useRef(null);

  const handleMouseMove  = (e) => {
    const rect = heroRef.current.getBoundingClientRect();
    mousePos.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };
  const handleMouseEnter = () => {
    if (glowRef.current)  glowRef.current.style.opacity  = '1';
    if (glowRef2.current) glowRef2.current.style.opacity = '1';
  };
  const handleMouseLeave = () => {
    if (glowRef.current)  glowRef.current.style.opacity  = '0';
    if (glowRef2.current) glowRef2.current.style.opacity = '0';
  };

  useEffect(() => {
    // Disable cursor glow on touch/mobile devices
    const isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    if (isTouchDevice) return;

    const animate = () => {
      currentPos.current.x  += (mousePos.current.x - currentPos.current.x)  * 0.08;
      currentPos.current.y  += (mousePos.current.y - currentPos.current.y)  * 0.08;
      currentPos2.current.x += (mousePos.current.x - currentPos2.current.x) * 0.15;
      currentPos2.current.y += (mousePos.current.y - currentPos2.current.y) * 0.15;
      if (glowRef.current) {
        glowRef.current.style.transform = `translate(${currentPos.current.x - 250}px, ${currentPos.current.y - 250}px)`;
      }
      if (glowRef2.current) {
        glowRef2.current.style.transform = `translate(${currentPos2.current.x - 100}px, ${currentPos2.current.y - 100}px)`;
      }
      animFrameRef.current = requestAnimationFrame(animate);
    };
    animFrameRef.current = requestAnimationFrame(animate);
    return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); };
  }, []);

  useEffect(() => {
    const t = setInterval(() => setActiveStyle(p => (p + 1) % styles.length), 1500);
    return () => clearInterval(t);
  }, []);

  return (
    <section
      ref={heroRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative pt-24 sm:pt-32 pb-16 sm:pb-24 bg-gradient-to-b from-purple-50 to-white dark:from-gray-950 dark:to-gray-900 overflow-hidden"
    >
      {/* Cursor glows — desktop only */}
      <div ref={glowRef} className="hidden md:block" style={{ position:'absolute', top:0, left:0, width:'500px', height:'500px', borderRadius:'50%', background:'radial-gradient(circle, rgba(124,58,237,0.18) 0%, rgba(124,58,237,0.08) 40%, rgba(124,58,237,0) 70%)', pointerEvents:'none', opacity:0, transition:'opacity 0.3s ease', zIndex:10, filter:'blur(20px)', willChange:'transform' }} />
      <div ref={glowRef2} className="hidden md:block" style={{ position:'absolute', top:0, left:0, width:'200px', height:'200px', borderRadius:'50%', background:'radial-gradient(circle, rgba(139,92,246,0.14) 0%, rgba(139,92,246,0) 70%)', pointerEvents:'none', opacity:0, transition:'opacity 0.3s ease', zIndex:9, filter:'blur(10px)', willChange:'transform' }} />

      {/* Decorative blobs */}
      <div className="absolute top-10 -left-32 w-80 sm:w-[500px] h-80 sm:h-[500px] rounded-full bg-purple-200/20 blur-[80px] sm:blur-[120px] animate-drift pointer-events-none" />
      <div className="absolute -bottom-20 -right-32 w-80 sm:w-[500px] h-80 sm:h-[500px] rounded-full bg-purple-100/30 blur-[80px] sm:blur-[120px] animate-drift-slow pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* Left: copy */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm text-sm font-semibold text-gray-900 dark:text-white mb-6 animate-slide-left">
              ✨ AI-Powered Hairstyle Try-On
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-gray-900 dark:text-gray-50 leading-[1.08] mb-5 sm:mb-7">
              <span className="block opacity-0 animate-reveal-up" style={{ animationDelay:'100ms', animationFillMode:'forwards' }}>See Yourself</span>
              <span className="block opacity-0 animate-reveal-up" style={{ animationDelay:'250ms', animationFillMode:'forwards' }}>With a New</span>
              <span className="block opacity-0 animate-reveal-up text-purple-600 dark:text-purple-400" style={{ animationDelay:'400ms', animationFillMode:'forwards' }}>Hairstyle —</span>
              <span className="block opacity-0 animate-reveal-up" style={{ animationDelay:'550ms', animationFillMode:'forwards' }}>Before the Salon</span>
            </h1>

            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-8 sm:mb-10 opacity-0 animate-reveal-up" style={{ animationDelay:'700ms', animationFillMode:'forwards' }}>
              Upload one selfie. Try 20+ hairstyles instantly. Download your favourite and walk into the salon with confidence.
            </p>

            {/* Buttons — stack on mobile */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 sm:mb-10 opacity-0 animate-reveal-up" style={{ animationDelay:'850ms', animationFillMode:'forwards' }}>
              <PrimaryBtn onClick={() => navigate('/upload')} className="w-full sm:w-auto flex items-center justify-center gap-2 group">
                Try It Free
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </PrimaryBtn>
              <button className="w-full sm:w-auto border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-50 px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all min-h-[52px]">
                Watch Demo <Play size={17} fill="currentColor" />
              </button>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-4 sm:gap-6 text-sm text-gray-500 dark:text-gray-400 font-medium opacity-0 animate-reveal-up" style={{ animationDelay:'1000ms', animationFillMode:'forwards' }}>
              <span>✓ No account needed</span>
              <span>✓ Free to try</span>
              <span>✓ Results in 10 seconds</span>
            </div>
          </div>

          {/* Right: Before/After card — HIDDEN on mobile */}
          <div className="hidden lg:block animate-slide-right" style={{ animationDelay:'300ms', animationFillMode:'forwards' }}>
            <div className="relative bg-white dark:bg-gray-800 rounded-3xl p-5 animate-float border border-gray-100 dark:border-gray-700 shadow-[0_30px_80px_-10px_rgba(124,58,237,0.2)]">
              <div className="grid grid-cols-2 gap-4 h-[380px] relative">
                <div className="rounded-2xl bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center relative overflow-hidden">
                  <span className="absolute top-4 left-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Before</span>
                  <svg width="110" height="170" viewBox="0 0 120 180">
                    <circle cx="60" cy="52" r="38" fill="#CBD5E1" />
                    <rect x="18" y="98" width="84" height="62" rx="12" fill="#CBD5E1" />
                  </svg>
                </div>
                <div className="rounded-2xl bg-purple-50 dark:bg-purple-900/20 flex flex-col items-center justify-center relative overflow-hidden border border-purple-100 dark:border-purple-800/50">
                  <span className="absolute top-4 right-4 text-[10px] font-bold text-purple-400 uppercase tracking-widest">After</span>
                  <svg width="110" height="170" viewBox="0 0 120 180" className="relative z-10">
                    <circle cx="60" cy="52" r="38" fill="#CBD5E1" />
                    <rect x="18" y="98" width="84" height="62" rx="12" fill="#CBD5E1" />
                    <path d="M18,52 Q18,8 60,8 Q102,8 102,52 L107,82 Q107,94 90,88 Q60,78 30,88 Q13,94 13,82 Z" fill="#7C3AED" />
                    <path d="M26,46 Q26,18 60,18 Q94,18 94,46" fill="none" stroke="white" strokeWidth="2" opacity="0.25" />
                  </svg>
                </div>
                <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <div className="w-9 h-9 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-center text-gray-500 text-sm font-bold animate-pulse">↔</div>
                </div>
              </div>
              <div className="mt-6 flex justify-center gap-2">
                {styles.map((s, i) => (
                  <span key={s} className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all duration-300 ${activeStyle === i ? 'bg-purple-600 dark:bg-purple-500 text-white border-purple-600 -translate-y-0.5 shadow-md' : 'text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700'}`}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ── Ticker ───────────────────────────────────────────────── */
const Ticker = () => {
  const items = ['Buzz Cut','Bob Cut','Curtain Bangs','Taper Fade','Box Braids','Pixie Cut','Quiff','Wavy Lob','French Crop','Afro','Undercut','Side Part','Cornrows','Shag Cut','Man Bun'];
  return (
    <div className="py-4 border-y border-gray-100 dark:border-gray-800 overflow-hidden whitespace-nowrap bg-white dark:bg-gray-950">
      <div className="flex items-center gap-4">
        <span className="pl-4 shrink-0 text-xs font-bold tracking-widest uppercase text-gray-400 dark:text-gray-500">Trending:</span>
        <div className="animate-ticker flex items-center gap-8">
          {[...items, ...items].map((item, i) => (
            <span key={i} className="text-sm text-gray-600 dark:text-gray-400 font-medium flex items-center gap-2">
              {item} <Scissors size={11} className="text-purple-400" />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ── How It Works ─────────────────────────────────────────── */
const HowItWorks = () => {
  const steps = [
    { num:'1', emoji:'📸', title:'Upload Your Selfie',  desc:'Take or upload any clear front-facing photo. No special lighting needed.' },
    { num:'2', emoji:'💇', title:'Choose Your Style',   desc:'Pick from 20+ hairstyles or type any style you can imagine.' },
    { num:'3', emoji:'✨', title:'See Your New Look',   desc:'AI generates your result in seconds. Download and show your stylist.' },
  ];
  return (
    <section id="how-it-works" className="py-16 sm:py-28 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <RevealSection className="text-center mb-12 sm:mb-20">
          <p className="text-xs font-bold tracking-widest uppercase text-purple-600 dark:text-purple-400 mb-3">Process</p>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-gray-900 dark:text-gray-50 mb-4">How It Works</h2>
          <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg">Three simple steps to your new look</p>
        </RevealSection>

        <div className="flex flex-col md:grid md:grid-cols-3 gap-0 md:gap-8 relative">
          {/* Desktop horizontal connector */}
          <div className="hidden md:block absolute top-[3.75rem] left-[18%] right-[18%] h-px border-t-2 border-dashed border-gray-200 dark:border-gray-700" />

          {steps.map((step, idx) => (
            <React.Fragment key={idx}>
              <RevealSection delay={idx * 150} className="group">
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 sm:p-8 text-center flex flex-col items-center shadow-sm hover:-translate-y-1 transition-all duration-300">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-purple-600 dark:bg-purple-500 text-white flex items-center justify-center font-black text-lg sm:text-xl mb-4 sm:mb-6 shadow-lg">
                    {step.num}
                  </div>
                  <div className="text-3xl sm:text-4xl mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">{step.emoji}</div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-50 mb-2 sm:mb-3">{step.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">{step.desc}</p>
                </div>
              </RevealSection>

              {/* Mobile vertical connector between steps */}
              {idx < steps.length - 1 && (
                <div className="flex justify-center py-2 md:hidden">
                  <div className="w-0.5 h-8 border-l-2 border-dashed border-purple-300 dark:border-purple-800" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ── Features ─────────────────────────────────────────────── */
const Features = () => {
  const features = [
    { icon:'🎨', title:'20+ Hairstyles',       desc:'From buzz cuts to braids. Men and women covered.' },
    { icon:'🌈', title:'Hair Colour Try-On',   desc:'Blonde, brunette, red — try before you commit.' },
    { icon:'🔍', title:'Face Shape Analysis',  desc:'AI recommends styles that flatter your face shape.' },
    { icon:'↔️', title:'Before & After Slider',desc:'Drag to compare your before and after look.' },
    { icon:'💾', title:'Download & Share',     desc:'Save looks and share to WhatsApp or Instagram.' },
    { icon:'🔒', title:'100% Private',          desc:'Photos deleted after 24 hours. Never stored.' },
  ];
  return (
    <section id="features" className="py-16 sm:py-28 bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <RevealSection className="text-center mb-12 sm:mb-20">
          <p className="text-xs font-bold tracking-widest uppercase text-purple-600 dark:text-purple-400 mb-3">Features</p>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-gray-900 dark:text-white mb-4">Powerful AI Features</h2>
          <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg">Everything you need for a stunning transformation</p>
        </RevealSection>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {features.map((feat, idx) => (
            <RevealSection key={idx} delay={idx * 80}>
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5 sm:p-8 hover:shadow-md hover:-translate-y-2 transition-all duration-300 group h-full">
                <div className="text-3xl sm:text-4xl mb-4 inline-block group-hover:scale-125 transition-transform duration-300 origin-left">{feat.icon}</div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-2">{feat.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{feat.desc}</p>
              </div>
            </RevealSection>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ── Stats ────────────────────────────────────────────────── */
const Stats = () => (
  <section className="py-14 sm:py-16 bg-purple-700 dark:bg-purple-900">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row gap-8 sm:gap-12 items-center justify-center text-center">
        {[
          { value:'10,000+', label:'Hairstyles Generated' },
          { value:'4.9★',    label:'User Rating' },
          { value:'10 sec',  label:'Avg Result Time' },
        ].map((s, i) => (
          <RevealSection key={i} delay={i * 150}>
            <div className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-1">{s.value}</div>
            <p className="text-purple-200 dark:text-purple-300 text-xs font-bold tracking-widest uppercase">{s.label}</p>
          </RevealSection>
        ))}
      </div>
    </div>
  </section>
);

/* ── Showcase ─────────────────────────────────────────────── */
const Showcase = () => {
  const cards = [
    { icon:'💇‍♂️', name:'Taper Fade',    best:'Oval, Square',    gradient:'from-blue-400 to-indigo-600' },
    { icon:'👱‍♀️', name:'Curtain Bangs', best:'Round, Heart',    gradient:'from-pink-400 to-orange-400' },
    { icon:'🧑',  name:'Buzz Cut',      best:'All face shapes', gradient:'from-emerald-400 to-teal-500' },
    { icon:'👩',  name:'Bob Cut',       best:'Oval, Square',    gradient:'from-violet-500 to-pink-500' },
    { icon:'🧑‍🦱', name:'Box Braids',   best:'All face shapes', gradient:'from-amber-400 to-red-500' },
    { icon:'💆‍♀️', name:'Pixie Cut',    best:'Oval, Heart',     gradient:'from-indigo-600 to-sky-400' },
  ];
  return (
    <section className="py-16 sm:py-28 bg-white dark:bg-gray-950 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <RevealSection className="text-center mb-10 sm:mb-16">
          <p className="text-xs font-bold tracking-widest uppercase text-purple-600 dark:text-purple-400 mb-3">Gallery</p>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-gray-900 dark:text-white mb-4">Styles for Everyone</h2>
          <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg">From classic cuts to bold transformations</p>
        </RevealSection>
        <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide snap-x -mx-4 px-4">
          {cards.map((card, idx) => (
            <div key={idx} className="min-w-[200px] sm:min-w-[260px] h-[300px] sm:h-[360px] rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 hover:scale-105 transition-all duration-300 snap-center flex-shrink-0">
              <div className={`h-[58%] bg-gradient-to-br ${card.gradient} flex items-center justify-center`}>
                <span className="text-5xl sm:text-6xl">{card.icon}</span>
              </div>
              <div className="p-4 sm:p-6 h-[42%] flex flex-col justify-center">
                <h4 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-1">{card.name}</h4>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Best for: {card.best}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-center mt-3 text-sm text-gray-400 dark:text-gray-500 font-medium">← Swipe to explore →</p>
      </div>
    </section>
  );
};

/* ── CTA ──────────────────────────────────────────────────── */
const CTA = () => {
  const navigate = useNavigate();
  return (
    <section className="py-16 sm:py-20 bg-purple-50 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <RevealSection>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-gray-900 dark:text-white mb-4 sm:mb-6 leading-tight">
            Ready to Find Your Perfect Hairstyle?
          </h2>
          <p className="text-base sm:text-xl text-gray-600 dark:text-gray-400 mb-8 sm:mb-10">
            Join thousands who found their best look. Free to try, no account needed.
          </p>
          <button
            onClick={() => navigate('/upload')}
            className="w-full sm:w-auto bg-purple-600 dark:bg-purple-500 hover:bg-purple-700 dark:hover:bg-purple-400 text-white font-bold px-10 sm:px-12 py-4 sm:py-5 rounded-full text-lg sm:text-xl inline-flex items-center justify-center gap-2 transition-all min-h-[56px]"
          >
            Try HairFlip Free <ArrowRight size={20} />
          </button>
        </RevealSection>
      </div>
    </section>
  );
};

/* ── Page root ────────────────────────────────────────────── */
const LandingPage = () => (
  <div className="min-h-screen overflow-x-hidden bg-white dark:bg-gray-950 transition-colors duration-300">
    <Navbar />
    <main>
      <Hero />
      <Ticker />
      <HowItWorks />
      <Features />
      <Stats />
      <Showcase />
      <CTA />
    </main>
    <Footer />
  </div>
);

export default LandingPage;
