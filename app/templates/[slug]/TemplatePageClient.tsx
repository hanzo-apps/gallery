'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { Template } from '../../templates-data';

interface TemplatePageClientProps {
  variants: Template[];
  prevTemplate: Template | null;
  nextTemplate: Template | null;
  currentIndex: number;
  totalTemplates: number;
  allTemplates: Template[];
}

export function TemplatePageClient({ variants, prevTemplate, nextTemplate, currentIndex, totalTemplates, allTemplates }: TemplatePageClientProps) {
  const router = useRouter();
  const [selectedVariant, setSelectedVariant] = useState<Template>(variants[0]);
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildProgress, setBuildProgress] = useState('');
  const [availablePages, setAvailablePages] = useState<string[]>([]);
  const [selectedPage, setSelectedPage] = useState<string>('index.html');

  // Navigate to random template
  function goToRandomTemplate() {
    const currentSlug = variants[0].slug;
    const otherTemplates = allTemplates.filter(t => t.slug !== currentSlug);
    if (otherTemplates.length > 0) {
      const randomTemplate = otherTemplates[Math.floor(Math.random() * otherTemplates.length)];
      router.push(`/templates/${randomTemplate.slug}`);
    }
  }

  // Check for available pages when preview is built
  const checkAvailablePages = useCallback(async () => {
    try {
      const response = await fetch(`/api/list-pages?template=${selectedVariant.name}`);
      if (response.ok) {
        const data = await response.json();
        setAvailablePages(data.pages || []);
      }
    } catch {
      // Preview not built yet
      setAvailablePages([]);
    }
  }, [selectedVariant.name]);

  useEffect(() => {
    checkAvailablePages();
  }, [checkAvailablePages]);

  async function buildAndPreview() {
    setIsBuilding(true);
    setBuildProgress('Checking if template is already built...');

    try {
      const response = await fetch('/api/build-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateName: selectedVariant.name,
          templatePath: selectedVariant.path,
          framework: selectedVariant.framework,
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (data.cached) {
          setBuildProgress('✅ Using cached build');
        } else {
          setBuildProgress('✅ Build complete!');
        }

        // Check for available pages
        await checkAvailablePages();

        // Open preview
        setTimeout(() => {
          window.open(`/previews/${selectedVariant.name}/${selectedPage}`, '_blank');
          setIsBuilding(false);
        }, 500);
      } else {
        setBuildProgress(`❌ Build failed: ${data.error}`);
        setTimeout(() => setIsBuilding(false), 3000);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setBuildProgress(`❌ Error: ${message}`);
      setTimeout(() => setIsBuilding(false), 3000);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Navigation - Airbnb Style */}
      <nav className="border-b border-neutral-800 bg-black sticky top-0 z-50">
        {/* Top Bar */}
        <div className="border-b border-neutral-800">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/gallery" className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Gallery
            </Link>

            <div className="flex items-center gap-3">
              <span className="text-xs text-neutral-500 font-medium">
                {currentIndex} / {totalTemplates}
              </span>
              <div className="flex gap-2">
                {prevTemplate ? (
                  <Link
                    href={`/templates/${prevTemplate.slug}`}
                    className="px-3 py-1.5 border border-neutral-700 rounded-full hover:bg-neutral-800 transition-all text-xs font-medium text-neutral-300"
                  >
                    ←
                  </Link>
                ) : (
                  <button
                    disabled
                    className="px-3 py-1.5 border border-neutral-800 rounded-full text-neutral-700 cursor-not-allowed text-xs"
                  >
                    ←
                  </button>
                )}
                <button
                  onClick={goToRandomTemplate}
                  className="px-3 py-1.5 border border-neutral-700 rounded-full hover:bg-neutral-800 transition-all text-xs font-medium text-neutral-300 hover:border-purple-500/50 hover:text-purple-400"
                  title="Random Template"
                >
                  🎲
                </button>
                {nextTemplate ? (
                  <Link
                    href={`/templates/${nextTemplate.slug}`}
                    className="px-3 py-1.5 border border-neutral-700 rounded-full hover:bg-neutral-800 transition-all text-xs font-medium text-neutral-300"
                  >
                    →
                  </Link>
                ) : (
                  <button
                    disabled
                    className="px-3 py-1.5 border border-neutral-800 rounded-full text-neutral-700 cursor-not-allowed text-xs"
                  >
                    →
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons - Airbnb Style */}
        <div className="container mx-auto px-4 py-2 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 min-w-max items-center">
            {/* Page Selector (if multiple pages available) */}
            {availablePages.length > 1 && (
              <select
                value={selectedPage}
                onChange={(e) => setSelectedPage(e.target.value)}
                className="px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-full hover:bg-neutral-800 transition-all text-xs font-medium text-neutral-300 outline-none cursor-pointer"
              >
                {availablePages.map((page) => (
                  <option key={page} value={page}>
                    {page.replace('.html', '').replace(/-/g, ' ')}
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={buildAndPreview}
              disabled={isBuilding}
              className="px-4 py-2 border border-neutral-700 rounded-full hover:bg-neutral-800 transition-all text-xs font-medium text-neutral-300 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isBuilding ? '⏳ Building...' : '▶️ Live Preview'}
            </button>
            <button
              onClick={() => {
                window.location.href = `/gallery?fork=${selectedVariant.id}`;
              }}
              className="px-4 py-2 border border-neutral-700 rounded-full hover:bg-neutral-800 transition-all text-xs font-medium text-neutral-300 whitespace-nowrap"
            >
              🚀 Deploy
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(selectedVariant.path);
                alert('Path copied!');
              }}
              className="px-4 py-2 border border-neutral-700 rounded-full hover:bg-neutral-800 transition-all text-xs font-medium text-neutral-300 whitespace-nowrap"
            >
              📋 Copy Path
            </button>
            <span className="px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-full text-xs font-medium text-neutral-400 whitespace-nowrap">
              {selectedVariant.framework}
            </span>
            <span className="px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-full text-xs font-medium text-neutral-400 whitespace-nowrap">
              {selectedVariant.category}
            </span>
            <span className={`px-4 py-2 border rounded-full text-xs font-medium whitespace-nowrap ${
              selectedVariant.tier === 1 ? 'border-green-800 bg-green-950 text-green-400' :
              selectedVariant.tier === 2 ? 'border-blue-800 bg-blue-950 text-blue-400' :
              'border-purple-800 bg-purple-950 text-purple-400'
            }`}>
              Tier {selectedVariant.tier}
            </span>
          </div>
        </div>
      </nav>

      {/* Build Progress Modal */}
      {isBuilding && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-neutral-900 border border-neutral-700 rounded-2xl p-8 max-w-md w-full mx-4">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 border-4 border-neutral-700 border-t-blue-500 rounded-full animate-spin"></div>
              <h3 className="text-xl font-bold">Building Template</h3>
              <p className="text-neutral-400 text-center">{buildProgress}</p>
            </div>
          </div>
        </div>
      )}

      {/* Hero */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              {selectedVariant.displayName}
            </h1>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={`text-2xl ${i < selectedVariant.rating ? 'text-yellow-400' : 'text-gray-600'}`}>
                  ★
                </span>
              ))}
            </div>
          </div>
          <p className="text-2xl text-gray-400 mb-8">
            {selectedVariant.description || `Premium ${selectedVariant.displayName} template with modern design and functionality.`}
          </p>

          {/* Variant Selector (if multiple variants) */}
          {variants.length > 1 && (
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-400 mb-3">
                Choose Framework ({variants.length} variants available)
              </label>
              <div className="flex flex-wrap gap-3">
                {variants.map((variant, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedVariant(variant)}
                    className={`px-6 py-3 rounded-lg font-medium transition-all ${
                      selectedVariant.id === variant.id
                        ? 'bg-blue-500 text-white border-2 border-blue-400'
                        : 'bg-white/5 text-gray-300 border-2 border-white/10 hover:border-blue-500/50 hover:bg-white/10'
                    }`}
                  >
                    {variant.framework}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tech Stack Badges */}
          <div className="flex flex-wrap gap-3 mb-12">
            <span className="px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-300 font-medium">
              {selectedVariant.framework}
            </span>
            <span className={`px-4 py-2 rounded-lg font-medium ${
              selectedVariant.tier === 1 ? 'bg-green-500/20 border border-green-500/30 text-green-300' :
              selectedVariant.tier === 2 ? 'bg-blue-500/20 border border-blue-500/30 text-blue-300' :
              'bg-purple-500/20 border border-purple-500/30 text-purple-300'
            }`}>
              Tier {selectedVariant.tier} - {selectedVariant.tier === 1 ? 'Excellent' : selectedVariant.tier === 2 ? 'Very Good' : 'Good'}
            </span>
            <span className="px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-300 font-medium">
              {selectedVariant.components}
            </span>
            <span className="px-4 py-2 bg-gray-500/20 border border-gray-500/30 rounded-lg text-gray-300 font-medium">
              {selectedVariant.category}
            </span>
          </div>

          {/* Screenshot */}
          <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 mb-16 shadow-2xl shadow-blue-500/20">
            <Image
              src={`/screenshots/${selectedVariant.screenshot}.png`}
              alt={selectedVariant.displayName}
              fill
              unoptimized
              className="object-cover"
              priority
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16 bg-white/5">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold mb-8">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {selectedVariant.features.map((feature, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-lg p-6 rounded-xl border border-white/10 hover:border-blue-500/50 transition-all">
                <div className="text-3xl mb-3">✨</div>
                <h3 className="text-xl font-bold mb-2">{feature}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold mb-8">Technology Stack</h2>
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-lg p-8 rounded-2xl border border-white/10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-lg font-bold text-blue-400 mb-2">Framework</h3>
                <p className="text-gray-300">{selectedVariant.framework}</p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-blue-400 mb-2">Use Case</h3>
                <p className="text-gray-300">{selectedVariant.useCase}</p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-blue-400 mb-2">Setup Difficulty</h3>
                <p className="text-gray-300">
                  {selectedVariant.easeOfSetup}/5 - {selectedVariant.easeOfSetup >= 5 ? 'Very Easy' : selectedVariant.easeOfSetup >= 4 ? 'Easy' : 'Moderate'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Setup */}
      <section className="container mx-auto px-4 py-16 bg-white/5">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold mb-8">Quick Start</h2>
          <div className="bg-black/50 backdrop-blur-lg p-8 rounded-2xl border border-white/10 font-mono">
            <div className="text-gray-400 mb-4"># Navigate to template directory</div>
            <div className="text-green-400 mb-6">cd {selectedVariant.path}</div>

            <div className="text-gray-400 mb-4"># Install dependencies</div>
            <div className="text-green-400 mb-6">npm install</div>

            <div className="text-gray-400 mb-4"># Start development server</div>
            <div className="text-green-400 mb-6">
              {selectedVariant.framework.toLowerCase().includes('html') ? 'gulp' :
               selectedVariant.framework.toLowerCase().includes('react') && !selectedVariant.framework.toLowerCase().includes('next') ? 'npm start' :
               'npm run dev'}
            </div>

            {selectedVariant.port && (
              <>
                <div className="text-gray-400 mb-4"># Open in browser</div>
                <div className="text-green-400">http://localhost:{selectedVariant.port}</div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold mb-8">Perfect For</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-6 rounded-xl border border-white/10">
              <div className="text-3xl mb-3">🚀</div>
              <h3 className="text-lg font-bold mb-2">{selectedVariant.useCase}</h3>
              <p className="text-sm text-gray-400">Primary use case for this template</p>
            </div>
            <div className="bg-gradient-to-br from-green-500/10 to-blue-500/10 p-6 rounded-xl border border-white/10">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="text-lg font-bold mb-2">Fast Development</h3>
              <p className="text-sm text-gray-400">Pre-built components ready to use</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-6 rounded-xl border border-white/10">
              <div className="text-3xl mb-3">🎨</div>
              <h3 className="text-lg font-bold mb-2">Modern Design</h3>
              <p className="text-sm text-gray-400">Beautiful UI following latest trends</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-lg p-12 rounded-2xl border border-white/10 text-center">
            <h2 className="text-4xl font-bold mb-6">Get Started with Hanzo AI</h2>
            <p className="text-xl text-gray-400 mb-8">
              This template is part of the Hanzo AI premium template collection
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={buildAndPreview}
                disabled={isBuilding}
                className="px-8 py-4 bg-green-500 text-white text-lg font-bold rounded-xl hover:bg-green-600 transition-all shadow-lg shadow-green-500/50 hover:shadow-green-500/70 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isBuilding ? '⏳ Building...' : '▶️ Live Preview'}
              </button>
              <button
                onClick={() => {
                  // Pass the selected variant to the fork modal
                  window.location.href = `/gallery?fork=${selectedVariant.id}`;
                }}
                className="px-8 py-4 bg-purple-500 text-white text-lg font-bold rounded-xl hover:bg-purple-600 transition-all shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 hover:scale-105"
              >
                🚀 Deploy to Hanzo
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(selectedVariant.path);
                  alert('Path copied to clipboard!');
                }}
                className="px-8 py-4 bg-blue-500 text-white text-lg font-bold rounded-xl hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/50 hover:shadow-blue-500/70 hover:scale-105"
              >
                📋 Copy Path
              </button>
              <Link
                href="/gallery"
                className="px-8 py-4 bg-white/10 border border-white/20 text-white text-lg font-bold rounded-xl hover:bg-white/20 transition-all"
              >
                Browse More Templates
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/50 backdrop-blur-lg py-8">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>© 2025 Hanzo AI Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
