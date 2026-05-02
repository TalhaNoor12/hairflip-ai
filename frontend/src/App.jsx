import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HairFlipProvider } from './context/HairFlipContext';
import { ThemeProvider } from './context/ThemeContext';
import LandingPage from './pages/LandingPage';
import UploadPage from './pages/UploadPage';
import StyleSelectorPage from './pages/StyleSelectorPage';
import ResultsPage from './pages/ResultsPage';
import BottomNav from './components/BottomNav';

function App() {
  return (
    <ThemeProvider>
      <HairFlipProvider>
        <Router>
          <div className="overflow-x-hidden">
            <Routes>
              <Route path="/"               element={<LandingPage />} />
              <Route path="/upload"         element={<UploadPage />} />
              <Route path="/style-selector" element={<StyleSelectorPage />} />
              <Route path="/results"        element={<ResultsPage />} />
            </Routes>
            {/* Mobile bottom nav — auto-hides on landing page */}
            <BottomNav />
          </div>
        </Router>
      </HairFlipProvider>
    </ThemeProvider>
  );
}

export default App;
