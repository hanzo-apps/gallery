'use client';

import { useState } from 'react';
import type { Template } from '../templates-data';

interface ForkModalProps {
  template: Template;
  onClose: () => void;
}

// Hanzo App URL - uses localhost for local dev, production URL otherwise
const HANZO_APP_URL = process.env.NEXT_PUBLIC_HANZO_APP_URL || 'https://hanzo.app';

function getGitHubRepoUrl(template: Template): string {
  return `https://github.com/hanzo-apps/${template.slug}`;
}

function getSetupCommands(template: Template): string {
  const framework = template.framework.toLowerCase();
  const repoUrl = getGitHubRepoUrl(template);

  if (framework.includes('next.js') || framework.includes('nextjs')) {
    return `# Clone the template
git clone ${repoUrl}
cd ${template.slug}

# Install dependencies
pnpm install

# Set up environment (if needed)
cp .env.example .env.local

# Run development server
pnpm dev

# Deploy to Hanzo Cloud
npx hanzo deploy`;
  }

  if (framework.includes('react') && (framework.includes('vite') || framework.includes('18'))) {
    return `# Clone the template
git clone ${repoUrl}
cd ${template.slug}

# Install dependencies
pnpm install

# Run development
pnpm dev

# Deploy to Hanzo Cloud
npx hanzo deploy`;
  }

  if (framework.includes('html') && framework.includes('gulp')) {
    return `# Clone the template
git clone ${repoUrl}
cd ${template.slug}

# Install dependencies
npm install

# Run development
gulp

# Deploy to Hanzo Cloud (static site)
npx hanzo deploy --static`;
  }

  if (framework.includes('html')) {
    return `# Clone the template
git clone ${repoUrl}
cd ${template.slug}

# Serve locally
npx serve .

# Deploy to Hanzo Cloud (static site)
npx hanzo deploy --static`;
  }

  return `# Clone the template
git clone ${repoUrl}
cd ${template.slug}

# See README for framework-specific setup`;
}

