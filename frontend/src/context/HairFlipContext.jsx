import { createContext, useContext, useState } from 'react';

const HairFlipContext = createContext(null);

export function HairFlipProvider({ children }) {
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const [selectedStyle, setSelectedStyle]       = useState(null);
  const [resultImageUrl, setResultImageUrl]     = useState(null);
  const [faceShape, setFaceShape]               = useState(null);
  const [sessionHistory, setSessionHistory]     = useState([]);

  /**
   * Add a result entry to session history (max 10, newest first).
   * @param {{ imageUrl: string, style: string, resultUrl: string }} result
   */
  const addToHistory = (result) => {
    setSessionHistory((prev) => [result, ...prev].slice(0, 10));
  };

  /** Reset all state — useful when user starts over */
  const resetSession = () => {
    setUploadedImageUrl(null);
    setSelectedStyle(null);
    setResultImageUrl(null);
    setFaceShape(null);
  };

  return (
    <HairFlipContext.Provider
      value={{
        uploadedImageUrl,  setUploadedImageUrl,
        selectedStyle,     setSelectedStyle,
        resultImageUrl,    setResultImageUrl,
        faceShape,         setFaceShape,
        sessionHistory,    addToHistory,
        resetSession,
      }}
    >
      {children}
    </HairFlipContext.Provider>
  );
}

/** Custom hook — throws if used outside provider */
export function useHairFlip() {
  const ctx = useContext(HairFlipContext);
  if (!ctx) throw new Error('useHairFlip must be used inside <HairFlipProvider>');
  return ctx;
}
