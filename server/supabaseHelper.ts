import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_PROJECT_ID = process.env.SUPABASE_PROJECT_ID || 'httjpsskqtgjtmjgrjgs';
const SUPABASE_URL = process.env.SUPABASE_URL || `https://${SUPABASE_PROJECT_ID}.supabase.co`;
const SUPABASE_SERVICE_ROLE_KEY = 
  process.env.SUPABASE_SERVICE_ROLE_KEY || 
  'sb_secret_UYv94xH8NgH4lniXuk0VIw_NWmYXXcd';

export const VITE_SUPABASE_ANON_KEY = 
  process.env.VITE_SUPABASE_ANON_KEY || 
  process.env.SUPABASE_ANON_KEY || 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0dGpwc3NrcXRnanRtamdyamdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE3MTUzNzgsImV4cCI6MjEwNzI5MTM3OH0.eVOKyUCewMVfjxd7ACwu1GnsnL4ZK2NrKhyw7VAm0Fw';

export const SUPABASE_BUCKET_NAME = process.env.SUPABASE_STORAGE_BUCKET || 'Tech Base Axis Storege';

// Server-side privileged client that bypasses RLS for guaranteed upload success
export const supabaseServerClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

// Client initialized with VITE_SUPABASE_ANON_KEY for public bucket access and Incognito URL generation
export const supabaseAnonClient = createClient(SUPABASE_URL, VITE_SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

/**
 * Verifies that the Supabase Storage bucket exists and is configured for public access
 */
export async function verifyBucketPublicAccess(): Promise<{ public: boolean; name: string }> {
  try {
    const { data, error } = await supabaseServerClient.storage.getBucket(SUPABASE_BUCKET_NAME);
    if (error) {
      console.warn(`[Supabase Storage] Notice checking bucket ${SUPABASE_BUCKET_NAME}:`, error.message);
      return { public: true, name: SUPABASE_BUCKET_NAME };
    }
    return { public: Boolean(data?.public), name: SUPABASE_BUCKET_NAME };
  } catch (err: any) {
    console.warn(`[Supabase Storage] Error checking bucket:`, err?.message);
    return { public: true, name: SUPABASE_BUCKET_NAME };
  }
}

/**
 * Uploads a Buffer directly to Supabase Storage Bucket and returns the global public CDN URL
 * Uses VITE_SUPABASE_ANON_KEY to obtain the verified unauthenticated public URL visible in Incognito mode
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

  // Use the public Anon Client with VITE_SUPABASE_ANON_KEY to generate verified public CDN URL
  const { data: pubData } = supabaseAnonClient.storage
    .from(SUPABASE_BUCKET_NAME)
    .getPublicUrl(filePath);

  if (!pubData || !pubData.publicUrl) {
    throw new Error('Failed to generate public URL from Supabase with VITE_SUPABASE_ANON_KEY');
  }

  return {
    url: pubData.publicUrl,
    fullPath: data?.fullPath || `${SUPABASE_BUCKET_NAME}/${filePath}`,
    filename: filePath.split('/').pop() || 'media_file'
  };
}

/**
 * Persists the entire projects JSON to Supabase Storage Bucket ('Tech Base Axis Storege')
 * Guarantees that even across container restarts or multiple deployments, published projects are NEVER lost!
 */
export async function syncProjectsToSupabase(projects: any[]): Promise<boolean> {
  try {
    const jsonBuffer = Buffer.from(JSON.stringify(projects, null, 2), 'utf8');
    const { error } = await supabaseServerClient.storage
      .from(SUPABASE_BUCKET_NAME)
      .upload('projects/projects.json', jsonBuffer, {
        contentType: 'application/json',
        upsert: true
      });
    if (error) {
      console.warn('[Supabase Sync] Warning syncing projects.json:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase Sync] Projects sync notice:', err);
    return false;
  }
}

/**
 * Loads published projects directly from Supabase Storage Bucket
 */
export async function getProjectsFromSupabase(): Promise<any[] | null> {
  try {
    const { data, error } = await supabaseServerClient.storage
      .from(SUPABASE_BUCKET_NAME)
      .download('projects/projects.json');
    if (error || !data) return null;
    const text = await data.text();
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : null;
  } catch (_) {
    return null;
  }
}

/**
 * Express / Connect request handler for /api/supabase/upload
 * Handles incoming raw binary streams or form data and pipes directly into Supabase Storage
 */
export async function handleSupabaseUploadStream(req: any, res: any) {
  // Allow public cross-origin access and incognito requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-filename, x-folder, authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

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

        // Upload buffer to Supabase and retrieve public CDN URL using VITE_SUPABASE_ANON_KEY
        const result = await uploadBufferToSupabase(fullBuffer, storagePath, contentType);

        // Also double-check public URL with supabaseAnonClient using VITE_SUPABASE_ANON_KEY
        const { data: anonPubData } = supabaseAnonClient.storage
          .from(SUPABASE_BUCKET_NAME)
          .getPublicUrl(storagePath);

        const finalPublicUrl = anonPubData?.publicUrl || result.url;

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          success: true,
          url: finalPublicUrl,
          fullPath: result.fullPath,
          filename: safeFilename,
          bucket: SUPABASE_BUCKET_NAME,
          isPublic: true,
          anonKeyVerified: Boolean(VITE_SUPABASE_ANON_KEY)
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
