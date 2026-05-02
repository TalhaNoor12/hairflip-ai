import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHairFlip } from '../context/HairFlipContext';
import { analyseFaceShape, generateHairstyle } from '../api/hairApi';
import { Scissors, CheckCircle, Search, Edit3, Sparkles } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const hairstyles = [
  { id:1,  name:'Buzz Cut',       emoji:'⚡', gender:'men',   prompt:'buzz cut with skin fade',                    bestFor:['OVAL','SQUARE','HEART','DIAMOND'] },
  { id:2,  name:'Taper Fade',     emoji:'✂️', gender:'men',   prompt:'taper fade with short textured top',         bestFor:['OVAL','SQUARE','DIAMOND'] },
  { id:3,  name:'Quiff',          emoji:'💈', gender:'men',   prompt:'classic quiff hairstyle swept back',         bestFor:['OVAL','ROUND','HEART'] },
  { id:4,  name:'French Crop',    emoji:'🪒', gender:'men',   prompt:'french crop haircut with textured fringe',   bestFor:['OVAL','ROUND','SQUARE'] },
  { id:5,  name:'Man Bun',        emoji:'🧢', gender:'men',   prompt:'man bun tied up with loose strands',         bestFor:['OVAL','HEART','DIAMOND'] },
  { id:6,  name:'Pompadour',      emoji:'🎸', gender:'men',   prompt:'slicked back pompadour hairstyle',           bestFor:['OVAL','SQUARE','HEART'] },
  { id:7,  name:'Undercut',       emoji:'🔱', gender:'men',   prompt:'disconnected undercut with long top',        bestFor:['OVAL','SQUARE','DIAMOND'] },
  { id:8,  name:'Textured Crop',  emoji:'🌀', gender:'men',   prompt:'textured crop with messy fringe',            bestFor:['OVAL','ROUND','HEART'] },
  { id:9,  name:'Afro',           emoji:'👑', gender:'both',  prompt:'full natural afro hairstyle',                bestFor:['OVAL','HEART','DIAMOND'] },
  { id:10, name:'Cornrows',       emoji:'🌿', gender:'both',  prompt:'neat cornrows braided back',                 bestFor:['OVAL','SQUARE','HEART'] },
  { id:11, name:'Bob Cut',        emoji:'💇', gender:'women', prompt:'sleek chin length bob cut',                  bestFor:['OVAL','SQUARE','HEART'] },
  { id:12, name:'Pixie Cut',      emoji:'🌸', gender:'women', prompt:'short pixie cut with side swept fringe',     bestFor:['OVAL','HEART','DIAMOND'] },
  { id:13, name:'Curtain Bangs',  emoji:'🎀', gender:'women', prompt:'curtain bangs with medium length waves',     bestFor:['OVAL','ROUND','SQUARE','HEART'] },
  { id:14, name:'Wavy Lob',       emoji:'🌊', gender:'women', prompt:'wavy lob shoulder length hair',              bestFor:['OVAL','ROUND','HEART'] },
  { id:15, name:'Box Braids',     emoji:'🔮', gender:'women', prompt:'long box braids past shoulders',             bestFor:['OVAL','ROUND','SQUARE','HEART','DIAMOND'] },
  { id:16, name:'Shag Cut',       emoji:'🦋', gender:'women', prompt:'70s shag cut with layers and curtain bangs', bestFor:['OVAL','ROUND','DIAMOND'] },
  { id:17, name:'Side Part',      emoji:'💼', gender:'both',  prompt:'classic side part with slicked hair',        bestFor:['OVAL','SQUARE','DIAMOND'] },
  { id:18, name:'Ponytail',       emoji:'🎗️', gender:'women', prompt:'high sleek ponytail pulled back tight',      bestFor:['OVAL','ROUND','SQUARE','HEART','DIAMOND'] },
  { id:19, name:'Messy Bun',      emoji:'🌙', gender:'women', prompt:'effortless messy bun with face framing pieces', bestFor:['OVAL','ROUND','HEART'] },
  { id:20, name:'Long Waves',     emoji:'✨', gender:'women', prompt:'long beachy waves past shoulders',           bestFor:['OVAL','SQUARE','DIAMOND'] },
];

