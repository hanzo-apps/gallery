'use client';

import { useState } from 'react';
import type { Template } from '../templates-data';

interface ForkModalProps {
  template: Template;
  onClose: () => void;
}

function getSetupCommands(template: Template): string {
  const framework = template.framework.toLowerCase();

  if (framework.includes('next.js') || framework.includes('nextjs')) {
    return `# Navigate to template
cd "${template.path}"

# Install dependencies
npm install

# Set up environment (if needed)
cp .env.example .env.local

# Run development server
npm run dev

# Build for production
npm run build

# Deploy to Hanzo Cloud
npx hanzo deploy`;
  }

  if (framework.includes('react') && (framework.includes('vite') || framework.includes('18'))) {
    return `# Navigate to template
cd "${template.path}"

# Install dependencies
npm install

# Run development
npm run dev

# Build for production
npm run build

# Deploy to Hanzo Cloud
npx hanzo deploy`;
  }

  if (framework.includes('react') && framework.includes('cra')) {
    return `# Navigate to template
cd "${template.path}"

# Install dependencies
npm install

# Run development
npm start

# Build for production
npm run build

# Deploy to Hanzo Cloud
npx hanzo deploy`;
  }

  if (framework.includes('html') && framework.includes('gulp')) {
    return `# Navigate to template
cd "${template.path}"

# Install dependencies
npm install

# Run development
gulp

# Build for production
gulp build

# Deploy to Hanzo Cloud (static site)
npx hanzo deploy --static`;
  }

  if (framework.includes('html')) {
    return `# Navigate to template
cd "${template.path}"

# Install dependencies (if needed)
npm install

# Serve locally
npx serve .

# Deploy to Hanzo Cloud (static site)
npx hanzo deploy --static`;
  }

  return `# Navigate to template
cd "${template.path}"

# See README for framework-specific setup`;
}

function getEstimatedTime(template: Template): string {
  const framework = template.framework.toLowerCase();

  if (framework.includes('next.js') || framework.includes('nextjs')) {
    return '2-3 minutes';
  }

  if (framework.includes('react')) {
    return '3-4 minutes';
  }

  if (framework.includes('html') && framework.includes('gulp')) {
    return '2-3 minutes';
  }

  return '2-5 minutes';
}

