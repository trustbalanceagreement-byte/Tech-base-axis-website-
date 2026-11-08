import { useEffect } from 'react';
import { NavSection } from '../types';

/**
 * ============================================================================
 * TECH BASE AXIS — SEMANTIC KEYWORD MAPPING & ANTI-CANNIBALIZATION FRAMEWORK
 * ============================================================================
 * 
 * Strategic Purpose:
 * Prevents internal keyword cannibalization between the root homepage and
 * individual deep-link sections (#projects, #packages, #contact) while 
 * optimizing entity relevance for AI generative engines (Google AI Overviews, 
 * Perplexity, ChatGPT Search, Copilot).
 * 
 * Keyword Allocation Hierarchy:
 * - Homepage (#home)    -> Primary: "Web Development Company Kolkata" (Head Brand Agency)
 * - Projects (#projects)-> Primary: "Full Stack Web Developer Portfolio Kolkata" (Proof-of-Work)
 * - Packages (#packages)-> Primary: "Web Development Packages Kolkata" (Pricing/Transactional)
 * - Contact (#contact)  -> Primary: "Contact Web Development Company Kolkata" (Direct Lead Gen)
 * ============================================================================
 */

export interface SectionSEOConfig {
  title: string;
  description: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  searchIntent: 'Navigational' | 'Informational' | 'Commercial Investigation' | 'Transactional' | 'Administrative';
  semanticRole: string;
  ogTitle: string;
  ogDescription: string;
  ogUrl: string;
}

export const SECTION_PATHS: Record<NavSection, string> = {
  home: '/',
  projects: '/projects',
  packages: '/packages',
  contact: '/contact',
  admin: '/admin',
  privacy: '/privacy',
  terms: '/terms',
};

export function sectionFromPath(pathname: string): NavSection | null {
  let clean = pathname.replace(/\/+$/, '') || '/';
  if (clean === '/home' || clean === '/index.html') clean = '/';
  const hit = (Object.keys(SECTION_PATHS) as NavSection[]).find((k) => SECTION_PATHS[k] === clean);
  return hit ?? null;
}

