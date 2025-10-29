'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { templates } from './templates-data';
import { getUniqueTemplates } from './lib/template-utils';
import type { Template } from './templates-data';

export default function NotFound() {
  const [randomTemplate, setRandomTemplate] = useState<Template | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Get a random template
  function getRandomTemplate(): Template {
    const uniqueTemplates = getUniqueTemplates(templates);
    return uniqueTemplates[Math.floor(Math.random() * uniqueTemplates.length)];
  }

  // Initialize with a random template
  useEffect(() => {
    setRandomTemplate(getRandomTemplate());
  }, []);

  // Generate new random template
  function generateNewRandom() {
    setIsAnimating(true);
    setTimeout(() => {
      setRandomTemplate(getRandomTemplate());
      setIsAnimating(false);
    }, 200);
  }

  if (!randomTemplate) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-neutral-700 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-4">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl w-full">
        {/* 404 Header */}
        <div className="text-center mb-12">
          <h1 className="text-9xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4 animate-pulse">
            404
          </h1>
          <h2 className="text-3xl font-bold text-neutral-300 mb-3">
            Oops! Template Not Found
          </h2>
          <p className="text-lg text-neutral-500 mb-8">
            The template you&apos;re looking for doesn&apos;t exist. But don&apos;t worry—we&apos;ve got plenty more!
          </p>
        </div>

        {/* Random Template Suggestion */}
        <div className={`bg-gradient-to-br from-neutral-900/50 to-neutral-800/50 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl transition-all duration-300 ${
          isAnimating ? 'scale-95 opacity-50' : 'scale-100 opacity-100'
        }`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="text-3xl">✨</div>
            <h3 className="text-2xl font-bold">How about this instead?</h3>
          </div>

          {/* Template Preview Card */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Screenshot */}
            <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10 shadow-lg">
              <Image
                src={`/screenshots/${randomTemplate.screenshot}.png`}
                alt={randomTemplate.displayName}
                fill
                unoptimized
                className="object-cover"
              />
            </div>

            {/* Template Info */}
            <div className="flex flex-col justify-center">
              <h4 className="text-3xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {randomTemplate.displayName}
              </h4>
              <p className="text-neutral-400 mb-4 line-clamp-3">
                {randomTemplate.description || `Premium ${randomTemplate.displayName} template with modern design and functionality.`}
              </p>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-300 text-sm font-medium">
                  {randomTemplate.framework}
                </span>
                <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-300 text-sm font-medium">
                  {randomTemplate.category}
                </span>
                <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
                  randomTemplate.tier === 1 ? 'bg-green-500/20 border border-green-500/30 text-green-300' :
                  randomTemplate.tier === 2 ? 'bg-blue-500/20 border border-blue-500/30 text-blue-300' :
                  'bg-purple-500/20 border border-purple-500/30 text-purple-300'
                }`}>
                  Tier {randomTemplate.tier}
                </span>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={`text-xl ${i < randomTemplate.rating ? 'text-yellow-400' : 'text-gray-600'}`}>
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-sm text-neutral-500">({randomTemplate.rating}/5)</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href={`/templates/${randomTemplate.slug}`}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-lg font-bold rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg shadow-blue-500/50 hover:shadow-blue-500/70 hover:scale-105"
            >
              🚀 View This Template
            </Link>
            <button
              onClick={generateNewRandom}
              disabled={isAnimating}
              className="px-8 py-4 bg-white/5 border border-white/20 text-white text-lg font-bold rounded-xl hover:bg-white/10 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🎲 Show Another Random
            </button>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-wrap gap-4 justify-center mt-12">
          <Link
            href="/gallery"
            className="px-6 py-3 bg-neutral-800/50 border border-neutral-700 text-neutral-300 font-medium rounded-xl hover:bg-neutral-700/50 hover:border-neutral-600 transition-all"
          >
            ← Browse All Templates
          </Link>
          <Link
            href="/"
            className="px-6 py-3 bg-neutral-800/50 border border-neutral-700 text-neutral-300 font-medium rounded-xl hover:bg-neutral-700/50 hover:border-neutral-600 transition-all"
          >
            🏠 Go Home
          </Link>
        </div>

        {/* Fun Facts */}
        <div className="text-center mt-12">
          <p className="text-sm text-neutral-600">
            💡 Fun fact: We have {getUniqueTemplates(templates).length} amazing templates waiting for you!
          </p>
        </div>
      </div>
    </div>
  );
}