export default function StyleSelectorPage() {
  const navigate = useNavigate();
  const {
    uploadedImageUrl,
    setResultImageUrl,
    setSelectedStyle: setCtxSelectedStyle,
    setFaceShape: setCtxFaceShape,
  } = useHairFlip();

  const [activeTab,      setActiveTab]      = useState('All');
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [customText,     setCustomText]     = useState('');
  const [faceShapeData,  setFaceShapeData]  = useState(null);
  const [isAnalysing,    setIsAnalysing]    = useState(true);
  const [isGenerating,   setIsGenerating]   = useState(false);
  const [genError,       setGenError]       = useState('');
  const [tipIndex,       setTipIndex]       = useState(0);

  const tips = ['✨ Applying your hairstyle...','💇 Blending with your features...','🎨 Adding finishing touches...','📸 Almost ready...'];

  useEffect(() => { if (!uploadedImageUrl) navigate('/upload'); }, [uploadedImageUrl, navigate]);

  useEffect(() => {
    if (!uploadedImageUrl) return;
    (async () => {
      try {
        setIsAnalysing(true);
        const data = await analyseFaceShape(uploadedImageUrl);
        setFaceShapeData(data);
        setCtxFaceShape(data.faceShape);
      } catch { /* silent */ }
      finally { setIsAnalysing(false); }
    })();
  }, [uploadedImageUrl, setCtxFaceShape]);

  useEffect(() => {
    if (!isGenerating) return;
    const t = setInterval(() => setTipIndex(p => (p + 1) % tips.length), 3000);
    return () => clearInterval(t);
  }, [isGenerating]);

  const handleCardClick = (card) => {
    setSelectedCardId(prev => prev === card.id ? null : card.id);
    setCustomText('');
  };

  const handleCustomChange = (e) => {
    setCustomText(e.target.value);
    if (e.target.value.length > 0) setSelectedCardId(null);
  };

  const handleGenerate = async () => {
    if (!uploadedImageUrl) { navigate('/upload'); return; }
    const card = hairstyles.find(h => h.id === selectedCardId);
    const finalPrompt     = card ? card.prompt     : customText.trim();
    const finalStyleName  = card ? card.name       : 'Custom Style';
    if (!finalPrompt) return;

    setIsGenerating(true); setGenError('');
    try {
      const result = await generateHairstyle(uploadedImageUrl, finalPrompt);
      if (result.success && result.resultImageUrl) {
        setResultImageUrl(result.resultImageUrl);
        setCtxSelectedStyle(finalStyleName);
        navigate('/results');
      } else {
        setGenError(result.error || 'Failed to generate image.');
        setIsGenerating(false);
      }
    } catch (err) {
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        setGenError(
          'Generation timed out. LightX API took too long. ' +
          'Please try again — it usually works on the second attempt.'
        );
      } else if (!navigator.onLine) {
        setGenError('No internet connection. Please check your network.');
      } else {
        setGenError(
          err.response?.data?.error || 
          'Something went wrong. Please try again.'
        );
      }
      setIsGenerating(false);
    }
  };

  const filteredStyles = hairstyles.filter(h => {
    if (activeTab === 'Men')   return h.gender === 'men'   || h.gender === 'both';
    if (activeTab === 'Women') return h.gender === 'women' || h.gender === 'both';
    return true;
  });

  const genderBadge = (g) =>
    g === 'men'   ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
    g === 'women' ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400' :
                    'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';

  const hasSelection = selectedCardId !== null || customText.trim().length > 0;
  const selectedObj  = hairstyles.find(h => h.id === selectedCardId);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <Navbar />

      {/* pb-28 on mobile so fixed button doesn't cover content */}
      <main className="flex-grow pt-6 sm:pt-10 pb-28 md:pb-24 max-w-4xl mx-auto px-4 w-full">

        {/* Step breadcrumb */}
        <div className="flex items-center justify-center gap-3 mb-6 text-sm font-medium text-gray-400 dark:text-gray-500">
          <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
            <CheckCircle size={14} /> <span className="line-through">Upload</span>
          </div>
          <span>→</span>
          <div className="text-purple-600 dark:text-purple-400 font-bold">Pick Style</div>
          <span>→</span>
          <div>Result</div>
        </div>

        {/* Photo reminder */}
        <div className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-white dark:border-gray-900 ring-2 ring-green-100 dark:ring-green-900/30 shrink-0">
              <img src={uploadedImageUrl || '/placeholder.jpg'} alt="Your photo" className="w-full h-full object-cover" />
            </div>
            <p className="text-sm font-bold text-green-600 dark:text-green-400 flex items-center gap-1">
              Photo ready <CheckCircle size={13} />
            </p>
          </div>
          <button onClick={() => navigate('/upload')} className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline min-h-[44px] flex items-center px-2">
            Change
          </button>
        </div>

        {/* Face shape */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 mb-6 shadow-sm border border-gray-100 dark:border-gray-700 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-indigo-500" />
          {isAnalysing ? (
            <div className="flex flex-col items-center py-3">
              <Search className="text-purple-600 dark:text-purple-400 animate-spin mb-2" size={24} />
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Analysing your face shape…</p>
            </div>
          ) : faceShapeData ? (
            <div className="py-1">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full font-black tracking-widest uppercase text-sm mb-2">
                {faceShapeData.faceShape}
              </div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
                Styles marked <span className="text-yellow-500">⭐</span> are recommended for you
              </p>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-sm">Face shape analysis not available.</p>
          )}
        </div>

        {/* Section heading */}
        <div className="mb-5 text-center">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-1">Choose Your Hairstyle</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Pick a style below or describe your own</p>
        </div>

        {/* Filter tabs — full width equal on mobile */}
        <div className="flex gap-2 mb-6">
          {['All', 'Men', 'Women'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 rounded-full font-bold text-sm transition-all duration-300 min-h-[48px] ${
                activeTab === tab
                  ? 'bg-purple-600 dark:bg-purple-500 text-white shadow-md'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Grid — 2 cols on mobile, 4 on desktop */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-10" key={activeTab}>
          {filteredStyles.map((card, idx) => {
            const isRecommended = faceShapeData?.recommendedStyles?.includes(card.name);
            const isSelected    = selectedCardId === card.id;
            return (
              <div
                key={card.id}
                onClick={() => handleCardClick(card)}
                className={`relative p-3 sm:p-4 rounded-2xl cursor-pointer transition-all duration-200 flex flex-col items-center
                  ${isSelected
                    ? 'bg-purple-50 dark:bg-purple-900/30 border-2 border-purple-600 dark:border-purple-400 scale-[1.03] shadow-md'
                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-md hover:-translate-y-1'
                  }`}
                style={{ animationDelay: `${(idx % 4) * 60}ms` }}
              >
                {isRecommended && (
                  <span className="absolute -top-2 -right-2 bg-yellow-400 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px]">⭐</span>
                )}
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle size={16} className="text-purple-600 dark:text-purple-400" fill="currentColor" />
                  </div>
                )}
                <div className="text-3xl sm:text-4xl mb-2 mt-1">{card.emoji}</div>
                <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white text-center mb-2 leading-tight">{card.name}</h4>
                <div className={`mt-auto text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${genderBadge(card.gender)}`}>
                  {card.gender}
                </div>
              </div>
            );
          })}
        </div>

        {/* OR divider */}
        <div className="flex items-center gap-3 mb-8">
          <div className="h-px bg-gray-200 dark:bg-gray-700 flex-grow" />
          <span className="text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest text-xs sm:text-sm">OR</span>
          <div className="h-px bg-gray-200 dark:bg-gray-700 flex-grow" />
        </div>

        {/* Custom input */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 sm:p-8 border border-gray-200 dark:border-gray-700 shadow-sm mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Edit3 size={18} className="text-purple-600 dark:text-purple-400" />
            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">Describe Any Style</h3>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Type any hairstyle — the more detail the better</p>

          <div className="relative">
            <textarea
              value={customText}
              onChange={handleCustomChange}
              placeholder="e.g. long curly red hair with highlights and curtain bangs..."
              className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-base border border-gray-300 dark:border-gray-600 placeholder-gray-400 dark:placeholder-gray-500 rounded-xl p-4 focus:outline-none focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900/50 resize-none transition-all"
              rows={3}
              maxLength={200}
            />
            <span className={`absolute bottom-3 right-3 text-xs font-semibold ${customText.length > 180 ? 'text-red-500' : 'text-gray-400'}`}>
              {customText.length}/200
            </span>
          </div>

          <div className="mt-4">
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Sparkles size={11} /> Try these:
            </p>
            {/* Horizontal scroll on mobile */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {['long wavy blonde', 'short buzz cut', 'box braids', 'curtain bangs brown', 'pixie cut red'].map(pill => (
                <button
                  key={pill}
                  onClick={() => { setCustomText(pill); setSelectedCardId(null); }}
                  className="shrink-0 px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-full hover:border-purple-400 dark:hover:border-purple-500 hover:text-purple-600 dark:hover:text-purple-400 text-xs font-medium transition-colors min-h-[36px]"
                >
                  {pill}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Selection summary */}
        <div className={`mb-4 px-5 py-3 bg-purple-50 dark:bg-purple-900/30 rounded-xl border border-purple-100 dark:border-purple-800 text-purple-800 dark:text-purple-300 text-sm font-medium flex items-center gap-2 transition-all duration-300 ${hasSelection ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
          {selectedCardId
            ? <><Scissors size={15} /> Selected: <span className="font-bold">{selectedObj?.name}</span></>
            : <><Edit3 size={15} /> Custom: <span className="italic truncate max-w-[180px]">{customText}</span></>
          }
        </div>

        {genError && <p className="text-red-500 dark:text-red-400 text-sm font-semibold text-center mb-4">{genError}</p>}

        {/* Desktop generate button (inline) */}
        <div className="hidden md:flex justify-center mb-4">
          <button
            onClick={handleGenerate}
            disabled={!hasSelection || isGenerating}
            className={`px-12 py-5 rounded-full text-lg font-black transition-all duration-300 flex items-center gap-2 min-h-[56px] ${
              hasSelection && !isGenerating
                ? 'bg-purple-600 dark:bg-purple-500 text-white hover:bg-purple-700 dark:hover:bg-purple-400 shadow-xl hover:-translate-y-1 active:scale-95'
                : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-500 cursor-not-allowed'
            }`}
          >
            {isGenerating ? 'Generating…' : '✨ Generate My New Look →'}
          </button>
        </div>

      </main>

      <Footer />

      {/* Fixed bottom generate button — mobile only */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 md:hidden z-30 safe-area-pb">
        <button
          onClick={handleGenerate}
          disabled={!hasSelection || isGenerating}
          className={`w-full py-4 rounded-full text-base font-black transition-all duration-300 min-h-[52px] flex items-center justify-center gap-2 ${
            hasSelection && !isGenerating
              ? 'bg-purple-600 dark:bg-purple-500 text-white active:scale-95'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
          }`}
        >
          {isGenerating ? 'Generating…' : '✨ Generate My New Look →'}
        </button>
      </div>

      {/* Loading overlay */}
      {isGenerating && (
        <div className="fixed inset-0 z-50 bg-black/50 dark:bg-black/70 flex justify-center items-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 mx-4 w-full max-w-sm text-center shadow-2xl border border-gray-100 dark:border-gray-700 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-purple-500 animate-pulse" />
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center mb-5 mx-auto relative">
              <Scissors className="text-purple-600 dark:text-purple-400 animate-[spin_3s_linear_infinite]" size={36} />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mb-2">Creating your look…</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">This takes about 10–15 seconds</p>
            <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full mb-4 overflow-hidden">
              <div className="bg-purple-600 dark:bg-purple-400 h-full rounded-full" style={{ width:'90%', transition:'width 12s ease-out' }} />
            </div>
            <p className="text-purple-600 dark:text-purple-400 font-bold text-sm animate-pulse">{tips[tipIndex]}</p>
          </div>
        </div>
      )}
    </div>
  );
}
