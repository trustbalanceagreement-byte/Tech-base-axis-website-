import { storage, ref, uploadBytesResumable, getDownloadURL, db, collection, getDocs } from '../lib/firebase';

export interface UploadProgressInfo {
  percent: number;
  bytesTransferred: number;
  totalBytes: number;
  formattedTransferred: string;
  formattedTotal: string;
  state: 'running' | 'paused' | 'success' | 'error' | 'canceled';
}

export interface UploadResult {
  url: string;
  provider: 'firebase' | 'server';
  filename: string;
  storagePath: string;
  mimeType: string;
  fileSizeBytes: number;
}

export interface UploadOptions {
  projectId?: string;
  folder?: 'images' | 'videos';
  onProgress?: (info: UploadProgressInfo) => void;
  onCancelRef?: (cancelFn: () => void) => void;
}

/**
 * Format raw bytes into human readable format (KB, MB, GB)
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Validate video file type and size before uploading
 * Default max size: 500 MB (supports full HD videos, reels, and product demos)
 */
export function validateVideoFile(file: File, maxSizeMB = 500): { valid: boolean; error?: string } {
  const validTypes = [
    'video/mp4',
    'video/webm',
    'video/ogg',
    'video/quicktime',
    'video/x-m4v'
  ];
  const extension = file.name.split('.').pop()?.toLowerCase();
  const validExtensions = ['mp4', 'webm', 'ogg', 'mov', 'm4v'];

  const isTypeValid = validTypes.includes(file.type) || (extension && validExtensions.includes(extension));
  if (!isTypeValid) {
    return {
      valid: false,
      error: `Invalid video format (${file.type || extension || 'unknown'}). Please select an MP4 or WebM video file.`
    };
  }

  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `Video file size (${formatFileSize(file.size)}) exceeds the ${maxSizeMB} MB limit. Please compress the file or paste an external video link.`
    };
  }

  return { valid: true };
}

/**
 * Validate photo file type and size before uploading
 * Default max size: 50 MB
 */
export function validatePhotoFile(file: File, maxSizeMB = 50): { valid: boolean; error?: string } {
  const validTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/svg+xml',
    'image/gif',
    'image/avif'
  ];
  const extension = file.name.split('.').pop()?.toLowerCase();
  const validExtensions = ['jpg', 'jpeg', 'png', 'webp', 'svg', 'gif', 'avif'];

  const isTypeValid = validTypes.includes(file.type) || (extension && validExtensions.includes(extension));
  if (!isTypeValid) {
    return {
      valid: false,
      error: `Invalid image format (${file.type || extension || 'unknown'}). Please select a JPG, PNG, WebP, SVG, or GIF file.`
    };
  }

  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `Image file size (${formatFileSize(file.size)}) exceeds the ${maxSizeMB} MB limit.`
    };
  }

  return { valid: true };
}

/**
 * Test if Cloud Firestore backend is reachable
 */
export async function checkFirestoreHealth(): Promise<{ online: boolean; message: string }> {
  try {
    const snap = await getDocs(collection(db, 'projects'));
    return {
      online: true,
      message: `Connected (${snap.size} projects in cloud)`
    };
  } catch (err: any) {
    const isNotFound = err?.message?.includes('NOT_FOUND') || err?.code === 'not-found';
    if (isNotFound) {
      return {
        online: false,
        message: 'Firestore database not yet created in Firebase Console'
      };
    }
    return {
      online: false,
      message: err?.message || 'Connection error'
    };
  }
}

/**
 * Uploads media directly to Firebase Storage with resumable tracking.
 * If Firebase Storage bucket is not yet provisioned in Firebase console,
 * seamlessly falls back to the server storage bridge (/api/upload).
 */
