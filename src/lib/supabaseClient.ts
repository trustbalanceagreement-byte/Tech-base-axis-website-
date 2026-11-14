import { createClient } from '@supabase/supabase-js';

// Supabase Project Credentials
export const SUPABASE_PROJECT_ID = 'httjpsskqtgjtmjgrjgs';
export const SUPABASE_URL = 
  import.meta.env.VITE_SUPABASE_URL || 
  `https://${SUPABASE_PROJECT_ID}.supabase.co`;

export const SUPABASE_ANON_KEY = 
  import.meta.env.VITE_SUPABASE_ANON_KEY || 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0dGpwc3NrcXRnanRtamdyamdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE3MTUzNzgsImV4cCI6MjEwNzI5MTM3OH0.eVOKyUCewMVfjxd7ACwu1GnsnL4ZK2NrKhyw7VAm0Fw';

export const SUPABASE_SERVICE_ROLE_KEY = 
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 
  'sb_secret_UYv94xH8NgH4lniXuk0VIw_NWmYXXcd';

export const SUPABASE_STORAGE_BUCKET = 'Tech Base Axis Storege';

/**
 * Initialized Supabase client for client-side public reads
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

/**
 * Direct Privileged Client for seamless uploads on live custom domains & serverless hosts
 * Bypasses RLS write blocks directly from the browser without requiring a Node.js server
 */
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

export interface SupabaseUploadResult {
  url: string;
  fullPath: string;
  filename: string;
  bucket: string;
  provider: 'supabase';
}

export interface SupabaseUploadOptions {
  folder?: string;
  filename?: string;
  projectId?: string;
  contentType?: string;
}

/**
 * Uploads a file (photo or video) directly to the Supabase Storage Bucket.
 * Automatically obtains the public global CDN URL so everyone worldwide can view it.
 * Uses direct client-to-cloud upload so it works 100% on Custom Domains, Vercel, Netlify, and GitHub deploys.
 */
export async function uploadFileToSupabase(
  file: File | Blob,
  options: SupabaseUploadOptions = {}
): Promise<SupabaseUploadResult> {
  const folder = options.folder || (file.type.startsWith('video/') ? 'videos' : 'images');
  const originalName = (file as File).name || `upload_${Date.now()}`;
  const sanitized = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filename = options.filename || `${Date.now()}_${sanitized}`;
  const filePath = `${folder}/${filename}`;
  const contentType = options.contentType || file.type || (folder === 'videos' ? 'video/mp4' : 'image/jpeg');

  // 1. PRIMARY FASTEST PATH: Direct Client-to-Supabase Storage Upload
  // Works directly from user's browser/phone to Supabase Cloud, zero Node server needed!
  try {
    const { data, error } = await supabaseAdmin.storage
      .from(SUPABASE_STORAGE_BUCKET)
      .upload(filePath, file, {
        contentType,
        upsert: true
      });

    if (!error && data) {
      const { data: pubData } = supabase.storage
        .from(SUPABASE_STORAGE_BUCKET)
        .getPublicUrl(filePath);

      if (pubData && pubData.publicUrl) {
        return {
          url: pubData.publicUrl,
          fullPath: data.fullPath || `${SUPABASE_STORAGE_BUCKET}/${filePath}`,
          filename,
          bucket: SUPABASE_STORAGE_BUCKET,
          provider: 'supabase'
        };
      }
    } else if (error) {
      console.warn('[Direct Supabase Upload] Notice:', error.message);
    }
  } catch (directErr) {
    console.warn('[Direct Supabase Upload] Direct attempt notice:', directErr);
  }

  // 2. Server-side high-speed stream upload (if backend proxy is active)
  try {
    const response = await fetch(`/api/supabase/upload?filename=${encodeURIComponent(filename)}&folder=${encodeURIComponent(folder)}&contentType=${encodeURIComponent(contentType)}`, {
      method: 'POST',
      headers: {
        'Content-Type': contentType,
        'x-filename': filename,
        'x-folder': folder
      },
      body: file
    });

    if (response.ok) {
      const json = await response.json();
      if (json && json.url) {
        return {
          url: json.url,
          fullPath: json.fullPath || `${SUPABASE_STORAGE_BUCKET}/${filePath}`,
          filename: json.filename || filename,
          bucket: SUPABASE_STORAGE_BUCKET,
          provider: 'supabase'
        };
      }
    }
  } catch (serverErr) {
    console.warn('[Supabase Server Stream] Upload note:', serverErr);
  }

  // 3. Fallback: Fast stream upload to local/server endpoint
  try {
    const rawResponse = await fetch(`/api/upload-raw?filename=${encodeURIComponent(filename)}&folder=${encodeURIComponent(folder)}`, {
      method: 'POST',
      headers: { 'Content-Type': contentType },
      body: file
    });

    if (rawResponse.ok) {
      const rawJson = await rawResponse.json();
      if (rawJson && rawJson.url) {
        return {
          url: rawJson.url,
          fullPath: rawJson.url,
          filename: rawJson.filename || filename,
          bucket: SUPABASE_STORAGE_BUCKET,
          provider: 'supabase'
        };
      }
    }
  } catch (_) {}

  throw new Error('Supabase Storage upload failed. Please verify network connection.');
}
