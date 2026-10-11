import React from 'react';
import { TechBaseAxisLogo } from './TechBaseAxisLogo';
import { NavSection } from '../types';
import { FOUNDER_INFO } from '../data/mockData';
import { 
  OfficialGmailIcon, 
  OfficialWhatsAppIcon, 
  OfficialFacebookIcon, 
  OfficialInstagramIcon, 
  OfficialLinkedInIcon 
} from './ui/SocialIcons';

interface FooterProps {
  onNavigate?: (section: NavSection) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-neutral-800/80 bg-[#070709] py-8 text-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-6 border-b border-neutral-800/80">
          
          {/* Brand Column */}
          <div className="md:col-span-6 space-y-2.5">
            <TechBaseAxisLogo size="md" subtitle="SYSTEM ARCHITECTURE" />
            <p className="text-xs text-neutral-400 max-w-md leading-relaxed">
              Obsidian-grade software engineering, scalable cloud infrastructure, and bespoke generative intelligence systems architected by <span className="text-white font-semibold">{FOUNDER_INFO.name}</span>.
            </p>
          </div>

          {/* Follow Us / Social Links Column */}
          <div className="md:col-span-6 space-y-3">
            <div className="text-sm font-bold tracking-wide text-white">
              Follow Us
            </div>

            <div className="flex items-center gap-3.5 pt-1">
              {/* Gmail */}
              <a
                id="footer-social-gmail"
                href={`mailto:${FOUNDER_INFO.email}`}
                title="Gmail: techbaseaxis@gmail.com"
                aria-label="Gmail"
                className="transition-transform duration-200 hover:scale-115 active:scale-95 cursor-pointer inline-flex items-center justify-center"
              >
                <OfficialGmailIcon className="w-[26px] h-[26px] drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]" />
              </a>

              {/* WhatsApp */}
              <a
                id="footer-social-whatsapp"
                href={`https://wa.me/${FOUNDER_INFO.whatsappRaw || '919477201106'}`}
                target="_blank"
                rel="noopener noreferrer"
                title="WhatsApp: +91 94772 01106"
                aria-label="WhatsApp"
                className="transition-transform duration-200 hover:scale-115 active:scale-95 cursor-pointer inline-flex items-center justify-center"
              >
                <OfficialWhatsAppIcon className="w-[26px] h-[26px] drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]" />
              </a>

              {/* Facebook */}
              <a
                id="footer-social-facebook"
                href={FOUNDER_INFO.facebookUrl || "https://www.facebook.com/share/14k5nbF6FpS/"}
                target="_blank"
                rel="noopener noreferrer"
                title="Facebook"
                aria-label="Facebook"
                className="transition-transform duration-200 hover:scale-115 active:scale-95 cursor-pointer inline-flex items-center justify-center"
              >
                <OfficialFacebookIcon className="w-[26px] h-[26px] drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]" />
              </a>

              {/* Instagram */}
              <a
                id="footer-social-instagram"
                href={FOUNDER_INFO.instagramUrl || "https://www.instagram.com/tba7.01?igsh=MWNmYjFjcHBtdThzOQ=="}
                target="_blank"
                rel="noopener noreferrer"
                title="Instagram"
                aria-label="Instagram"
                className="transition-transform duration-200 hover:scale-115 active:scale-95 cursor-pointer inline-flex items-center justify-center"
              >
                <OfficialInstagramIcon className="w-[26px] h-[26px] drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]" />
              </a>

              {/* LinkedIn */}
              <a
                id="footer-social-linkedin"
                href={FOUNDER_INFO.linkedinUrl || "https://www.linkedin.com/in/tech-base-axis-b19b30411"}
                target="_blank"
                rel="noopener noreferrer"
                title="LinkedIn"
                aria-label="LinkedIn"
                className="transition-transform duration-200 hover:scale-115 active:scale-95 cursor-pointer inline-flex items-center justify-center"
              >
                <OfficialLinkedInIcon className="w-[26px] h-[26px] drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]" />
              </a>
            </div>

            <div className="text-[11px] font-mono text-neutral-500">
              Operating under Tech Base Axis architecture guidelines.
            </div>
          </div>
        </div>

        {/* Sub-Footer */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-neutral-500">
          <div>
            © {currentYear} Tech Base Axis • Designed & Engineered by Bikram Ghosh. All Rights Reserved.
          </div>
          {onNavigate && (
            <div>
              <button
                id="footer-founder-portal-link"
                onClick={() => {
                  onNavigate('admin');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="transition-colors cursor-pointer text-[11px] font-mono text-neutral-600 hover:text-red-400"
              >
                Founder Console
              </button>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
};
