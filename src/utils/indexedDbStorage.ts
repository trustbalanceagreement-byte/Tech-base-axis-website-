import { Project } from '../types';

const DB_NAME = 'TechBaseAxisStorageDB';
const DB_VERSION = 1;
const STORE_NAME = 'projects_store';
const RECORD_KEY = 'all_projects';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error || new Error('Failed to open IndexedDB'));
    };
  });
}

/**
 * Persist projects to high-capacity IndexedDB (bypasses 5MB localStorage limit)
 */
export async function saveProjectsToDB(projects: Project[]): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const putRequest = store.put(projects, RECORD_KEY);

      putRequest.onsuccess = () => resolve();
      putRequest.onerror = () => reject(putRequest.error);

      transaction.oncomplete = () => db.close();
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (err) {
    console.warn('IndexedDB save failed, falling back to local storage:', err);
  }
}

/**
 * Load projects from high-capacity IndexedDB
 */
export async function loadProjectsFromDB(): Promise<Project[] | null> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const getRequest = store.get(RECORD_KEY);

      getRequest.onsuccess = () => {
        const result = getRequest.result;
        if (Array.isArray(result)) {
          resolve(result);
        } else {
          resolve(null);
        }
      };

      getRequest.onerror = () => reject(getRequest.error);
      transaction.oncomplete = () => db.close();
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (err) {
    console.warn('IndexedDB load failed:', err);
    return null;
  }
}

/**
 * Clear projects from IndexedDB
 */
export async function clearProjectsFromDB(): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const deleteRequest = store.delete(RECORD_KEY);

      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => reject(deleteRequest.error);

      transaction.oncomplete = () => db.close();
    });
  } catch (err) {
    console.warn('IndexedDB clear failed:', err);
  }
}

/**
 * Compresses an image file client-side before storing or previewing.
 * Reduces 5-15MB camera photos to 100-300KB with crystal clarity.
 */
export function compressImageFile(
  file: File,
  maxWidth = 1600,
  maxHeight = 1600,
  quality = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    // If SVG, no canvas compression needed
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Use WebP if supported, otherwise JPEG
        let compressed = '';
        try {
          compressed = canvas.toDataURL('image/webp', quality);
          if (!compressed.startsWith('data:image/webp')) {
            compressed = canvas.toDataURL('image/jpeg', quality);
          }
        } catch {
          compressed = canvas.toDataURL('image/jpeg', quality);
        }

        resolve(compressed);
      };
      img.onerror = () => {
        // Fallback to raw data url if canvas fails
        resolve(reader.result as string);
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