export function ForkModal({ template, onClose }: ForkModalProps) {
  const [selectedOption, setSelectedOption] = useState<'cloud' | 'local' | 'github' | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);

  const handleDeploy = async () => {
    setIsDeploying(true);

    try {
      if (selectedOption === 'cloud') {
        // Simulate Hanzo Cloud deployment
        await new Promise(resolve => setTimeout(resolve, 2000));
        alert('🚀 Deployment initiated!\n\nYour template is being deployed to Hanzo Cloud.\nYou will receive a deployment URL shortly.');
      } else if (selectedOption === 'local') {
        // Direct link to GitHub repo
        const repoUrl = `https://github.com/hanzo-apps/template-${template.slug}`;
        window.open(repoUrl, '_blank');
        alert('📦 Opening GitHub repository!\n\nClone the repo and follow the setup commands.');
      } else if (selectedOption === 'github') {
        // Simulate GitHub fork
        await new Promise(resolve => setTimeout(resolve, 1500));
        alert('🔗 GitHub fork created!\n\nRepository forked to your account.\nConnect to Hanzo Cloud in the next step.');
      }
    } catch (error) {
      alert('Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsDeploying(false);
    }
  };

  const copyPath = () => {
    const relativePath = template.path;
    navigator.clipboard.writeText(relativePath);
    alert(`📋 Path copied!\n\nRelative path: ${relativePath}`);
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
        className="relative w-full max-w-4xl max-h-[90vh] bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl border border-white/20 overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Fork {template.displayName} on Hanzo AI
              </h2>
              <p className="text-blue-100 text-sm">
                {template.framework} • {template.category}
              </p>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="overflow-y-auto max-h-[calc(90vh-180px)] p-6">
          {/* Deployment Options */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Choose Deployment Method</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Option 1: Cloud Deploy */}
              <button
                onClick={() => setSelectedOption('cloud')}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  selectedOption === 'cloud'
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-white/10 bg-white/5 hover:border-blue-500/50'
                }`}
              >
                <div className="text-3xl mb-2">🚀</div>
                <h3 className="font-bold text-white mb-1">Deploy to Hanzo Cloud</h3>
                <p className="text-sm text-gray-400 mb-2">
                  One-click deployment to Hanzo global edge network
                </p>
                <code className="text-xs text-blue-400">
                  Estimated: {getEstimatedTime(template)}
                </code>
              </button>

              {/* Option 2: Download */}
              <button
                onClick={() => setSelectedOption('local')}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  selectedOption === 'local'
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-white/10 bg-white/5 hover:border-green-500/50'
                }`}
              >
                <div className="text-3xl mb-2">📦</div>
                <h3 className="font-bold text-white mb-1">Download & Deploy Locally</h3>
                <p className="text-sm text-gray-400 mb-2">
                  Download template and deploy from your machine
                </p>
                <code className="text-xs text-green-400">
                  Path: {template.path}
                </code>
              </button>

              {/* Option 3: GitHub */}
              <button
                onClick={() => setSelectedOption('github')}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  selectedOption === 'github'
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-white/10 bg-white/5 hover:border-purple-500/50'
                }`}
              >
                <div className="text-3xl mb-2">🔗</div>
                <h3 className="font-bold text-white mb-1">Clone to GitHub</h3>
                <p className="text-sm text-gray-400 mb-2">
                  Fork to your GitHub and connect to Hanzo
                </p>
                <code className="text-xs text-purple-400">
                  git clone ...
                </code>
              </button>
            </div>
          </div>

          {/* Setup Preview */}
          <div className="bg-white/5 rounded-xl border border-white/10 p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-white">Setup Commands</h3>
              <button
                onClick={copySetupCommands}
                className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors"
              >
                📋 Copy
              </button>
            </div>
            <pre className="bg-black/50 p-4 rounded-lg overflow-x-auto">
              <code className="text-sm text-green-400">{getSetupCommands(template)}</code>
            </pre>
          </div>

          {/* Path Copy */}
          <div className="bg-white/5 rounded-xl border border-white/10 p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white mb-1">Template Path</h3>
                <code className="text-sm text-gray-400">
                  {template.path}
                </code>
              </div>
              <button
                onClick={copyPath}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors whitespace-nowrap"
              >
                📋 Copy Path
              </button>
            </div>
          </div>

          {/* Hanzo Features */}
          <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-500/20 p-6">
            <h3 className="font-semibold text-white mb-4 text-lg">
              What You Get with Hanzo AI
            </h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <li className="flex items-center gap-2 text-gray-300">
                <span className="text-green-400">✓</span>
                <span>Instant global deployment</span>
              </li>
              <li className="flex items-center gap-2 text-gray-300">
                <span className="text-green-400">✓</span>
                <span>Global edge network (CDN)</span>
              </li>
              <li className="flex items-center gap-2 text-gray-300">
                <span className="text-green-400">✓</span>
                <span>Auto-scaling infrastructure</span>
              </li>
              <li className="flex items-center gap-2 text-gray-300">
                <span className="text-green-400">✓</span>
                <span>Built-in analytics dashboard</span>
              </li>
              <li className="flex items-center gap-2 text-gray-300">
                <span className="text-green-400">✓</span>
                <span>Automated CI/CD pipeline</span>
              </li>
              <li className="flex items-center gap-2 text-gray-300">
                <span className="text-green-400">✓</span>
                <span>SSL certificates included</span>
              </li>
              <li className="flex items-center gap-2 text-gray-300">
                <span className="text-green-400">✓</span>
                <span>Performance monitoring</span>
              </li>
              <li className="flex items-center gap-2 text-gray-300">
                <span className="text-green-400">✓</span>
                <span>99.99% uptime SLA</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer - Fixed */}
        <div className="border-t border-white/10 bg-gray-900/80 backdrop-blur-sm p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">
              {selectedOption
                ? `Ready to ${selectedOption === 'cloud' ? 'deploy' : selectedOption === 'local' ? 'download' : 'clone'}?`
                : 'Select a deployment method to continue'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeploy}
                disabled={!selectedOption || isDeploying}
                className={`px-6 py-2 rounded-lg transition-all font-medium ${
                  selectedOption && !isDeploying
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg shadow-blue-500/25'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isDeploying ? (
                  <span className="flex items-center gap-2">
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : (
                  <>
                    {selectedOption === 'cloud' && '🚀 Deploy Now'}
                    {selectedOption === 'local' && '⬇️ Download Now'}
                    {selectedOption === 'github' && '🔗 Clone to GitHub'}
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
