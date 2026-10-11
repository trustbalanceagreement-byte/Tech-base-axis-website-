import React, { useState } from 'react';
import { getAutoAvatarUrl } from '../utils/avatar';
import { ADMIN_EMAILS } from '../context/AuthContext';

interface UserAvatarProps {
  user?: {
    email?: string | null;
    photoURL?: string | null;
    displayName?: string | null;
  } | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ user, size = 'sm', className = '' }) => {
  const [hasError, setHasError] = useState(false);
  const avatarUrl = getAutoAvatarUrl(user);

  const isFounder = Boolean(
    user?.email && ADMIN_EMAILS.some((adm) => adm.toLowerCase() === user.email?.toLowerCase())
  );

  const altText = isFounder
    ? 'Bikram Ghosh, founder and web developer at Tech Base Axis'
    : user?.displayName
    ? `${user.displayName} profile avatar`
    : user?.email
    ? `${user.email} profile avatar`
    : 'User profile avatar';

  const initial = (
    user?.displayName?.[0] || 
    user?.email?.[0] || 
    'U'
  ).toUpperCase();

  const sizeClasses = {
    xs: 'w-4 h-4 text-[9px]',
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-2xl'
  }[size];

  if (!avatarUrl || hasError) {
    return (
      <div 
        className={`rounded-full bg-gradient-to-tr from-red-600 to-red-800 text-white font-bold flex items-center justify-center shrink-0 shadow-sm border border-red-500/40 select-none ${sizeClasses} ${className}`}
      >
        <span>{initial}</span>
      </div>
    );
  }

  return (
    <div className={`relative rounded-full overflow-hidden shrink-0 border border-red-500/40 bg-neutral-900 shadow-sm ${sizeClasses} ${className}`}>
      <img
        src={avatarUrl}
        alt={altText}
        onError={() => setHasError(true)}
        className="w-full h-full object-cover object-center"
        referrerPolicy="no-referrer"
      />
    </div>
  );
};
