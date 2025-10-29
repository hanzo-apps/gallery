'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { templates as templateData, CATEGORIES, type Template } from '../templates-data';
import { ForkModal } from '../components/ForkModal';
import { getUniqueTemplates, groupTemplatesByFamily } from '../lib/template-utils';

type SortOption = 'name-asc' | 'name-desc' | 'rating-high' | 'rating-low' | 'framework' | 'updated';
type ViewMode = 'consolidated' | 'grouped';

export default function Gallery() {
  const router = useRouter();
  const [categoryFilter, setCategoryFilter] = useState<string>('All Categories');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('name-asc');
  const [forkModal, setForkModal] = useState<Template | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grouped');
  const [expandedFamilies, setExpandedFamilies] = useState<Set<string>>(new Set());

  // Navigate to random template
  function goToRandomTemplate() {
    const templates = getUniqueTemplates(templateData);
    if (templates.length > 0) {
      const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
      router.push(`/templates/${randomTemplate.slug}`);
    }
  }

  // Toggle family expansion
  function toggleFamily(family: string) {
    setExpandedFamilies(prev => {
      const next = new Set(prev);
      if (next.has(family)) {
        next.delete(family);
      } else {
        next.add(family);
      }
      return next;
    });
  }

  // Add scrollbar hiding styles on mount
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const style = document.createElement('style');
      style.id = 'scrollbar-hide-styles';
      style.textContent = `
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `;
      if (!document.getElementById('scrollbar-hide-styles')) {
        document.head.appendChild(style);
      }
    }
  }, []);

  // Get unique templates (consolidate variants) or families
  const uniqueTemplates = getUniqueTemplates(templateData);
  const templateFamilies = groupTemplatesByFamily(templateData);

  // Filter and sort based on view mode
  const filteredTemplates = viewMode === 'consolidated'
    ? uniqueTemplates
        .filter((template) => {
          const matchesCategory = categoryFilter === 'All Categories' || template.category === categoryFilter;
          const matchesSearch =
            search === '' ||
            template.displayName.toLowerCase().includes(search.toLowerCase()) ||
            template.useCase.toLowerCase().includes(search.toLowerCase()) ||
            template.framework.toLowerCase().includes(search.toLowerCase()) ||
            template.category.toLowerCase().includes(search.toLowerCase());
          return matchesCategory && matchesSearch;
        })
        .sort((a, b) => {
          switch (sortBy) {
            case 'name-asc':
              return a.displayName.localeCompare(b.displayName);
            case 'name-desc':
              return b.displayName.localeCompare(a.displayName);
            case 'rating-high':
              return b.rating - a.rating;
            case 'rating-low':
              return a.rating - b.rating;
            case 'framework':
              return a.framework.localeCompare(b.framework);
            case 'updated':
              return (b.updatedDate || '').localeCompare(a.updatedDate || '');
            default:
              return 0;
          }
        })
    : [];

  const filteredFamilies = viewMode === 'grouped'
    ? templateFamilies
        .filter((family) => {
          const template = family.primaryTemplate;
          const matchesCategory = categoryFilter === 'All Categories' || template.category === categoryFilter;
          const matchesSearch =
            search === '' ||
            family.displayName.toLowerCase().includes(search.toLowerCase()) ||
            template.useCase.toLowerCase().includes(search.toLowerCase()) ||
            template.framework.toLowerCase().includes(search.toLowerCase()) ||
            template.category.toLowerCase().includes(search.toLowerCase());
          return matchesCategory && matchesSearch;
        })
        .sort((a, b) => {
          switch (sortBy) {
            case 'name-asc':
              return a.displayName.localeCompare(b.displayName);
            case 'name-desc':
              return b.displayName.localeCompare(a.displayName);
            case 'rating-high':
              return b.primaryTemplate.rating - a.primaryTemplate.rating;
            case 'rating-low':
              return a.primaryTemplate.rating - b.primaryTemplate.rating;
            case 'framework':
              return a.primaryTemplate.framework.localeCompare(b.primaryTemplate.framework);
            case 'updated':
              return (b.primaryTemplate.updatedDate || '').localeCompare(a.primaryTemplate.updatedDate || '');
            default:
              return 0;
          }
        })
    : [];

  const openLivePreview = (template: Template) => {
    // Try to open the built static preview first
    const previewUrl = `/previews/${template.name}/index.html`;

    // Check if preview exists by trying to fetch it
    fetch(previewUrl, { method: 'HEAD' })
      .then((response) => {
        if (response.ok) {
          // Preview exists, open it
          window.open(previewUrl, '_blank');
        } else {
          // Preview doesn't exist yet
          alert(`Preview not built yet for ${template.displayName}.\n\nTo build this template:\n\ncd ${template.path}\nnpm install\nnpm run build\n\nOr run: npm run build-templates in the gallery directory to build all templates.`);
        }
      })
      .catch(() => {
        // Fallback if fetch fails
        alert(`Preview not available for ${template.displayName}.\n\nPath: ${template.path}\n\nRun: npm run build-templates to build all templates.`);
      });
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Fixed Header */}
      <div className="sticky top-0 z-40 bg-black border-b border-neutral-800">
        <div className="max-w-[1600px] mx-auto px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <Link href="/" className="text-sm text-neutral-400 hover:text-white transition-colors">
              ← Back
            </Link>
            <div className="flex items-center gap-4">
              <div className="text-sm text-neutral-400">
                {viewMode === 'grouped'
                  ? `${filteredFamilies.length} template families`
                  : `${filteredTemplates.length} templates`}
              </div>
              <div className="flex gap-2 bg-neutral-900 rounded-full p-1 border border-neutral-800">
                <button
                  onClick={() => setViewMode('consolidated')}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                    viewMode === 'consolidated'
                      ? 'bg-white text-black'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Simple
                </button>
                <button
                  onClick={() => setViewMode('grouped')}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                    viewMode === 'grouped'
                      ? 'bg-white text-black'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Grouped
                </button>
              </div>
            </div>
          </div>

          {/* Search Bar - Airbnb Style */}
          <div className="flex gap-3 mb-6">
            <input
              type="text"
              placeholder="Search templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-5 py-3 bg-neutral-900 border border-neutral-800 rounded-full text-white placeholder-neutral-500 focus:outline-none focus:border-white transition-colors text-sm"
            />
            <button
              onClick={goToRandomTemplate}
              className="px-5 py-3 bg-gradient-to-r from-purple-500 to-pink-500 border border-purple-400/50 rounded-full text-white font-medium hover:from-purple-600 hover:to-pink-600 transition-all text-sm whitespace-nowrap shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105"
              title="Jump to Random Template"
            >
              🎲 Random
            </button>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-5 py-3 bg-neutral-900 border border-neutral-800 rounded-full text-white focus:outline-none focus:border-white transition-colors text-sm min-w-[140px]"
            >
              <option value="name-asc" className="bg-black">A-Z</option>
              <option value="name-desc" className="bg-black">Z-A</option>
              <option value="rating-high" className="bg-black">Top Rated</option>
              <option value="framework" className="bg-black">Framework</option>
            </select>
          </div>

          {/* Horizontal Filter Chips - Airbnb Style */}
          <div className="overflow-x-auto scrollbar-hide -mx-8 px-8">
            <div className="flex gap-3 pb-2 min-w-max">
              <button
                onClick={() => setCategoryFilter('All Categories')}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  categoryFilter === 'All Categories'
                    ? 'bg-white text-black'
                    : 'bg-neutral-900 border border-neutral-800 text-neutral-300 hover:border-neutral-600'
                }`}
              >
                All
              </button>
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => setCategoryFilter(category)}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                    categoryFilter === category
                      ? 'bg-white text-black'
                      : 'bg-neutral-900 border border-neutral-800 text-neutral-300 hover:border-neutral-600'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Spacious Layout */}
      <div className="max-w-[1600px] mx-auto px-8 py-12">

        {/* Consolidated View - Simple Template Grid */}
        {viewMode === 'consolidated' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTemplates.map((t) => (
              <div
                key={t.id}
                className="group bg-neutral-950 rounded-2xl border border-neutral-800 overflow-hidden hover:border-neutral-700 transition-all duration-300"
              >
                {/* Template Screenshot */}
                <div className="relative aspect-video bg-neutral-900 overflow-hidden border-b border-neutral-800">
                  <Image
                    src={`/screenshots/${t.screenshot}.png`}
                    alt={t.displayName}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Template Info */}
                <div className="p-8">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-2">{t.displayName}</h3>
                      <p className="text-sm text-neutral-400">{t.framework}</p>
                    </div>
                    <div className="text-xs text-neutral-500 bg-neutral-900 px-2.5 py-1 rounded-full border border-neutral-800">
                      {t.category}
                    </div>
                  </div>

                  <p className="text-sm text-neutral-500 mb-6 leading-relaxed">{t.useCase}</p>

                  {/* Action Buttons - Vercel Style */}
                  <div className="space-y-3">
                    <button
                      onClick={() => setForkModal(t)}
                      className="w-full px-5 py-3 bg-white text-black text-sm font-medium rounded-lg hover:bg-neutral-200 transition-all"
                    >
                      Deploy to Hanzo
                    </button>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openLivePreview(t)}
                        className="flex-1 px-4 py-2.5 bg-neutral-900 border border-neutral-800 text-neutral-300 text-sm rounded-lg hover:bg-neutral-800 hover:border-neutral-700 transition-all"
                      >
                        {t.port ? '▶️ Live Preview' : '📸 Screenshot'}
                      </button>
                      <Link
                        href={`/templates/${t.slug}`}
                        className="flex-1 px-4 py-2.5 bg-neutral-900 border border-neutral-800 text-neutral-300 text-sm text-center rounded-lg hover:bg-neutral-800 hover:border-neutral-700 transition-all"
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Grouped View - Template Families with Expandable Variants */}
        {viewMode === 'grouped' && (
          <div className="space-y-6">
            {filteredFamilies.map((family) => {
              const isExpanded = expandedFamilies.has(family.family);
              const t = family.primaryTemplate;
              const hasVariants = family.variantCount > 1;

              return (
                <div key={family.family} className="bg-neutral-950 rounded-2xl border border-neutral-800 overflow-hidden">
                  {/* Primary Template Card */}
                  <div className="group">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
                      {/* Screenshot */}
                      <div className="relative aspect-video bg-neutral-900 overflow-hidden rounded-xl border border-neutral-800">
                        <Image
                          src={`/screenshots/${t.screenshot}.png`}
                          alt={family.displayName}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>

                      {/* Info */}
                      <div className="lg:col-span-2">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-2xl font-semibold text-white">{family.displayName}</h3>
                              {hasVariants && (
                                <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-xs font-medium text-purple-400">
                                  {family.variantCount} variants
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-neutral-400 mb-1">{t.framework}</p>
                            <p className="text-xs text-neutral-500 bg-neutral-900 px-2.5 py-1 rounded-full border border-neutral-800 inline-block">
                              {t.category}
                            </p>
                          </div>
                        </div>

                        <p className="text-sm text-neutral-500 mb-6 leading-relaxed">{t.useCase}</p>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3">
                          <button
                            onClick={() => setForkModal(t)}
                            className="px-6 py-2.5 bg-white text-black text-sm font-medium rounded-lg hover:bg-neutral-200 transition-all"
                          >
                            Deploy to Hanzo
                          </button>
                          <button
                            onClick={() => openLivePreview(t)}
                            className="px-6 py-2.5 bg-neutral-900 border border-neutral-800 text-neutral-300 text-sm rounded-lg hover:bg-neutral-800 hover:border-neutral-700 transition-all"
                          >
                            {t.port ? '▶️ Live Preview' : '📸 Screenshot'}
                          </button>
                          <Link
                            href={`/templates/${t.slug}`}
                            className="px-6 py-2.5 bg-neutral-900 border border-neutral-800 text-neutral-300 text-sm rounded-lg hover:bg-neutral-800 hover:border-neutral-700 transition-all"
                          >
                            Details
                          </Link>
                          {hasVariants && (
                            <button
                              onClick={() => toggleFamily(family.family)}
                              className="px-6 py-2.5 bg-neutral-900 border border-neutral-800 text-neutral-300 text-sm rounded-lg hover:bg-neutral-800 hover:border-neutral-700 transition-all flex items-center gap-2"
                            >
                              {isExpanded ? '▼ Hide' : '▶ Show'} Variants
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Variants */}
                    {isExpanded && hasVariants && (
                      <div className="border-t border-neutral-800 bg-neutral-950/50 p-6">
                        <h4 className="text-sm font-semibold text-neutral-400 mb-4 uppercase tracking-wider">
                          All Variants ({family.variantCount})
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {family.templates.map((variant) => (
                            <div
                              key={variant.id}
                              className="bg-neutral-900 rounded-xl border border-neutral-800 p-4 hover:border-neutral-700 transition-all"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <h5 className="text-sm font-medium text-white mb-1">
                                    {variant.framework}
                                  </h5>
                                  <p className="text-xs text-neutral-500">{variant.displayName}</p>
                                </div>
                                <div className={`px-2 py-1 rounded text-xs font-medium ${
                                  variant.tier === 1 ? 'bg-green-500/20 text-green-400' :
                                  variant.tier === 2 ? 'bg-blue-500/20 text-blue-400' :
                                  'bg-purple-500/20 text-purple-400'
                                }`}>
                                  T{variant.tier}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => setForkModal(variant)}
                                  className="flex-1 px-3 py-1.5 bg-white text-black text-xs font-medium rounded hover:bg-neutral-200 transition-all"
                                >
                                  Deploy
                                </button>
                                <button
                                  onClick={() => openLivePreview(variant)}
                                  className="px-3 py-1.5 bg-neutral-800 border border-neutral-700 text-neutral-300 text-xs rounded hover:bg-neutral-700 transition-all"
                                >
                                  {variant.port ? '▶️' : '📸'}
                                </button>
                                <Link
                                  href={`/templates/${variant.slug}`}
                                  className="px-3 py-1.5 bg-neutral-800 border border-neutral-700 text-neutral-300 text-xs rounded hover:bg-neutral-700 transition-all"
                                >
                                  Info
                                </Link>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Fork Modal */}
        {forkModal && (
          <ForkModal
            template={forkModal}
            onClose={() => setForkModal(null)}
          />
        )}
      </div>
    </div>
  );
}
