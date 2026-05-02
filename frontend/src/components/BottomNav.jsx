import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const tabs = [
  { path: '/',               icon: '🏠', label: 'Home'   },
  { path: '/upload',         icon: '📸', label: 'Upload' },
  { path: '/style-selector', icon: '💇', label: 'Styles' },
  { path: '/results',        icon: '✨', label: 'Result' },
];

export default function BottomNav() {
  const location = useLocation();

  // Only show on app pages, not the landing page
  if (location.pathname === '/') return null;

  return (
    <nav className="
      fixed bottom-0 left-0 right-0
      bg-white dark:bg-gray-900
      border-t border-gray-200 dark:border-gray-700
      flex items-stretch justify-around
      h-16
      md:hidden
      z-40
      safe-area-pb
    ">
      {tabs.map(tab => {
        const isActive = location.pathname === tab.path;
        return (
          <Link
            key={tab.path}
            to={tab.path}
            className="
              relative flex flex-col items-center justify-center
              flex-1 h-full gap-0.5 pt-1
              transition-colors duration-200
            "
          >
            <span className={`text-xl transition-transform duration-200 ${isActive ? 'scale-110' : 'scale-100'}`}>
              {tab.icon}
            </span>
            <span className={`
              text-[10px] font-semibold leading-none
              ${isActive
                ? 'text-purple-600 dark:text-purple-400'
                : 'text-gray-400 dark:text-gray-500'
              }
            `}>
              {tab.label}
            </span>
            {isActive && (
              <span className="
                absolute top-0 left-1/2 -translate-x-1/2
                w-8 h-0.5
                bg-purple-600 dark:bg-purple-400
                rounded-full
              " />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
