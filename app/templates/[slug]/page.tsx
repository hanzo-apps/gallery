import { templates } from '../../templates-data';
import { notFound } from 'next/navigation';
import { getTemplateVariants, getUniqueTemplates } from '../../lib/template-utils';
import { TemplatePageClient } from './TemplatePageClient';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function TemplatePage({ params }: PageProps) {
  const { slug } = await params;
  const allVariants = getTemplateVariants(templates, slug);

  if (allVariants.length === 0) {
    notFound();
  }

  // Get unique templates for navigation
  const uniqueTemplates = getUniqueTemplates(templates);
  const currentIndex = uniqueTemplates.findIndex(t => t.slug === slug);

  const prevTemplate = currentIndex > 0 ? uniqueTemplates[currentIndex - 1] : null;
  const nextTemplate = currentIndex < uniqueTemplates.length - 1 ? uniqueTemplates[currentIndex + 1] : null;

  return (
    <TemplatePageClient
      variants={allVariants}
      prevTemplate={prevTemplate}
      nextTemplate={nextTemplate}
      currentIndex={currentIndex + 1}
      totalTemplates={uniqueTemplates.length}
      allTemplates={uniqueTemplates}
    />
  );
}
