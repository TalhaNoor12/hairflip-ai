import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import StepProgress from '../components/StepProgress';
import { useHairFlip } from '../context/HairFlipContext';
import { uploadPhoto } from '../api/uploadApi';

const MAX_MB   = 5;
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp'];

const fmtSize = (bytes) =>
  bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(0)} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

const Spinner = () => (
  <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"
      strokeDasharray="31.4" strokeDashoffset="10" />
  </svg>
);

const TipCard = ({ emoji, title, desc }) => (
  <div className="w-full bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4 flex items-start gap-3">
    <span className="text-2xl shrink-0">{emoji}</span>
    <div>
      <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-0.5">{title}</h3>
      <p className="text-gray-500 dark:text-gray-400 text-sm leading-snug">{desc}</p>
    </div>
  </div>
);

const UploadPage = () => {
  const navigate = useNavigate();
  const { setUploadedImageUrl } = useHairFlip();
  const fileInputRef    = useRef(null);
  const cameraInputRef  = useRef(null);
  const galleryInputRef = useRef(null);

  const [dragging, setDragging]   = useState(false);
  const [photo, setPhoto]         = useState(null);
  const [error, setError]         = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);

  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(''), 3000);
    return () => clearTimeout(t);
  }, [error]);

  useEffect(() => {
    return () => { if (photo?.previewUrl) URL.revokeObjectURL(photo.previewUrl); };
  }, [photo]);

  const processFile = useCallback((file) => {
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) {
      setError('❌ Please upload a JPG, PNG, or WebP image');
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`❌ File too large. Max ${MAX_MB} MB`);
      return;
    }
    setError('');
    setPhoto({ file, previewUrl: URL.createObjectURL(file), name: file.name, size: file.size });
  }, []);

  const onDragOver  = (e) => e.preventDefault();
  const onDragEnter = (e) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = (e) => { e.preventDefault(); setDragging(false); };
  const onDrop      = (e) => { e.preventDefault(); setDragging(false); processFile(e.dataTransfer.files?.[0]); };

  const openPicker   = () => fileInputRef.current?.click();
  const onFileChange = (e) => { processFile(e.target.files?.[0]); e.target.value = ''; };

  const removePhoto = () => {
    if (photo?.previewUrl) URL.revokeObjectURL(photo.previewUrl);
    setPhoto(null); setError(''); setUploadPct(0);
  };

  const handleContinue = async () => {
    if (!photo || uploading) return;
    setUploading(true); setUploadPct(0);
    try {
      const data = await uploadPhoto(photo.file, { onUploadProgress: (pct) => setUploadPct(pct) });
      if (data.success) {
        setUploadedImageUrl(data.imageUrl);
        localStorage.setItem('hairflip_image_url', data.imageUrl);
        if (data.publicId) localStorage.setItem('hairflip_public_id', data.publicId);
        navigate('/style-selector');
      } else {
        setError(`❌ Upload failed: ${data.error || 'Unknown error'}`);
      }
    } catch {
      setError('❌ Could not reach the server. Is the backend running?');
    } finally {
      setUploading(false); setUploadPct(0);
    }
  };

  const canContinue = !!photo && !uploading;

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950 transition-colors duration-300">
      <Navbar />

      {/* Page content — pb-28 on mobile so fixed button doesn't overlap */}
      <main className="flex-1 pt-6 sm:pt-10 pb-28 md:pb-20 px-4">
        <div className="max-w-2xl mx-auto">

          <StepProgress currentStep={1} />

          <div className="text-center mb-6 mt-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 dark:text-white mb-2">
              Upload Your Photo
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-base">
              Choose a clear, front-facing photo for the best results
            </p>
          </div>

          {/* Hidden inputs */}
          <input ref={fileInputRef}    type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onFileChange} />
          <input ref={cameraInputRef}  type="file" accept="image/*" capture="user"          className="hidden" onChange={onFileChange} />
          <input ref={galleryInputRef} type="file" accept="image/*"                         className="hidden" onChange={onFileChange} />

          {/* Drop zone / Preview */}
          {photo ? (
            <div className="relative rounded-2xl overflow-hidden" style={{ minHeight: 260, animation: 'photoReveal 0.35s ease-out both' }}>
              <img src={photo.previewUrl} alt="Selected" className="w-full object-cover rounded-2xl" style={{ minHeight: 260, maxHeight: 440 }} />
              <div className="absolute bottom-0 left-0 right-0 h-24 rounded-b-2xl" style={{ background: 'linear-gradient(to top,rgba(0,0,0,0.65),transparent)' }} />
              <div className="absolute bottom-4 left-4 right-12">
                <p className="text-white font-semibold text-sm truncate">{photo.name}</p>
                <p className="text-white/60 text-xs mt-0.5">{fmtSize(photo.size)}</p>
              </div>
              <button
                onClick={removePhoto}
                className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 text-gray-900 flex items-center justify-center shadow hover:bg-white transition-colors"
              >
                ✕
              </button>
            </div>
          ) : (
            <>
              {/* Drag & drop zone */}
              <div
                onClick={openPicker}
                onDragOver={onDragOver} onDragEnter={onDragEnter}
                onDragLeave={onDragLeave} onDrop={onDrop}
                className={`
                  w-full rounded-2xl flex flex-col items-center justify-center gap-4
                  cursor-pointer select-none transition-all duration-200
                  border-2 border-dashed
                  ${dragging
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 hover:border-purple-400 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                  }
                `}
                style={{ minHeight: 220 }}
              >
                <span className="text-4xl">{dragging ? '📥' : '📁'}</span>
                <div className="text-center px-4">
                  {dragging ? (
                    <p className="font-bold text-base text-purple-600 dark:text-purple-400">Drop it here!</p>
                  ) : (
                    <>
                      <p className="font-bold text-gray-900 dark:text-white text-base mb-1 hidden sm:block">
                        Drag & drop your photo here
                      </p>
                      <p className="font-bold text-gray-900 dark:text-white text-base mb-1 sm:hidden">
                        Tap to select a photo
                      </p>
                      <p className="text-gray-400 dark:text-gray-500 text-sm hidden sm:block">or click to browse</p>
                      <p className="text-gray-400 dark:text-gray-500 text-xs mt-2">JPG, PNG, WebP · Max 5 MB</p>
                    </>
                  )}
                </div>
              </div>

              {/* Mobile camera / gallery buttons */}
              <div className="flex gap-3 mt-4 md:hidden">
                <label className="flex-1 flex items-center justify-center gap-2 border border-purple-300 dark:border-purple-700 text-purple-600 dark:text-purple-400 rounded-xl py-3 text-sm font-semibold cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors min-h-[48px]">
                  📷 Camera
                  <input type="file" accept="image/*" capture="user" className="hidden" onChange={onFileChange} />
                </label>
                <label className="flex-1 flex items-center justify-center gap-2 border border-purple-300 dark:border-purple-700 text-purple-600 dark:text-purple-400 rounded-xl py-3 text-sm font-semibold cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors min-h-[48px]">
                  🖼️ Gallery
                  <input type="file" accept="image/*" className="hidden" onChange={onFileChange} />
                </label>
              </div>
            </>
          )}

          {/* Success badge */}
          {photo && !uploading && (
            <div className="flex items-center justify-center gap-2 mt-3 text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
              <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-xs">✓</span>
              Photo selected
            </div>
          )}

          {/* Upload progress */}
          {uploading && uploadPct > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mb-1">
                <span>Uploading…</span><span>{uploadPct}%</span>
              </div>
              <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-purple-600 dark:bg-purple-400 rounded-full transition-all duration-200" style={{ width: `${uploadPct}%` }} />
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-4 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-400 text-sm font-medium text-center">
              {error}
            </div>
          )}

          {/* Tips */}
          <div className="mt-8">
            <p className="text-xs font-bold tracking-widest uppercase text-gray-400 dark:text-gray-500 text-center mb-3">
              Tips for best results
            </p>
            <div className="flex flex-col gap-3">
              <TipCard emoji="😊" title="Face the Camera" desc="Look directly at the camera with your face fully visible" />
              <TipCard emoji="💡" title="Good Lighting"   desc="Natural light or a well-lit room gives the best results" />
              <TipCard emoji="🚫" title="No Hats or Glasses" desc="Remove headwear for the most accurate style preview" />
            </div>
          </div>

          {/* Privacy notice */}
          <p className="text-center text-gray-400 dark:text-gray-500 text-sm mt-6 leading-relaxed max-w-sm mx-auto">
            🔒 Your photo is processed securely and deleted after 24 hours.
          </p>

          {/* Desktop continue button (inline) */}
          <div className="hidden md:flex mt-8 justify-center">
            {canContinue ? (
              <button
                onClick={handleContinue}
                className="bg-purple-600 dark:bg-purple-500 hover:bg-purple-700 dark:hover:bg-purple-400 text-white rounded-full font-semibold px-10 py-4 transition-all duration-300 min-h-[52px] flex items-center gap-2"
              >
                {uploading ? <><Spinner />{uploadPct > 0 ? `${uploadPct}%` : 'Uploading…'}</> : 'Continue — Choose Your Style →'}
              </button>
            ) : (
              <button disabled className="bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed rounded-full font-semibold px-10 py-4 min-h-[52px]">
                Upload a photo to continue
              </button>
            )}
          </div>

        </div>
      </main>

      {/* Fixed bottom continue button — mobile only */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 md:hidden z-30 safe-area-pb">
        {canContinue ? (
          <button
            onClick={handleContinue}
            className="w-full bg-purple-600 dark:bg-purple-500 hover:bg-purple-700 text-white rounded-full font-semibold py-4 transition-all duration-300 min-h-[52px] flex items-center justify-center gap-2 text-base"
          >
            {uploading ? <><Spinner />{uploadPct > 0 ? `${uploadPct}%` : 'Uploading…'}</> : 'Continue — Choose Your Style →'}
          </button>
        ) : (
          <button disabled className="w-full bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed rounded-full font-semibold py-4 min-h-[52px] text-base">
            Upload a photo to continue
          </button>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default UploadPage;