export const SECTION_SEO_MAP: Record<NavSection, SectionSEOConfig> = {
  /**
   * HOMEPAGE (#home)
   * Role: Master Topical Authority & Brand Entity Root
   * Focus: Brand variations (TECH BASE AXIS, TBA, Bikram Ghosh TBA), full technology spectrum in Kalyani & Kolkata, West Bengal.
   */
  home: {
    primaryKeyword: 'TECH BASE AXIS',
    secondaryKeywords: [
      'Tech Base Axis',
      'TBA',
      'Bikram Ghosh',
      'Bikram Ghosh TBA',
      '@bik.ram737',
      'bik.ram737',
      'Kalyani web development company',
      'best web development company in Kolkata',
      'software development company Kalyani',
      'software company in West Bengal',
      'business automation company Kolkata',
      'AI solutions company Kolkata',
      'best IT company in Kalyani',
      'IT company in Nadia West Bengal',
    ],
    searchIntent: 'Commercial Investigation',
    semanticRole: 'Topical Hub: Establishes TECH BASE AXIS (TBA) as the premier technology solutions company founded by Bikram Ghosh in Kalyani, West Bengal.',
    title: 'TECH BASE AXIS | Web Development, Software, Apps & AI Automation in Kalyani',
    description: 'TECH BASE AXIS (TBA) is a technology solutions company in Kalyani, West Bengal, offering professional website development, software, mobile apps, AI solutions and business automation services.',
    ogTitle: 'TECH BASE AXIS | Web Development, Software, Apps & AI Automation in Kalyani',
    ogDescription: 'TECH BASE AXIS (TBA) is a technology solutions company in Kalyani, West Bengal, offering professional website development, software, mobile apps, AI solutions and business automation services.',
    ogUrl: 'https://tbaonline.online/',
  },

  /**
   * PROJECTS
   * Role: Proof of Work & Empirical Evidence Node
   * Focus: Case studies, verified production builds, enterprise software demos.
   */
  projects: {
    primaryKeyword: 'TECH BASE AXIS Projects',
    secondaryKeywords: [
      'Bikram Ghosh TBA',
      'Full Stack Web Developer Portfolio Kolkata',
      'Software Development Company Kalyani Demos',
      'Production React TypeScript Portfolio',
      'Custom Software Development Demos West Bengal',
      'Enterprise Software Solutions India',
    ],
    searchIntent: 'Commercial Investigation',
    semanticRole: 'Evidence Node: Validates engineering capabilities with production case studies and live platforms.',
    title: 'Featured Projects & Case Studies | TECH BASE AXIS | Bikram Ghosh TBA',
    description: 'Explore enterprise web applications, cloud platforms, and production software engineered by TECH BASE AXIS and founder Bikram Ghosh in Kalyani & Kolkata.',
    ogTitle: 'Featured Projects & Production Systems | TECH BASE AXIS',
    ogDescription: 'Explore enterprise web applications, cloud platforms, and production software engineered by TECH BASE AXIS and founder Bikram Ghosh in Kalyani & Kolkata.',
    ogUrl: 'https://tbaonline.online/projects',
  },

  /**
   * PACKAGES
   * Role: Commercial Offer & Transactional Pricing Node
   * Focus: Service tier pricing, package inclusions, subscription & maintenance packages.
   */
  packages: {
    primaryKeyword: 'TECH BASE AXIS Pricing',
    secondaryKeywords: [
      'Web Development Packages Kolkata',
      'Kalyani Web Development Rates',
      'Affordable Website Development Services West Bengal',
      'Hire Bikram Ghosh Web Developer',
      'Website Development Cost Kolkata',
      'Maintenance Packages TECH BASE AXIS',
    ],
    searchIntent: 'Transactional',
    semanticRole: 'Commercial Offer Node: Targets high-intent clients actively seeking budget, package scope, and hiring options.',
    title: 'Web Development & Maintenance Packages | TECH BASE AXIS Pricing',
    description: 'Transparent website development, custom software solutions, and maintenance packages in Kalyani & Kolkata by TECH BASE AXIS and Bikram Ghosh.',
    ogTitle: 'Engineering Packages & Pricing | TECH BASE AXIS Kalyani',
    ogDescription: 'Transparent website development, custom software solutions, and maintenance packages in Kalyani & Kolkata by TECH BASE AXIS and Bikram Ghosh.',
    ogUrl: 'https://tbaonline.online/packages',
  },

  /**
   * CONTACT
   * Role: Conversion & Local Geographic Outreach Node
   * Focus: Direct lead generation, office booking, phone/email contact, consultation with Bikram Ghosh.
   */
  contact: {
    primaryKeyword: 'Contact TECH BASE AXIS',
    secondaryKeywords: [
      'Hire Bikram Ghosh TBA',
      'Web Developer Near Kalyani',
      'IT Services in West Bengal Contact',
      'Software Company Near Kalyani',
      'Tech Base Axis Consultation',
      'Tech Base Axis Office Kalyani',
    ],
    searchIntent: 'Transactional',
    semanticRole: 'Local Action Node: Anchors geographical NAP (Name, Address, Phone) citation relevance for local search queries in Kalyani, Nadia & Kolkata.',
    title: 'Contact TECH BASE AXIS | Hire Web Developer in Kalyani & Kolkata',
    description: 'Connect with TECH BASE AXIS and founder Bikram Ghosh (Bikram Ghosh TBA) in Kalyani, West Bengal for custom web applications, software, apps & AI automation.',
    ogTitle: 'Contact TECH BASE AXIS | Bikram Ghosh TBA',
    ogDescription: 'Connect with TECH BASE AXIS and founder Bikram Ghosh (Bikram Ghosh TBA) in Kalyani, West Bengal for custom web applications, software, apps & AI automation.',
    ogUrl: 'https://tbaonline.online/contact',
  },

  /**
   * ADMIN
   * Role: Internal Operations Console (Excluded from Public Search Indexing)
   */
  admin: {
    primaryKeyword: 'Admin Console',
    secondaryKeywords: ['TECH BASE AXIS Portal', 'Administrative Control'],
    searchIntent: 'Administrative',
    semanticRole: 'Private System Node: Must be ignored by public search engines.',
    title: 'Admin Console | TECH BASE AXIS',
    description: 'Restricted administrative control center for TECH BASE AXIS web engineering platform.',
    ogTitle: 'Admin Console | TECH BASE AXIS',
    ogDescription: 'Restricted administrative control center for TECH BASE AXIS web engineering platform.',
    ogUrl: 'https://tbaonline.online/admin',
  },

  /**
   * PRIVACY POLICY
   */
  privacy: {
    primaryKeyword: 'TECH BASE AXIS Privacy Policy',
    secondaryKeywords: ['Data Protection', 'Client Data Security', 'Bikram Ghosh TBA Privacy'],
    searchIntent: 'Informational',
    semanticRole: 'Legal Transparency Node: Details data processing, encryption, and client rights.',
    title: 'Privacy Policy | TECH BASE AXIS & Bikram Ghosh',
    description: 'Learn how TECH BASE AXIS protects your technical data, project specs, and personal information with enterprise-grade encryption and zero data resale.',
    ogTitle: 'Privacy Policy | TECH BASE AXIS & Bikram Ghosh',
    ogDescription: 'Learn how TECH BASE AXIS protects your technical data, project specs, and personal information with enterprise-grade encryption and zero data resale.',
    ogUrl: 'https://tbaonline.online/privacy',
  },

  /**
   * TERMS & CONDITIONS (INCLUDES REFUND POLICY)
   */
  terms: {
    primaryKeyword: 'TECH BASE AXIS Terms & Conditions',
    secondaryKeywords: ['Strict No-Refund Policy', 'Software Development Agreement', 'Payment Terms'],
    searchIntent: 'Informational',
    semanticRole: 'Legal & Policy Node: Details service terms, milestone billing, and our strict no-refund policy.',
    title: 'Terms & Conditions | Strict No-Refund Policy | TECH BASE AXIS',
    description: 'Review our terms of service, payment milestones, code ownership guarantees, and strict no-refund policy across all digital solutions and services.',
    ogTitle: 'Terms & Conditions & Strict No-Refund Policy | TECH BASE AXIS',
    ogDescription: 'Review our terms of service, payment milestones, code ownership guarantees, and strict no-refund policy across all digital solutions and services.',
    ogUrl: 'https://tbaonline.online/terms',
  },
};