export function ForkModal({ template, onClose }: ForkModalProps) {
  const [selectedOption, setSelectedOption] = useState<'cloud' | 'edit' | 'github' | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);

  const repoUrl = getGitHubRepoUrl(template);

  const handleDeploy = async () => {
    setIsDeploying(true);

    try {
      if (selectedOption === 'cloud') {
        // Navigate to Hanzo App with deploy action
        const deployUrl = new URL('/dev', HANZO_APP_URL);
        deployUrl.searchParams.set('template', repoUrl);
        deployUrl.searchParams.set('action', 'deploy');
        window.location.href = deployUrl.toString();
      } else if (selectedOption === 'edit') {
        // Navigate to Hanzo App with edit action
        const editUrl = new URL('/dev', HANZO_APP_URL);
        editUrl.searchParams.set('repo', repoUrl);
        editUrl.searchParams.set('action', 'edit');
        window.location.href = editUrl.toString();
      } else if (selectedOption === 'github') {
        // Open GitHub repo
        window.open(repoUrl, '_blank');
        onClose();
      }
    } catch (error) {
      alert('Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
      setIsDeploying(false);
    }
  };

  const copyPath = () => {
    navigator.clipboard.writeText(repoUrl);
    alert(`📋 Repository URL copied!`);
  };

  const copySetupCommands = () => {
    navigator.clipboard.writeText(getSetupCommands(template));
    alert('✅ Setup commands copied to clipboard!');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] bg-[#0a0a0a] rounded-2xl border border-neutral-800 overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-neutral-900 border-b border-neutral-800 p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-medium text-white mb-2">
                Deploy {template.displayName}
              </h2>
              <p className="text-neutral-400 text-sm">
                {template.framework} • {template.category}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="overflow-y-auto max-h-[calc(90vh-180px)] p-6">
          {/* Deployment Options */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-white mb-4">Choose an Option</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Option 1: Deploy to Cloud */}
              <button
                onClick={() => setSelectedOption('cloud')}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  selectedOption === 'cloud'
                    ? 'border-[#fd4444] bg-[#fd4444]/10'
                    : 'border-neutral-800 bg-neutral-900/50 hover:border-[#fd4444]/50'
                }`}
              >
                <div className="text-3xl mb-2">🚀</div>
                <h3 className="font-medium text-white mb-1">Deploy to Cloud</h3>
                <p className="text-sm text-neutral-400 mb-2">
                  One-click deploy to Hanzo Cloud
                </p>
                <code className="text-xs text-[#fd4444]">
                  Instant deployment
                </code>
              </button>

              {/* Option 2: Edit in Hanzo */}
              <button
                onClick={() => setSelectedOption('edit')}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  selectedOption === 'edit'
                    ? 'border-[#fd4444] bg-[#fd4444]/10'
                    : 'border-neutral-800 bg-neutral-900/50 hover:border-[#fd4444]/50'
                }`}
              >
                <div className="text-3xl mb-2">✏️</div>
                <h3 className="font-medium text-white mb-1">Edit in Hanzo</h3>
                <p className="text-sm text-neutral-400 mb-2">
                  Open in visual editor to customize
                </p>
                <code className="text-xs text-[#fd4444]">
                  AI-powered editing
                </code>
              </button>

              {/* Option 3: Clone from GitHub */}
              <button
                onClick={() => setSelectedOption('github')}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  selectedOption === 'github'
                    ? 'border-neutral-600 bg-neutral-800/50'
                    : 'border-neutral-800 bg-neutral-900/50 hover:border-neutral-600'
                }`}
              >
                <div className="text-3xl mb-2">📦</div>
                <h3 className="font-medium text-white mb-1">Clone from GitHub</h3>
                <p className="text-sm text-neutral-400 mb-2">
                  Download and run locally
                </p>
                <code className="text-xs text-neutral-500">
                  git clone ...
                </code>
              </button>
            </div>
          </div>

          {/* Setup Preview */}
          <div className="bg-neutral-900/50 rounded-xl border border-neutral-800 p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-white">Setup Commands</h3>
              <button
                onClick={copySetupCommands}
                className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-white text-sm rounded-lg transition-colors"
              >
                📋 Copy
              </button>
            </div>
            <pre className="bg-black/50 p-4 rounded-lg overflow-x-auto">
              <code className="text-sm text-neutral-300">{getSetupCommands(template)}</code>
            </pre>
          </div>

          {/* Repository URL */}
          <div className="bg-neutral-900/50 rounded-xl border border-neutral-800 p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-white mb-1">Repository</h3>
                <code className="text-sm text-neutral-400">
                  {repoUrl}
                </code>
              </div>
              <button
                onClick={copyPath}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors whitespace-nowrap"
              >
                📋 Copy URL
              </button>
            </div>
          </div>

          {/* Hanzo Features */}
          <div className="bg-neutral-900/50 rounded-xl border border-neutral-800 p-6">
            <h3 className="font-medium text-white mb-4 text-lg">
              What You Get with Hanzo
            </h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <li className="flex items-center gap-2 text-neutral-300">
                <span className="text-[#fd4444]">✓</span>
                <span>Instant global deployment</span>
              </li>
              <li className="flex items-center gap-2 text-neutral-300">
                <span className="text-[#fd4444]">✓</span>
                <span>AI-powered code editing</span>
              </li>
              <li className="flex items-center gap-2 text-neutral-300">
                <span className="text-[#fd4444]">✓</span>
                <span>Auto-scaling infrastructure</span>
              </li>
              <li className="flex items-center gap-2 text-neutral-300">
                <span className="text-[#fd4444]">✓</span>
                <span>Built-in analytics</span>
              </li>
              <li className="flex items-center gap-2 text-neutral-300">
                <span className="text-[#fd4444]">✓</span>
                <span>Automated CI/CD pipeline</span>
              </li>
              <li className="flex items-center gap-2 text-neutral-300">
                <span className="text-[#fd4444]">✓</span>
                <span>SSL certificates included</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer - Fixed */}
        <div className="border-t border-neutral-800 bg-neutral-900/80 backdrop-blur-sm p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-neutral-500">
              {selectedOption
                ? `Ready to ${selectedOption === 'cloud' ? 'deploy' : selectedOption === 'edit' ? 'edit' : 'clone'}?`
                : 'Select an option to continue'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white rounded-full transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeploy}
                disabled={!selectedOption || isDeploying}
                className={`px-6 py-2 rounded-full transition-all font-medium ${
                  selectedOption && !isDeploying
                    ? 'bg-[#fd4444] hover:bg-[#e03e3e] text-white'
                    : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                }`}
              >
                {isDeploying ? (
                  <span className="flex items-center gap-2">
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Loading...
                  </span>
                ) : (
                  <>
                    {selectedOption === 'cloud' && '🚀 Deploy Now'}
                    {selectedOption === 'edit' && '✏️ Open Editor'}
                    {selectedOption === 'github' && '📦 View on GitHub'}
                    {!selectedOption && 'Select Option'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
