import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const closeMenu = () => setMobileMenuOpen(false);

  const linkCls =
    'text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200 font-medium';

  return (
    <>
      {/* ── Top bar ─────────────────────────────────────────── */}
      <nav className={`
        sticky top-0 z-50
        bg-white dark:bg-gray-900
        border-b border-gray-100 dark:border-gray-800
        transition-all duration-300
        ${isScrolled ? 'shadow-md backdrop-blur-xl bg-white/90 dark:bg-gray-900/90' : ''}
      `}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 sm:h-20 items-center">

            {/* Logo */}
            <div
              className="flex items-center gap-2 cursor-pointer shrink-0"
              onClick={() => { closeMenu(); navigate('/'); }}
            >
              <span className="text-xl sm:text-2xl">✂️</span>
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-purple-600 dark:text-purple-400">
                HairFlip
              </span>
            </div>

            {/* Desktop links */}
            <div className="hidden md:flex items-center gap-8">
              <a href="/#how-it-works" className={linkCls}>How It Works</a>
              <a href="/#features"     className={linkCls}>Features</a>
              <div className="flex items-center gap-3">
                <ThemeToggle />
                <button
                  onClick={() => navigate('/upload')}
                  className="
                    bg-purple-600 dark:bg-purple-500
                    hover:bg-purple-700 dark:hover:bg-purple-400
                    text-white font-bold px-5 py-2.5 rounded-xl
                    transition-colors duration-200 text-sm
                    min-h-[44px]
                  "
                >
                  Try Now
                </button>
              </div>
            </div>

            {/* Mobile: theme toggle + hamburger */}
            <div className="md:hidden flex items-center gap-3">
              <ThemeToggle />
              <button
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                onClick={() => setMobileMenuOpen(prev => !prev)}
                className="
                  text-gray-900 dark:text-gray-50
                  p-2 rounded-lg
                  hover:bg-gray-100 dark:hover:bg-gray-800
                  transition-colors duration-200
                  min-h-[44px] min-w-[44px]
                  flex items-center justify-center
                "
              >
                {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Full-screen mobile menu ──────────────────────────── */}
      {mobileMenuOpen && (
        <div className="
          fixed inset-0 z-40
          bg-white dark:bg-gray-900
          md:hidden
          flex flex-col
          animate-mobile-menu
          overflow-y-auto
        " style={{ top: '64px' }}>
          <nav className="flex flex-col px-4 pt-4 pb-8">
            {[
              { label: 'How It Works', href: '/#how-it-works' },
              { label: 'Features',     href: '/#features' },
            ].map(item => (
              <a
                key={item.label}
                href={item.href}
                onClick={closeMenu}
                className="
                  py-4 text-lg font-medium
                  text-gray-800 dark:text-gray-200
                  border-b border-gray-100 dark:border-gray-800
                  min-h-[56px] flex items-center
                  transition-colors duration-150
                  hover:text-purple-600 dark:hover:text-purple-400
                "
              >
                {item.label}
              </a>
            ))}

            <Link
              to="/upload"
              onClick={closeMenu}
              className="
                mt-6 w-full text-center
                bg-purple-600 dark:bg-purple-500
                hover:bg-purple-700 dark:hover:bg-purple-400
                text-white
                py-4 rounded-full text-lg font-semibold
                transition-colors duration-200
                min-h-[56px] flex items-center justify-center
              "
            >
              Try Now — It's Free ✨
            </Link>

            {/* Bottom padding for safe area */}
            <div className="safe-area-pb" />
          </nav>
        </div>
      )}
    </>
  );
};

export default Navbar;
