import React from 'react';

const Footer = () => (
  <footer className="
    bg-gray-900 dark:bg-gray-950 
    border-t border-gray-800 dark:border-gray-900 
    py-16 relative
  ">
    {/* Purple top divider */}
    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-40" />

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid md:grid-cols-3 gap-12 items-center text-center md:text-left">
        {/* Brand */}
        <div className="space-y-3">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <span className="text-2xl">✂️</span>
            <span className="text-2xl font-black tracking-tight text-white">HairFlip</span>
          </div>
          <p className="text-gray-400 text-sm">AI-powered hairstyle try-on for everyone.</p>
        </div>

        {/* Copyright */}
        <p className="text-gray-400 text-sm">
          © 2025 HairFlip. Made with ❤️ for people who love great hair.
        </p>

        {/* Links */}
        <div className="flex justify-center md:justify-end gap-6 text-gray-400 text-sm">
          <a href="#" className="hover:text-white hover:underline underline-offset-4 transition-all">Privacy Policy</a>
          <span className="opacity-30">·</span>
          <a href="#" className="hover:text-white hover:underline underline-offset-4 transition-all">Contact</a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
