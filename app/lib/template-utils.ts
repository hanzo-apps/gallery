import { Template } from '../templates-data';

// Derive family name from template name
export function deriveFamily(name: string): string {
  // Extract base name from template identifiers like "brainwave-update-May2024" -> "brainwave"
  // "bento-v2-ai-react" -> "bento-cards"
  // "xora-react" -> "xora"
  // "folio-html" -> "folio"

  let family = name.toLowerCase();

  // Bento Cards family
  if (family.includes('bento')) {
    return 'bento-cards';
  }

  // Folio family
  if (family.startsWith('folio')) {
    return 'folio';
  }

  // Hygge family
  if (family.includes('hygge')) {
    return 'hygge';
  }

  // BetaCRM family
  if (family.includes('betacrm')) {
    return 'betacrm';
  }

  // Carsova family
  if (family.includes('carsova')) {
    return 'carsova';
  }

  // Bitcloud family
  if (family.includes('bitcloud')) {
    return 'bitcloud';
  }

  // Xora family
  if (family.includes('xora')) {
    return 'xora';
  }

  // FitnessPro family
  if (family.includes('fitnesspro')) {
    return 'fitnesspro';
  }

  // Extract first part before version, date, or framework
  family = family.split('-')[0];

  // Clean up common suffixes
  family = family
    .replace(/-(main|html|react|nextjs|final|duplicate|update).*$/, '')
    .trim();

  return family;
}

// Extract base template name (without framework/version suffixes)
export function getBaseTemplateName(displayName: string): string {
  let baseName = displayName;

  // Handle Folio special case - extract just "Folio" from all variants
  if (baseName.startsWith('Folio ')) {
    return 'Folio';
  }

  // Handle Code Landing variants
  if (baseName.includes('Code') && baseName.includes('Landing')) {
    return 'Code Landing';
  }

  // Remove parenthesized suffixes
  baseName = baseName
    .replace(/\s*\(Next\.js\)/gi, '')
    .replace(/\s*\(React\)/gi, '')
    .replace(/\s*\(HTML\)/gi, '')
    .replace(/\s*\(Gulp\)/gi, '')
    .replace(/\s*\(Bootstrap\)/gi, '')
    .replace(/\s*\(Alt\)/gi, '')
    .replace(/\s*\(Duplicate\)/gi, '');

  // Remove version numbers (v1, v2, etc.)
  baseName = baseName.replace(/\s*v[0-9]+.*$/i, '');

  // Remove space-separated framework suffixes at the end
  baseName = baseName
    .replace(/\s+HTML$/i, '')
    .replace(/\s+React$/i, '')
    .replace(/\s+Next\.js$/i, '')
    .replace(/\s+Gulp$/i, '')
    .replace(/\s+Bootstrap$/i, '')
    .replace(/\s+CSS$/i, '')
    .replace(/\s+Final$/i, '');

  return baseName.trim();
}

// Group templates by base name
export function groupTemplatesByBase(templates: Template[]): Map<string, Template[]> {
  const groups = new Map<string, Template[]>();

  templates.forEach(template => {
    const baseName = getBaseTemplateName(template.displayName);
    if (!groups.has(baseName)) {
      groups.set(baseName, []);
    }
    groups.get(baseName)!.push(template);
  });

  return groups;
}

// Get unique templates (one per base name group)
export function getUniqueTemplates(templates: Template[]): Template[] {
  const groups = groupTemplatesByBase(templates);
  const uniqueTemplates: Template[] = [];

  groups.forEach((variants, baseName) => {
    // Pick the best variant to represent the group
    // Priority: Next.js > React > HTML
    const bestVariant = variants.find(t => t.framework.toLowerCase().includes('next')) ||
                       variants.find(t => t.framework.toLowerCase().includes('react')) ||
                       variants[0];

    // Create a template object with variant count
    uniqueTemplates.push({
      ...bestVariant,
      displayName: baseName,
      slug: baseName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
    });
  });

  return uniqueTemplates;
}

// Get all variants for a template by slug or base name
export function getTemplateVariants(templates: Template[], slugOrName: string): Template[] {
  // First, check if this slug matches a consolidated template
  const uniqueTemplates = getUniqueTemplates(templates);
  const consolidatedTemplate = uniqueTemplates.find(t => t.slug === slugOrName);

  let baseName: string;

  if (consolidatedTemplate) {
    // Found by consolidated slug
    baseName = getBaseTemplateName(consolidatedTemplate.displayName);
  } else {
    // Try to find by original slug
    const template = templates.find(t => t.slug === slugOrName);
    if (!template) return [];
    baseName = getBaseTemplateName(template.displayName);
  }

  const groups = groupTemplatesByBase(templates);
  const variants = groups.get(baseName) || [];

  // Deduplicate variants with identical frameworks
  // Keep the first occurrence of each unique framework
  const seenFrameworks = new Set<string>();
  const uniqueVariants = variants.filter(v => {
    if (seenFrameworks.has(v.framework)) {
      return false;
    }
    seenFrameworks.add(v.framework);
    return true;
  });

  return uniqueVariants;
}

// Group templates by family
export interface TemplateFamily {
  family: string;
  displayName: string;
  templates: Template[];
  primaryTemplate: Template;
  variantCount: number;
}

export function groupTemplatesByFamily(templates: Template[]): TemplateFamily[] {
  const familyMap = new Map<string, Template[]>();

  // Group templates by family
  templates.forEach(template => {
    const family = template.family || deriveFamily(template.name);
    if (!familyMap.has(family)) {
      familyMap.set(family, []);
    }
    familyMap.get(family)!.push(template);
  });

  // Convert to TemplateFamily objects
  const families: TemplateFamily[] = [];
  familyMap.forEach((groupTemplates, family) => {
    // Pick the best variant to represent the family
    // Priority: Next.js > React > HTML, and prefer Tier 1 > Tier 2 > Tier 3
    const sortedTemplates = [...groupTemplates].sort((a, b) => {
      // First by tier
      if (a.tier !== b.tier) return a.tier - b.tier;
      // Then by framework preference
      const aScore = a.framework.toLowerCase().includes('next') ? 3 :
                     a.framework.toLowerCase().includes('react') ? 2 : 1;
      const bScore = b.framework.toLowerCase().includes('next') ? 3 :
                     b.framework.toLowerCase().includes('react') ? 2 : 1;
      return bScore - aScore;
    });

    const primaryTemplate = sortedTemplates[0];

    families.push({
      family,
      displayName: getBaseTemplateName(primaryTemplate.displayName),
      templates: groupTemplates,
      primaryTemplate,
      variantCount: groupTemplates.length,
    });
  });

  return families;
}
