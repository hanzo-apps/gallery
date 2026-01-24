'use client';

import Link from 'next/link';
import { HanzoLogo } from '@hanzo/logo/react';

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-lg border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <HanzoLogo variant="white" size={28} />
          <span className="text-lg font-medium text-white tracking-tight">Templates</span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            href="/gallery"
            className="px-4 py-2 text-sm text-neutral-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
          >
            Browse
          </Link>
          <Link
            href="/docs"
            className="px-4 py-2 text-sm text-neutral-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
          >
            Docs
          </Link>
          <a
            href="https://github.com/hanzo-apps"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 text-sm text-neutral-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
          >
            GitHub
          </a>
          <div className="w-px h-6 bg-neutral-800 mx-2" />
          <a
            href="https://hanzo.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 text-sm font-medium text-white bg-[#fd4444] hover:bg-[#e03e3e] rounded-full transition-colors flex items-center gap-2"
          >
            Try Hanzo
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </nav>

        {/* Mobile menu button */}
        <button className="md:hidden p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-white/5">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </header>
  );
}
