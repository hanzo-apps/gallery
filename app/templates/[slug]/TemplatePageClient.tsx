'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
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

  // Navigate to random template
  function goToRandomTemplate() {
    const currentSlug = variants[0].slug;
    const otherTemplates = allTemplates.filter(t => t.slug !== currentSlug);
    if (otherTemplates.length > 0) {
      const randomTemplate = otherTemplates[Math.floor(Math.random() * otherTemplates.length)];
      router.push(`/templates/${randomTemplate.slug}`);
    }
  }

  // Hanzo App URL
  const HANZO_APP_URL = process.env.NEXT_PUBLIC_HANZO_APP_URL || 'https://hanzo.app';

  // Get GitHub repository URL
  function getRepoUrl() {
    return `https://github.com/hanzo-apps/${selectedVariant.slug}`;
  }

  // Open GitHub repository
  function openGitHubRepo() {
    window.open(getRepoUrl(), '_blank');
  }

  // Deploy to Hanzo Cloud
  function deployToCloud() {
    const deployUrl = new URL('/dev', HANZO_APP_URL);
    deployUrl.searchParams.set('template', getRepoUrl());
    deployUrl.searchParams.set('action', 'deploy');
    window.location.href = deployUrl.toString();
  }

  // Edit in Hanzo
  function editInHanzo() {
    const editUrl = new URL('/dev', HANZO_APP_URL);
    editUrl.searchParams.set('repo', getRepoUrl());
    editUrl.searchParams.set('action', 'edit');
    window.location.href = editUrl.toString();
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
                  className="px-3 py-1.5 border border-neutral-700 rounded-full hover:bg-neutral-800 transition-all text-xs font-medium text-neutral-300 hover:border-[#fd4444]/50 hover:text-[#fd4444]"
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

        {/* Action Buttons */}
        <div className="container mx-auto px-4 py-2 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 min-w-max items-center">
            <button
              onClick={deployToCloud}
              className="px-4 py-2 bg-[#fd4444] hover:bg-[#e03e3e] text-white rounded-full transition-all text-xs font-medium whitespace-nowrap"
            >
              🚀 Deploy to Cloud
            </button>
            <button
              onClick={editInHanzo}
              className="px-4 py-2 border border-[#fd4444] text-[#fd4444] hover:bg-[#fd4444]/10 rounded-full transition-all text-xs font-medium whitespace-nowrap"
            >
              ✏️ Edit in Hanzo
            </button>
            <button
              onClick={openGitHubRepo}
              className="px-4 py-2 border border-neutral-700 rounded-full hover:bg-neutral-800 transition-all text-xs font-medium text-neutral-300 whitespace-nowrap"
            >
              📦 GitHub
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(getRepoUrl());
                alert('Repository URL copied!');
              }}
              className="px-4 py-2 border border-neutral-700 rounded-full hover:bg-neutral-800 transition-all text-xs font-medium text-neutral-300 whitespace-nowrap"
            >
              📋 Copy URL
            </button>
            <span className="px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-full text-xs font-medium text-neutral-400 whitespace-nowrap">
              {selectedVariant.framework}
            </span>
            <span className="px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-full text-xs font-medium text-neutral-400 whitespace-nowrap">
              {selectedVariant.category}
            </span>
            <span className={`px-4 py-2 border rounded-full text-xs font-medium whitespace-nowrap ${
              selectedVariant.tier === 1 ? 'border-[#fd4444] bg-[#fd4444]/10 text-[#fd4444]' :
              selectedVariant.tier === 2 ? 'border-neutral-600 bg-neutral-800 text-neutral-300' :
              'border-neutral-700 bg-neutral-900 text-neutral-400'
            }`}>
              Tier {selectedVariant.tier}
            </span>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <h1 className="text-5xl md:text-6xl font-medium text-white">
              {selectedVariant.displayName}
            </h1>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={`text-2xl ${i < selectedVariant.rating ? 'text-[#fd4444]' : 'text-neutral-700'}`}>
                  ★
                </span>
              ))}
            </div>
          </div>
          <p className="text-xl text-neutral-400 mb-8">
            {selectedVariant.description || `Premium ${selectedVariant.displayName} template with modern design and functionality.`}
          </p>

          {/* Variant Selector (if multiple variants) */}
          {variants.length > 1 && (
            <div className="mb-8">
              <label className="block text-sm font-medium text-neutral-400 mb-3">
                Choose Framework ({variants.length} variants available)
              </label>
              <div className="flex flex-wrap gap-3">
                {variants.map((variant, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedVariant(variant)}
                    className={`px-6 py-3 rounded-xl font-medium transition-all ${
                      selectedVariant.id === variant.id
                        ? 'bg-[#fd4444] text-white border-2 border-[#fd4444]'
                        : 'bg-neutral-900 text-neutral-300 border-2 border-neutral-800 hover:border-[#fd4444]/50 hover:bg-neutral-800'
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
            <span className="px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-300 font-medium">
              {selectedVariant.framework}
            </span>
            <span className={`px-4 py-2 rounded-xl font-medium ${
              selectedVariant.tier === 1 ? 'bg-[#fd4444]/10 border border-[#fd4444]/30 text-[#fd4444]' :
              selectedVariant.tier === 2 ? 'bg-neutral-800 border border-neutral-700 text-neutral-300' :
              'bg-neutral-900 border border-neutral-800 text-neutral-400'
            }`}>
              Tier {selectedVariant.tier} - {selectedVariant.tier === 1 ? 'Excellent' : selectedVariant.tier === 2 ? 'Very Good' : 'Good'}
            </span>
            <span className="px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-300 font-medium">
              {selectedVariant.components}
            </span>
            <span className="px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-400 font-medium">
              {selectedVariant.category}
            </span>
          </div>

          {/* Screenshot */}
          <div className="relative aspect-video rounded-2xl overflow-hidden border border-neutral-800 mb-16">
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
      <section className="container mx-auto px-4 py-16 bg-neutral-900/50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-medium mb-8 text-white">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedVariant.features.map((feature, i) => (
              <div key={i} className="bg-neutral-900/50 p-6 rounded-xl border border-neutral-800 hover:border-[#fd4444]/50 transition-all">
                <div className="text-2xl mb-3">✨</div>
                <h3 className="text-lg font-medium text-white">{feature}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-medium mb-8 text-white">Technology Stack</h2>
          <div className="bg-neutral-900/50 p-8 rounded-2xl border border-neutral-800">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-lg font-medium text-[#fd4444] mb-2">Framework</h3>
                <p className="text-neutral-300">{selectedVariant.framework}</p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-[#fd4444] mb-2">Use Case</h3>
                <p className="text-neutral-300">{selectedVariant.useCase}</p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-[#fd4444] mb-2">Setup Difficulty</h3>
                <p className="text-neutral-300">
                  {selectedVariant.easeOfSetup}/5 - {selectedVariant.easeOfSetup >= 5 ? 'Very Easy' : selectedVariant.easeOfSetup >= 4 ? 'Easy' : 'Moderate'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Setup */}
      <section className="container mx-auto px-4 py-16 bg-neutral-900/50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-medium mb-8 text-white">Quick Start</h2>
          <div className="bg-black/50 p-8 rounded-2xl border border-neutral-800 font-mono">
            <div className="text-neutral-500 mb-4"># Clone the template</div>
            <div className="text-[#fd4444] mb-6">git clone {getRepoUrl()}</div>

            <div className="text-neutral-500 mb-4"># Install dependencies</div>
            <div className="text-[#fd4444] mb-6">pnpm install</div>

            <div className="text-neutral-500 mb-4"># Start development server</div>
            <div className="text-[#fd4444] mb-6">
              {selectedVariant.framework.toLowerCase().includes('html') ? 'gulp' :
               selectedVariant.framework.toLowerCase().includes('react') && !selectedVariant.framework.toLowerCase().includes('next') ? 'pnpm start' :
               'pnpm dev'}
            </div>

            {selectedVariant.port && (
              <>
                <div className="text-neutral-500 mb-4"># Open in browser</div>
                <div className="text-[#fd4444]">http://localhost:{selectedVariant.port}</div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-medium mb-8 text-white">Perfect For</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-neutral-900/50 p-6 rounded-xl border border-neutral-800">
              <div className="text-3xl mb-3">🚀</div>
              <h3 className="text-lg font-medium text-white mb-2">{selectedVariant.useCase}</h3>
              <p className="text-sm text-neutral-500">Primary use case for this template</p>
            </div>
            <div className="bg-neutral-900/50 p-6 rounded-xl border border-neutral-800">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="text-lg font-medium text-white mb-2">Fast Development</h3>
              <p className="text-sm text-neutral-500">Pre-built components ready to use</p>
            </div>
            <div className="bg-neutral-900/50 p-6 rounded-xl border border-neutral-800">
              <div className="text-3xl mb-3">🎨</div>
              <h3 className="text-lg font-medium text-white mb-2">Modern Design</h3>
              <p className="text-sm text-neutral-500">Beautiful UI following latest trends</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="bg-neutral-900/50 p-12 rounded-2xl border border-neutral-800 text-center relative overflow-hidden">
            {/* Subtle glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[300px] bg-[#fd4444] opacity-10 blur-[100px] rounded-full" />

            <div className="relative">
              <h2 className="text-3xl font-medium mb-4 text-white">Deploy Instantly</h2>
              <p className="text-lg text-neutral-400 mb-8">
                One-click deployment to Hanzo Cloud
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <button
                  onClick={deployToCloud}
                  className="px-6 py-3 bg-[#fd4444] hover:bg-[#e03e3e] text-white font-medium rounded-full transition-colors flex items-center gap-2"
                >
                  🚀 Deploy Now
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
                <button
                  onClick={editInHanzo}
                  className="px-6 py-3 border border-[#fd4444] text-[#fd4444] hover:bg-[#fd4444]/10 font-medium rounded-full transition-colors"
                >
                  ✏️ Edit in Hanzo
                </button>
                <button
                  onClick={openGitHubRepo}
                  className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white font-medium rounded-full transition-colors"
                >
                  📦 View on GitHub
                </button>
                <Link
                  href="/gallery"
                  className="px-6 py-3 bg-transparent border border-neutral-700 hover:border-neutral-600 hover:bg-white/5 text-white font-medium rounded-full transition-colors"
                >
                  Browse More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-800 bg-[#0a0a0a] py-8">
        <div className="container mx-auto px-4 text-center text-neutral-600">
          <p>© 2016-2026 Hanzo AI Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
