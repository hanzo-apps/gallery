'use client';

import Image from 'next/image';
import Link from 'next/link';
import { templates } from './templates-data';

interface TemplateCardProps {
  template: typeof templates[0];
}

function TemplateCard({ template }: TemplateCardProps) {
  return (
    <Link href={`/templates/${template.slug}`}>
      <div className="group relative bg-neutral-900/50 rounded-xl border border-neutral-800 overflow-hidden hover:border-neutral-700 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer">
        <div className="relative aspect-video bg-neutral-900 overflow-hidden">
          <Image
            src={`/screenshots/${template.screenshot}.png`}
            alt={template.displayName}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
          {/* Tier badge */}
          <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-medium ${
            template.tier === 1 ? 'bg-[#fd4444] text-white' :
            template.tier === 2 ? 'bg-neutral-700 text-white' : 'bg-neutral-800 text-neutral-300'
          }`}>
            Tier {template.tier}
          </div>
          {/* Category badge */}
          <div className="absolute top-3 right-3 px-2.5 py-1 bg-neutral-900/80 backdrop-blur-sm rounded-full text-xs font-medium text-neutral-300">
            {template.category}
          </div>
        </div>
        <div className="p-5">
          <h3 className="text-lg font-medium text-white mb-1.5 group-hover:text-[#fd4444] transition-colors">
            {template.displayName}
          </h3>
          <p className="text-sm text-neutral-500 mb-1.5">{template.framework}</p>
          <p className="text-sm text-neutral-600 mb-3">{template.useCase}</p>
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <span key={i} className={i < template.rating ? 'text-[#fd4444]' : 'text-neutral-700'}>
                ★
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}

interface TechBadgeProps {
  icon: string;
  name: string;
  count: string;
}

function TechBadge({ icon, name, count }: TechBadgeProps) {
  return (
    <div className="bg-neutral-900/50 p-6 rounded-xl border border-neutral-800 hover:border-neutral-700 transition-all hover:-translate-y-1 cursor-pointer">
      <div className="text-4xl mb-3 text-center">{icon}</div>
      <div className="text-center">
        <div className="text-lg font-medium text-white mb-1">{name}</div>
        <div className="text-neutral-500 text-sm">{count} templates</div>
      </div>
    </div>
  );
}

interface UseCaseCardProps {
  icon: string;
  title: string;
  description: string;
  templates: number;
}

function UseCaseCard({ icon, title, description, templates }: UseCaseCardProps) {
  return (
    <div className="bg-neutral-900/50 p-6 rounded-xl border border-neutral-800 hover:border-neutral-700 transition-all hover:-translate-y-1 cursor-pointer">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-medium text-white mb-2">{title}</h3>
      <p className="text-neutral-500 text-sm mb-4">{description}</p>
      <div className="text-[#fd4444] text-sm font-medium">{templates} templates →</div>
    </div>
  );
}

export default function GalleryHome() {
  const tier1Templates = templates.filter(t => t.tier === 1);
  const featuredTemplates = tier1Templates.slice(0, 6);

  // Calculate component count
  const totalComponents = templates.reduce((sum, t) => {
    const match = t.components.match(/(\d+)/);
    return sum + (match ? parseInt(match[1]) : 0);
  }, 0);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Hero Section */}
      <section className="relative py-32 px-4 overflow-hidden">
        {/* Subtle gradient glow */}
        <div className="hero-glow" />

        <div className="relative max-w-5xl mx-auto text-center">
          <p className="text-sm text-neutral-500 mb-4 tracking-wide uppercase">Open Source Templates</p>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-medium mb-6 tracking-tight">
            <span className="text-gradient">Hanzo Templates</span>
          </h1>
          <p className="text-lg md:text-xl text-neutral-400 mb-4 max-w-2xl mx-auto">
            Premium UI/UX templates for your next project
          </p>
          <p className="text-base text-neutral-500 mb-10">
            <span className="text-white font-medium">{templates.length}</span> Production-ready templates
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/gallery">
              <button className="px-6 py-3 bg-[#fd4444] hover:bg-[#e03e3e] rounded-full font-medium text-white transition-colors flex items-center gap-2">
                Browse Templates
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </Link>
            <Link href="/docs">
              <button className="px-6 py-3 bg-transparent border border-neutral-700 hover:border-neutral-600 hover:bg-white/5 rounded-full font-medium text-white transition-colors">
                Documentation
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4 border-y border-neutral-800">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-4xl font-medium text-white mb-1">
              {templates.length}
            </div>
            <div className="text-neutral-500 text-sm">Premium Templates</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-medium text-white mb-1">
              14
            </div>
            <div className="text-neutral-500 text-sm">Categories</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-medium text-white mb-1">
              {totalComponents}+
            </div>
            <div className="text-neutral-500 text-sm">Components</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-medium text-white mb-1">
              100%
            </div>
            <div className="text-neutral-500 text-sm">Production Ready</div>
          </div>
        </div>
      </section>

      {/* Featured Templates */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-medium mb-3 text-white">
              Featured Templates
            </h2>
            <p className="text-neutral-500">Our highest-rated Tier 1 templates</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {featuredTemplates.map(template => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
          <div className="text-center">
            <Link href="/gallery">
              <button className="px-6 py-3 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-full font-medium text-white transition-colors">
                View All Templates →
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Technology Stacks */}
      <section className="py-24 px-4 border-y border-neutral-800">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-medium mb-3 text-white">
              Technology Stacks
            </h2>
            <p className="text-neutral-500">Built with modern web technologies</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <TechBadge
              icon="⚡"
              name="Next.js"
              count={templates.filter(t => t.framework.toLowerCase().includes('next')).length.toString()}
            />
            <TechBadge
              icon="⚛️"
              name="React"
              count={templates.filter(t => t.framework.toLowerCase().includes('react')).length.toString()}
            />
            <TechBadge
              icon="🎨"
              name="TypeScript"
              count={templates.filter(t => t.framework.toLowerCase().includes('typescript') || t.framework.toLowerCase().includes('ts')).length.toString()}
            />
            <TechBadge
              icon="🌈"
              name="HTML/CSS"
              count={templates.filter(t => t.framework.toLowerCase().includes('html') || t.framework.toLowerCase().includes('gulp')).length.toString()}
            />
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-medium mb-3 text-white">
              Perfect For
            </h2>
            <p className="text-neutral-500">Whatever you are building, we have a template</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <UseCaseCard
              icon="🚀"
              title="SaaS Startups"
              description="Launch faster with production-ready templates"
              templates={templates.filter(t => t.useCase.toLowerCase().includes('saas')).length}
            />
            <UseCaseCard
              icon="🎨"
              title="Creative Agencies"
              description="Beautiful portfolios and agency sites"
              templates={templates.filter(t =>
                t.useCase.toLowerCase().includes('portfolio') ||
                t.useCase.toLowerCase().includes('agency') ||
                t.useCase.toLowerCase().includes('creative')
              ).length}
            />
            <UseCaseCard
              icon="📱"
              title="Mobile Apps"
              description="Modern app landing pages"
              templates={templates.filter(t =>
                t.useCase.toLowerCase().includes('app') ||
                t.useCase.toLowerCase().includes('mobile')
              ).length}
            />
            <UseCaseCard
              icon="📊"
              title="Dashboards"
              description="Admin panels and analytics platforms"
              templates={templates.filter(t => t.useCase.toLowerCase().includes('dashboard')).length}
            />
            <UseCaseCard
              icon="🛒"
              title="E-commerce"
              description="Online stores and marketplaces"
              templates={templates.filter(t =>
                t.useCase.toLowerCase().includes('commerce') ||
                t.useCase.toLowerCase().includes('store')
              ).length}
            />
            <UseCaseCard
              icon="💬"
              title="Social Platforms"
              description="Community and social networking"
              templates={templates.filter(t => t.useCase.toLowerCase().includes('social')).length}
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 border-y border-neutral-800">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-medium mb-3 text-white">
              Why Choose Hanzo Templates?
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 bg-neutral-900/50 rounded-xl border border-neutral-800">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="text-lg font-medium text-white mb-2">Lightning Fast</h3>
              <p className="text-neutral-500 text-sm">Built with Next.js 14+ for optimal performance and SEO</p>
            </div>
            <div className="p-6 bg-neutral-900/50 rounded-xl border border-neutral-800">
              <div className="text-3xl mb-3">🎨</div>
              <h3 className="text-lg font-medium text-white mb-2">Beautiful Design</h3>
              <p className="text-neutral-500 text-sm">Premium UI/UX from top designers worldwide</p>
            </div>
            <div className="p-6 bg-neutral-900/50 rounded-xl border border-neutral-800">
              <div className="text-3xl mb-3">📱</div>
              <h3 className="text-lg font-medium text-white mb-2">Fully Responsive</h3>
              <p className="text-neutral-500 text-sm">Perfect on mobile, tablet, and desktop devices</p>
            </div>
            <div className="p-6 bg-neutral-900/50 rounded-xl border border-neutral-800">
              <div className="text-3xl mb-3">🔧</div>
              <h3 className="text-lg font-medium text-white mb-2">Easy to Customize</h3>
              <p className="text-neutral-500 text-sm">Clean code with TypeScript and modern best practices</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 relative overflow-hidden">
        {/* Subtle glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#fd4444] opacity-10 blur-[120px] rounded-full" />

        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-medium mb-4 text-white">
            Deploy Instantly
          </h2>
          <p className="text-lg text-neutral-400 mb-10">
            One-click deployment to Hanzo Cloud
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <a href="https://hanzo.ai" target="_blank" rel="noopener noreferrer">
              <button className="px-6 py-3 bg-[#fd4444] hover:bg-[#e03e3e] rounded-full font-medium text-white transition-colors flex items-center gap-2">
                Get Started Free
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </a>
            <Link href="/gallery">
              <button className="px-6 py-3 bg-transparent border border-neutral-700 hover:border-neutral-600 hover:bg-white/5 rounded-full font-medium text-white transition-colors">
                Browse Gallery
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
