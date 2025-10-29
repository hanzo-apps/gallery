'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface Template {
  id: number;
  name: string;
  displayName: string;
  path: string;
  framework: string;
  rating: number;
  features: string[];
  components: string;
  easeOfSetup: number;
  useCase: string;
  tier: number;
  hasScreenshot: boolean;
  description?: string;
  updatedDate?: string;
  setupInstructions?: string[];
}

// Same templates array from main page (in production, this would come from a shared data file)
const templates: Template[] = [
  // Tier 1 - Excellent (5 stars)
  {
    id: 1,
    name: 'brainwave-update-May2024',
    displayName: 'Brainwave',
    path: 'brainwave-update-May2024',
    framework: 'Next.js 14.2 + TS',
    rating: 5,
    features: ['AI Chat', 'Audio/Video', 'Photo Edit', 'Pricing'],
    components: '50+ comp',
    easeOfSetup: 5,
    useCase: 'AI SaaS platforms',
    tier: 1,
    hasScreenshot: true,
    description: 'Modern AI SaaS platform with chat, audio/video processing, and photo editing capabilities. Built with Next.js 14.2 and TypeScript for optimal performance.',
    updatedDate: '2024-05-01',
    setupInstructions: [
      'cd /Users/z/work/hanzo/templates/brainwave-update-May2024',
      'npm install',
      'npm run dev',
      'Open http://localhost:3000'
    ],
  },
  // Add other templates here (abbreviated for brevity)
];

export default function TemplateDetail() {
  const params = useParams();
  const templateId = parseInt(params.id as string);
  const template = templates.find((t) => t.id === templateId);

  if (!template) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Template Not Found</h1>
          <Link
            href="/"
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors inline-block"
          >
            Back to Gallery
          </Link>
        </div>
      </div>
    );
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/10 transition-colors mb-8"
        >
          ← Back to Gallery
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                {template.displayName}
              </h1>
              <p className="text-xl text-gray-400">{template.framework}</p>
            </div>
            <div className="flex gap-2">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={`text-2xl ${i < template.rating ? 'text-yellow-400' : 'text-gray-600'}`}>
                  ★
                </span>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-300 text-sm">
              Tier {template.tier}
            </span>
            <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-300 text-sm">
              {template.components}
            </span>
            <span className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-lg text-green-300 text-sm">
              Setup: {template.easeOfSetup}/5
            </span>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Screenshot */}
          <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 overflow-hidden">
            <div className="relative aspect-video">
              {template.hasScreenshot ? (
                <Image
                  src={`/screenshots/${template.name}.png`}
                  alt={template.displayName}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  Screenshot pending
                </div>
              )}
            </div>
          </div>

          {/* Info Panel */}
          <div className="space-y-6">
            {/* Description */}
            <div className="bg-white/5 backdrop-blur-lg p-6 rounded-xl border border-white/10">
              <h2 className="text-2xl font-bold mb-3 text-white">Description</h2>
              <p className="text-gray-300 leading-relaxed">
                {template.description || 'No description available.'}
              </p>
            </div>

            {/* Use Case */}
            <div className="bg-white/5 backdrop-blur-lg p-6 rounded-xl border border-white/10">
              <h2 className="text-2xl font-bold mb-3 text-white">Best For</h2>
              <p className="text-gray-300">{template.useCase}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => copyToClipboard(`/Users/z/work/hanzo/templates/${template.path}`)}
                className="w-full px-6 py-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium text-lg flex items-center justify-center gap-2"
              >
                📋 Copy Template Path
              </button>
              <button
                onClick={() => {
                  alert('Fork on Hanzo feature coming soon! This would deploy the template to Hanzo Platform.');
                }}
                className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all font-medium text-lg flex items-center justify-center gap-2"
              >
                🚀 Fork on Hanzo
              </button>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white/5 backdrop-blur-lg p-6 rounded-xl border border-white/10 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-white">Features</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {template.features.map((feature, i) => (
              <div
                key={i}
                className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-center text-gray-300 hover:bg-white/10 transition-colors"
              >
                {feature}
              </div>
            ))}
          </div>
        </div>

        {/* Setup Instructions */}
        {template.setupInstructions && (
          <div className="bg-white/5 backdrop-blur-lg p-6 rounded-xl border border-white/10 mb-8">
            <h2 className="text-2xl font-bold mb-4 text-white">Setup Instructions</h2>
            <div className="space-y-3">
              {template.setupInstructions.map((instruction, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-blue-500/20 border border-blue-500/30 rounded-full flex items-center justify-center text-blue-300 text-sm">
                    {i + 1}
                  </span>
                  <code className="flex-1 px-4 py-2 bg-black/30 rounded-lg text-gray-300 font-mono text-sm">
                    {instruction}
                  </code>
                  <button
                    onClick={() => copyToClipboard(instruction)}
                    className="flex-shrink-0 px-3 py-2 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/10 transition-colors text-sm"
                  >
                    📋
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tech Stack */}
        <div className="bg-white/5 backdrop-blur-lg p-6 rounded-xl border border-white/10">
          <h2 className="text-2xl font-bold mb-4 text-white">Tech Stack</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-300 mb-2">Framework</h3>
              <p className="text-blue-400">{template.framework}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-300 mb-2">Components</h3>
              <p className="text-gray-300">{template.components}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-300 mb-2">Last Updated</h3>
              <p className="text-gray-300">{template.updatedDate || 'N/A'}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-300 mb-2">Ease of Setup</h3>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={i < template.easeOfSetup ? 'text-green-400' : 'text-gray-600'}>
                    ●
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