export async function uploadMediaToCloud(
  file: File,
  folderOrOptions: 'images' | 'videos' | UploadOptions = 'videos',
  legacyOnProgress?: (percent: number) => void
): Promise<UploadResult> {
  const options: UploadOptions = typeof folderOrOptions === 'string' 
    ? { folder: folderOrOptions, onProgress: legacyOnProgress ? (info) => legacyOnProgress(info.percent) : undefined }
    : folderOrOptions;

  const folder = options.folder || (file.type.startsWith('image/') ? 'images' : 'videos');
  const projectId = options.projectId || 'general';
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filename = `${Date.now()}_${sanitizedName}`;
  const storagePath = `projects/${projectId}/media/${filename}`;

  // 1. PRIMARY: Instant direct binary stream to server (super fast, no memory blowup, instant response)
  try {
    const rawResult = await new Promise<UploadResult>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      if (options.onCancelRef) {
        options.onCancelRef(() => xhr.abort());
      }
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const json = JSON.parse(xhr.responseText);
            if (json && json.url) {
              resolve({
                url: json.url,
                provider: 'server',
                filename: json.filename || filename,
                storagePath: json.url,
                mimeType: file.type || (folder === 'images' ? 'image/jpeg' : 'video/mp4'),
                fileSizeBytes: file.size
              });
              return;
            }
          } catch (err) {
            reject(err);
          }
        }
        reject(new Error(`Upload failed with status ${xhr.status}`));
      };
      xhr.onerror = () => reject(new Error('Network error on stream upload'));
      xhr.open('POST', `/api/upload-raw?filename=${encodeURIComponent(filename)}&folder=${encodeURIComponent(folder)}`);
      xhr.send(file);
    });

    return rawResult;
  } catch (primaryErr) {
    console.warn('[Direct Stream Upload] Fast stream notice:', primaryErr);

    // 2. FALLBACK: Try /api/upload/raw route
    try {
      const fallbackResult = await new Promise<UploadResult>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const json = JSON.parse(xhr.responseText);
              if (json && json.url) {
                resolve({
                  url: json.url,
                  provider: 'server',
                  filename: json.filename || filename,
                  storagePath: json.url,
                  mimeType: file.type || (folder === 'images' ? 'image/jpeg' : 'video/mp4'),
                  fileSizeBytes: file.size
                });
                return;
              }
            } catch (err) {
              reject(err);
            }
          }
          reject(new Error(`Fallback failed with status ${xhr.status}`));
        };
        xhr.onerror = () => reject(new Error('Fallback network error'));
        xhr.open('POST', `/api/upload/raw?filename=${encodeURIComponent(filename)}&folder=${encodeURIComponent(folder)}`);
        xhr.send(file);
      });

      return fallbackResult;
    } catch (fallbackErr) {
      console.warn('[Direct Stream Fallback] Notice:', fallbackErr);
    }
    try {
      if (options.onProgress) {
        options.onProgress({
          percent: 25,
          bytesTransferred: Math.round(file.size * 0.25),
          totalBytes: file.size,
          formattedTransferred: formatFileSize(Math.round(file.size * 0.25)),
          formattedTotal: formatFileSize(file.size),
          state: 'running'
        });
      }

      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      if (options.onProgress) {
        options.onProgress({
          percent: 65,
          bytesTransferred: Math.round(file.size * 0.65),
          totalBytes: file.size,
          formattedTransferred: formatFileSize(Math.round(file.size * 0.65)),
          formattedTotal: formatFileSize(file.size),
          state: 'running'
        });
      }

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename,
          folder,
          contentType: file.type,
          data: base64Data
        })
      });

      if (response.ok) {
        const json = await response.json();
        if (json && json.url) {
          if (options.onProgress) {
            options.onProgress({
              percent: 100,
              bytesTransferred: file.size,
              totalBytes: file.size,
              formattedTransferred: formatFileSize(file.size),
              formattedTotal: formatFileSize(file.size),
              state: 'success'
            });
          }

          return {
            url: json.url,
            provider: 'server',
            filename: json.filename || filename,
            storagePath: `/uploads/${folder}/${filename}`,
            mimeType: file.type || (folder === 'images' ? 'image/jpeg' : 'video/mp4'),
            fileSizeBytes: file.size
          };
        }
      } else {
        const errorText = await response.text().catch(() => '');
        console.warn('[Server Storage Bridge] Upload HTTP error:', response.status, errorText);
      }
    } catch (serverErr) {
      console.warn('[Server Storage Bridge] Bridge upload error:', serverErr);
    }

    throw new Error(
      `Media upload failed: Firebase Storage bucket is not ready in Firebase console, and server bridge encountered an error. Please verify Firebase Storage bucket is created at https://console.firebase.google.com/project/my-portfolio-website-d9419/storage`
    );
  }
}
