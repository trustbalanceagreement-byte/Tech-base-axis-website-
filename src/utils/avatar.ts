import founderImage from '../assets/images/bikram-ghosh-developer-avatar.webp';
import { ADMIN_EMAILS } from '../context/AuthContext';

/**
 * Automatically resolves the profile photo (DP) for any user account.
 * For Google/Gmail users, returns high-resolution Google/Unavatar DP,
 * for the Founder (techbaseaxis@gmail.com / bgho40185@gmail.com), returns Bikram Ghosh's photo.
 */
export function getAutoAvatarUrl(user?: { email?: string | null; photoURL?: string | null; displayName?: string | null } | null): string {
  if (!user) return '';

  const email = (user.email || '').trim().toLowerCase();

  // Founder / Admin emails always use Bikram Ghosh's official photo
  if (email && ADMIN_EMAILS.some(adm => adm.toLowerCase() === email)) {
    return founderImage;
  }

  // If Firebase or Google Auth already supplied a photoURL, use it
  if (user.photoURL && user.photoURL.trim() !== '') {
    return user.photoURL;
  }

  // If user has a Gmail or any email, automatically load their Google/Gravatar profile picture
  if (email) {
    const encoded = encodeURIComponent(email);
    const fallbackName = encodeURIComponent(user.displayName || email.split('@')[0] || 'User');
    const uiAvatarFallback = encodeURIComponent(`https://ui-avatars.com/api/?name=${fallbackName}&background=e61e2b&color=ffffff&bold=true`);
    
    // unavatar fetches the public Google Account picture for Gmail addresses
    return `https://unavatar.io/google/${encoded}?fallback=${uiAvatarFallback}`;
  }

  return '';
}
