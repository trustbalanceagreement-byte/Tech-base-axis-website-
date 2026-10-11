import React from 'react';
import tabLogo from '../assets/images/tech-base-axis-logo.webp';

interface TechBaseAxisLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | string | number;
  showText?: boolean;
  subtitle?: string;
}

export const TechBaseAxisLogo: React.FC<TechBaseAxisLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  subtitle = 'BIKRAM GHOSH'
}) => {
  const sizeMap: Record<string, { imgH: string; text: string; sub: string }> = {
    sm: { imgH: 'h-6 sm:h-7 md:h-8', text: 'text-xs sm:text-sm md:text-base', sub: 'text-[7px] sm:text-[8px] md:text-[9px]' },
    md: { imgH: 'h-7 sm:h-9 md:h-11', text: 'text-sm sm:text-base md:text-lg', sub: 'text-[8px] sm:text-[9px] md:text-[10px]' },
    lg: { imgH: 'h-10 sm:h-12 md:h-14', text: 'text-lg sm:text-xl', sub: 'text-[10px] sm:text-xs' },
    xl: { imgH: 'h-14 sm:h-16 md:h-20', text: 'text-xl sm:text-2xl', sub: 'text-xs sm:text-sm' },
  };

  const dim = sizeMap[String(size)] || sizeMap.md;

  return (
    <div className={`inline-flex items-center gap-2 sm:gap-2.5 md:gap-3 select-none ${className}`}>
      {/* Official Metallic Silver TAB Monogram Brand Logo */}
      <div className="relative flex items-center justify-center shrink-0">
        <img
          src={tabLogo}
          alt="Tech Base Axis - Web Development Company Kolkata Brand Logo"
          className={`${dim.imgH} w-auto object-contain transition-transform duration-300 group-hover:scale-105 filter drop-shadow-[0_2px_12px_rgba(255,255,255,0.22)]`}
        />
      </div>

      {/* Typography / Wordmark */}
      {showText && (
        <div className="flex flex-col leading-tight min-w-0">
          <div className={`font-bold tracking-tight text-white flex items-center gap-1 sm:gap-1.5 whitespace-nowrap ${dim.text}`}>
            <span>TECH BASE</span>
            <span 
              className="text-[#e61e2b] font-bold" 
              style={{ fontFamily: 'Arial', fontWeight: 'bold' }}
            >
              AXIS
            </span>
          </div>
          {subtitle && (
            <div className={`text-neutral-400 font-mono tracking-wider sm:tracking-widest uppercase flex items-center gap-1 sm:gap-1.5 whitespace-nowrap ${dim.sub}`}>
              <span className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-[#e61e2b] inline-block animate-pulse shrink-0" />
              {subtitle.includes(' // ') ? (
                <span>
                  <span>{subtitle.split(' // ')[0]}</span>
                  <span className="hidden sm:inline text-neutral-500"> // {subtitle.split(' // ')[1]}</span>
                </span>
              ) : (
                <span>{subtitle}</span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

