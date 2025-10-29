'use client';

import Link from 'next/link';
import { HanzoLogo } from '@hanzo/logo/react';

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-lg border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <HanzoLogo variant="white" size={32} />
          <span className="text-xl font-bold text-white">Templates</span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/gallery"
            className="text-gray-300 hover:text-white transition-colors"
          >
            Browse
          </Link>
          <Link
            href="/docs"
            className="text-gray-300 hover:text-white transition-colors"
          >
            Docs
          </Link>
          <a
            href="https://github.com/hanzoai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-300 hover:text-white transition-colors"
          >
            GitHub
          </a>
          <a
            href="https://hanzo.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold text-white hover:from-purple-600 hover:to-pink-600 transition-all hover:scale-105"
          >
            Hanzo AI
          </a>
        </nav>

        {/* Mobile menu button */}
        <button className="md:hidden p-2 text-gray-300 hover:text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </header>
  );
}
