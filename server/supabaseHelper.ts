import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_PROJECT_ID = process.env.SUPABASE_PROJECT_ID || 'httjpsskqtgjtmjgrjgs';
const SUPABASE_URL = process.env.SUPABASE_URL || `https://${SUPABASE_PROJECT_ID}.supabase.co`;
const SUPABASE_SERVICE_ROLE_KEY = 
  process.env.SUPABASE_SERVICE_ROLE_KEY || 
  'sb_secret_UYv94xH8NgH4lniXuk0VIw_NWmYXXcd';

export const SUPABASE_BUCKET_NAME = process.env.SUPABASE_STORAGE_BUCKET || 'Tech Base Axis Storege';

// Server-side privileged client that bypasses RLS for guaranteed upload success
export const supabaseServerClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

/**
 * Uploads a Buffer directly to Supabase Storage Bucket and returns the global public CDN URL
 */
export async function uploadBufferToSupabase(
  buffer: Buffer,
  filePath: string,
  contentType: string = 'application/octet-stream'
): Promise<{ url: string; fullPath: string; filename: string }> {
  const { data, error } = await supabaseServerClient.storage
    .from(SUPABASE_BUCKET_NAME)
    .upload(filePath, buffer, {
      contentType,
      upsert: true
    });

  if (error) {
    throw new Error(`Supabase upload error: ${error.message}`);
  }

  const { data: pubData } = supabaseServerClient.storage
    .from(SUPABASE_BUCKET_NAME)
    .getPublicUrl(filePath);

  if (!pubData || !pubData.publicUrl) {
    throw new Error('Failed to generate public URL from Supabase');
  }

  return {
    url: pubData.publicUrl,
    fullPath: data?.fullPath || `${SUPABASE_BUCKET_NAME}/${filePath}`,
    filename: filePath.split('/').pop() || 'media_file'
  };
}

/**
 * Express / Connect request handler for /api/supabase/upload
 * Handles incoming raw binary streams or form data and pipes directly into Supabase Storage
 */
export async function handleSupabaseUploadStream(req: any, res: any) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  try {
    const urlObj = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
    const rawFilename = 
      urlObj.searchParams.get('filename') || 
      (req.headers['x-filename'] as string) || 
      `upload_${Date.now()}`;
    const rawFolder = 
      urlObj.searchParams.get('folder') || 
      (req.headers['x-folder'] as string) || 
      'media';
    const contentType = 
      urlObj.searchParams.get('contentType') || 
      (req.headers['content-type'] as string) || 
      'application/octet-stream';

    const safeFilename = rawFilename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const safeFolder = rawFolder.replace(/[^a-zA-Z0-9_-]/g, '');
    const storagePath = `${safeFolder}/${Date.now()}_${safeFilename}`;

    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });

    req.on('end', async () => {
      try {
        const fullBuffer = Buffer.concat(chunks);
        if (fullBuffer.length === 0) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Empty file payload' }));
          return;
        }

        const result = await uploadBufferToSupabase(fullBuffer, storagePath, contentType);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          success: true,
          url: result.url,
          fullPath: result.fullPath,
          filename: safeFilename,
          bucket: SUPABASE_BUCKET_NAME
        }));
      } catch (uploadErr: any) {
        console.error('Supabase upload stream processing error:', uploadErr);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: uploadErr?.message || 'Failed to upload to Supabase' }));
      }
    });

    req.on('error', (streamErr: any) => {
      console.error('Supabase upload stream read error:', streamErr);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: streamErr?.message || 'Stream read error' }));
    });
  } catch (err: any) {
    console.error('Supabase upload stream setup error:', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: err?.message || 'Server error' }));
  }
}