function setOrUpdateMeta(attribute: 'name' | 'property', key: string, content: string) {
  let element = document.querySelector(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

export function useSectionSEO(activeSection: NavSection) {
  useEffect(() => {
    const config = SECTION_SEO_MAP[activeSection] || SECTION_SEO_MAP.home;

    // Update document title
    document.title = config.title;

    // Update standard meta tags with primary keyword leading the list
    const combinedKeywords = [config.primaryKeyword, ...config.secondaryKeywords].join(', ');
    setOrUpdateMeta('name', 'description', config.description);
    setOrUpdateMeta('name', 'keywords', combinedKeywords);

    // Update OpenGraph metadata
    setOrUpdateMeta('property', 'og:title', config.ogTitle);
    setOrUpdateMeta('property', 'og:description', config.ogDescription);
    setOrUpdateMeta('property', 'og:url', config.ogUrl);
    setOrUpdateMeta('property', 'og:site_name', 'Tech Base Axis');

    // Update Twitter card metadata
    setOrUpdateMeta('name', 'twitter:title', config.ogTitle);
    setOrUpdateMeta('name', 'twitter:description', config.ogDescription);

    // Update canonical link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', config.ogUrl);
    setOrUpdateMeta('name', 'twitter:url', config.ogUrl);

    // For admin section, instruct search engines not to index
    let robots = document.querySelector('meta[name="robots"]');
    if (activeSection === 'admin') {
      if (!robots) {
        robots = document.createElement('meta');
        robots.setAttribute('name', 'robots');
        document.head.appendChild(robots);
      }
      robots.setAttribute('content', 'noindex, nofollow');
    } else if (robots) {
      robots.setAttribute('content', 'index, follow');
    }
  }, [activeSection]);
}
