const fs = require('fs');
const path = require('path');

const templatePageCode = (templateName, screenshotName) => `'use client';

import Image from 'next/image';
import Link from 'next/link';
import { templates } from '../../templates-data';

export default function Page() {
  const template = templates.find(t => t.name === '${templateName}')!;
  const variant = template.variants[0];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Navigation */}
      <nav className="border-b border-white/10 bg-black/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="text-blue-400 hover:text-blue-300 transition-colors">
            ← Back to Gallery
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              {template.displayName}
            </h1>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={\`text-2xl \${i < template.rating ? 'text-yellow-400' : 'text-gray-600'}\`}>
                  ★
                </span>
              ))}
            </div>
          </div>
          <p className="text-2xl text-gray-400 mb-8">{template.description || \`Premium \${template.displayName} template with modern design and functionality.\`}</p>

          {/* Tech Stack Badges */}
          <div className="flex flex-wrap gap-3 mb-12">
            <span className="px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-300 font-medium">
              {variant.framework}
            </span>
            <span className={\`px-4 py-2 rounded-lg font-medium \${
              template.tier === 1 ? 'bg-green-500/20 border border-green-500/30 text-green-300' :
              template.tier === 2 ? 'bg-blue-500/20 border border-blue-500/30 text-blue-300' :
              'bg-purple-500/20 border border-purple-500/30 text-purple-300'
            }\`}>
              Tier {template.tier} - {template.tier === 1 ? 'Excellent' : template.tier === 2 ? 'Very Good' : 'Good'}
            </span>
            <span className="px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-300 font-medium">
              {template.components}
            </span>
          </div>

          {/* Variant Selector */}
          {template.variants.length > 1 && (
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Choose Variant ({template.variants.length} available)
              </label>
              <select className="w-full max-w-md px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500/50 transition-colors">
                {template.variants.map((v, i) => (
                  <option key={i} value={i} className="bg-gray-900">
                    {v.displayName} - {v.framework}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Screenshot */}
          <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 mb-16 shadow-2xl shadow-blue-500/20">
            {variant.hasScreenshot ? (
              <Image
                src="/screenshots/${screenshotName}.png"
                alt={template.displayName}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-900/50 text-gray-500">
                Screenshot coming soon
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16 bg-white/5">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold mb-8">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {template.features.map((feature, i) => (
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
                <p className="text-gray-300">{variant.framework}</p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-blue-400 mb-2">Use Case</h3>
                <p className="text-gray-300">{template.useCase}</p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-blue-400 mb-2">Setup Difficulty</h3>
                <p className="text-gray-300">{template.easeOfSetup}/5 - {template.easeOfSetup >= 5 ? 'Very Easy' : template.easeOfSetup >= 4 ? 'Easy' : 'Moderate'}</p>
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
            <div className="text-green-400 mb-6">cd /Users/z/work/hanzo/templates/{variant.path}</div>

            <div className="text-gray-400 mb-4"># Install dependencies</div>
            <div className="text-green-400 mb-6">{variant.framework.includes('HTML') ? 'npm install' : 'npm install'}</div>

            <div className="text-gray-400 mb-4"># Start development server</div>
            <div className="text-green-400 mb-6">{variant.framework.includes('HTML') ? 'gulp' : 'npm run dev'}</div>

            <div className="text-gray-400 mb-4"># Open in browser</div>
            <div className="text-green-400">http://localhost:{variant.port || 3000}</div>
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
              <h3 className="text-lg font-bold mb-2">{template.useCase}</h3>
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
                onClick={() => {
                  if (variant.port) {
                    window.open(\`http://localhost:\${variant.port}\`, '_blank');
                  } else {
                    alert('Start the dev server first using the Quick Start instructions above');
                  }
                }}
                className="px-8 py-4 bg-green-500 text-white text-lg font-bold rounded-xl hover:bg-green-600 transition-all shadow-lg shadow-green-500/50 hover:shadow-green-500/70 hover:scale-105"
              >
                ▶️ Live Preview
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(\`/Users/z/work/hanzo/templates/\${variant.path}\`);
                  alert('Path copied to clipboard!');
                }}
                className="px-8 py-4 bg-blue-500 text-white text-lg font-bold rounded-xl hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/50 hover:shadow-blue-500/70 hover:scale-105"
              >
                📋 Copy Path
              </button>
              <Link
                href="/"
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
`;

const templates = [
  // Already created: brainwave
  { name: 'simple-social', screenshot: 'simple-social-code' },
  { name: 'bruddle', screenshot: 'bruddle' },
  { name: 'kael-donovan', screenshot: 'kael-donovan' },
  { name: 'fusion-saas-nft', screenshot: 'fusion-v2-saas-nft' },
  { name: 'bento-cards', screenshot: 'bento-v2-ai-react' },
  { name: 'streamline-shadcn', screenshot: 'streamline-shadcn' },
  { name: 'fofood-store', screenshot: 'fofood-store' },
  { name: 'flowmint-portfolio', screenshot: 'flowmint-portfolio' },
  { name: 'xora', screenshot: 'xora-react' },
  { name: 'fitnesspro', screenshot: 'fitnesspro-react' },
  { name: 'bitcloud', screenshot: 'bitcloud-react' },
  { name: 'teaser-saas-landing', screenshot: 'teaser-saas-landing' },
  { name: 'garuda', screenshot: 'garuda' },
  { name: 'code', screenshot: 'code-app' },
  { name: 'hygge', screenshot: 'hygge-html' },
  { name: 'square-dashboard', screenshot: 'square-dashboard' },
  { name: 'folio', screenshot: 'folio-html' },
  { name: 'rebel', screenshot: 'rebel-main' },
  { name: 'webCanvas', screenshot: 'webCanvas' },
  { name: 'solo-saas', screenshot: 'solo-saas' },
  { name: 'arch', screenshot: 'arch' },
  { name: 'betacrm', screenshot: 'betacrm-html' },
  { name: 'kalli', screenshot: 'kalli-html' },
  { name: 'innovise', screenshot: 'innovise' },
  { name: 'carsova', screenshot: 'carsova' },
  { name: 'hidden-oasis', screenshot: 'hidden-oasis' },
  { name: 'digiversestudio', screenshot: 'digiversestudio' },
];

const appDir = path.join(__dirname, 'app', 'templates');

templates.forEach(({ name, screenshot }) => {
  const dir = path.join(appDir, name);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const filePath = path.join(dir, 'page.tsx');
  const content = templatePageCode(name, screenshot);

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Created ${name}/page.tsx`);
});

console.log(`\n🎉 Successfully created ${templates.length} template pages!`);
console.log('Total pages: 28 (including brainwave)');
