import { NextRequest, NextResponse } from 'next/server';
import { templates } from '../../../templates-data';
import archiver from 'archiver';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { DownloadParamsSchema } from '@/app/lib/validation';

interface RouteParams {
  params: Promise<{
    template: string;
  }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { template: templateName } = await params;

    // Validate template identifier
    try {
      DownloadParamsSchema.parse({ template: templateName });
    } catch {
      return NextResponse.json(
        { error: 'Invalid template identifier' },
        { status: 400 }
      );
    }

    // Find the template by slug
    const foundTemplate = templates.find(t => t.slug === decodeURIComponent(templateName));

    if (!foundTemplate) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Template path (absolute)
    // Use environment variable or resolve relative to project root
    const TEMPLATES_ROOT = process.env.TEMPLATES_ROOT || path.resolve(process.cwd(), '../../');
    const templatePath = path.join(TEMPLATES_ROOT, foundTemplate.path);

    // Check if path exists
    if (!fs.existsSync(templatePath)) {
      return NextResponse.json(
        { error: 'Template path does not exist', path: templatePath },
        { status: 404 }
      );
    }

    // Create a temporary directory for the zip
    // Use environment variable or system temp directory
    const tmpDir = process.env.TEMP_DIR || path.join(os.tmpdir(), 'hanzo-template-downloads');
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }

    // Sanitize filename
    const safeTemplateName = foundTemplate.name.replace(/[^a-zA-Z0-9-_]/g, '-');
    const zipFileName = `${safeTemplateName}-hanzo.zip`;
    const zipPath = path.join(tmpDir, zipFileName);

    // Remove old zip if exists
    if (fs.existsSync(zipPath)) {
      fs.unlinkSync(zipPath);
    }

    // Create zip using archiver (safer than shell commands)
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', {
      zlib: { level: parseInt(process.env.ZIP_COMPRESSION_LEVEL || '9') }
    });

    // Handle events
    output.on('close', () => {
      console.log(`Created zip: ${archive.pointer()} total bytes`);
    });

    archive.on('error', (err) => {
      throw err;
    });

    // Pipe archive to output file
    archive.pipe(output);

    // Add template directory with exclusions
    archive.glob('**/*', {
      cwd: templatePath,
      ignore: [
        'node_modules/**',
        '.next/**',
        '.git/**',
        'build/**',
        'dist/**',
        '**/.DS_Store',
        '**/*.log',
        '**/.env.local',
        '**/.env'
      ]
    });

    // Finalize the archive and wait for it to complete
    try {
      await archive.finalize();
    } catch (error) {
      console.error('Zip creation error:', error);
      return NextResponse.json(
        { error: 'Failed to create zip file', details: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }

    // Wait for the output stream to finish writing
    await new Promise<void>((resolve, reject) => {
      output.on('finish', resolve);
      output.on('error', reject);
    });

    // Read the zip file
    const zipBuffer = fs.readFileSync(zipPath);

    // Clean up the zip file after a delay
    setTimeout(() => {
      try {
        if (fs.existsSync(zipPath)) {
          fs.unlinkSync(zipPath);
        }
      } catch (error) {
        console.error('Failed to clean up zip file:', error);
      }
    }, 60000); // Clean up after 1 minute

    // Return the zip file
    return new NextResponse(zipBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${zipFileName}"`,
        'Content-Length': zipBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
