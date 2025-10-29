import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const PREVIEWS_DIR = path.resolve(process.cwd(), 'public/previews');

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const templateName = searchParams.get('template');

  if (!templateName) {
    return NextResponse.json(
      { error: 'Template name required' },
      { status: 400 }
    );
  }

  const previewPath = path.join(PREVIEWS_DIR, templateName);

  // Check if preview exists
  if (!fs.existsSync(previewPath)) {
    return NextResponse.json(
      { error: 'Template not built yet', pages: [] },
      { status: 404 }
    );
  }

  try {
    // Find all HTML files recursively
    const htmlFiles: string[] = [];

    function findHtmlFiles(dir: string, baseDir: string = dir) {
      const files = fs.readdirSync(dir, { withFileTypes: true });

      for (const file of files) {
        const fullPath = path.join(dir, file.name);

        if (file.isDirectory()) {
          // Skip common build artifact directories
          if (['node_modules', '.next', 'dist', 'build'].includes(file.name)) {
            continue;
          }
          findHtmlFiles(fullPath, baseDir);
        } else if (file.name.endsWith('.html')) {
          // Get relative path from preview directory
          const relativePath = path.relative(baseDir, fullPath);
          htmlFiles.push(relativePath);
        }
      }
    }

    findHtmlFiles(previewPath);

    // Sort files: index.html first, then alphabetically
    htmlFiles.sort((a, b) => {
      if (a === 'index.html') return -1;
      if (b === 'index.html') return 1;
      return a.localeCompare(b);
    });

    return NextResponse.json({
      success: true,
      pages: htmlFiles.length > 0 ? htmlFiles : ['index.html'],
      count: htmlFiles.length,
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: message, pages: [] },
      { status: 500 }
    );
  }
}
