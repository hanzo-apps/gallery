import { z } from 'zod';

// Safe template identifier - no path traversal
export const TemplateSlugSchema = z.string()
  .regex(/^[a-z0-9-]+$/, 'Invalid template identifier')
  .min(1)
  .max(100);

// Download params validation
export const DownloadParamsSchema = z.object({
  template: TemplateSlugSchema
});

// Build request validation
export const BuildRequestSchema = z.object({
  templateName: z.string().min(1).max(100),
  templatePath: z.string().min(1),
  framework: z.string().min(1).max(50)
});
