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
   */
  home: {
    primaryKeyword: 'Tech Base Axis',
    secondaryKeywords: [
      'Bikram Ghosh',
      'Web Development Company Kolkata',
      'Bikram Ghosh Web Developer',
      'Kolkata Web Developers',
      'Custom Software Development Kolkata',
      'Full Stack Developer Kolkata',
      'Cloud Architecture Kolkata',
    ],
    searchIntent: 'Commercial Investigation',
    semanticRole: 'Topical Hub: Establishes Tech Base Axis as the premier web development company founded by Bikram Ghosh in Kolkata.',
    title: 'Tech Base Axis | Web Development Company Kolkata | Bikram Ghosh Web Developer',
    description: 'Tech Base Axis is a premier web development company in Kolkata, founded by Bikram Ghosh. We engineer high-performance web applications, scalable cloud platforms, and bespoke digital solutions.',
    ogTitle: 'Tech Base Axis | Web Development Company in Kolkata',
    ogDescription: 'Full-stack web apps, cloud platforms, automation and AI systems built by Bikram Ghosh. Reliable, secure and fast.',
    ogUrl: 'https://www.tbaonline.online/',
  },

  /**
   * PROJECTS
   */
  projects: {
    primaryKeyword: 'Tech Base Axis Projects',
    secondaryKeywords: [
      'Bikram Ghosh Portfolio',
      'Full Stack Web Developer Portfolio Kolkata',
      'Web Application Case Studies Kolkata',
      'Custom Software Projects',
      'React TypeScript Production Demos',
    ],
    searchIntent: 'Commercial Investigation',
    semanticRole: 'Evidence Node: Validates engineering capabilities with production case studies and live platforms.',
    title: 'Featured Projects & Case Studies | Tech Base Axis | Bikram Ghosh',
    description: 'Explore enterprise web applications, cloud platforms, and production software engineered by Tech Base Axis and founder Bikram Ghosh in Kolkata.',
    ogTitle: 'Featured Projects & Production Systems | Tech Base Axis',
    ogDescription: 'Explore enterprise web applications, cloud platforms, and production software engineered by Tech Base Axis and founder Bikram Ghosh in Kolkata.',
    ogUrl: 'https://www.tbaonline.online/projects',
  },

  /**
   * PACKAGES
   */
  packages: {
    primaryKeyword: 'Tech Base Axis Packages',
    secondaryKeywords: [
      'Web Development Packages Kolkata',
      'Website Development Cost Kolkata',
      'Hire Bikram Ghosh Web Developer',
      'Tech Base Axis Pricing',
      'Custom Web Development Rates India',
    ],
    searchIntent: 'Transactional',
    semanticRole: 'Commercial Offer Node: Targets high-intent clients actively seeking budget, package scope, and hiring options.',
    title: 'Web Development & Maintenance Packages | Tech Base Axis',
    description: 'Transparent website development, custom software solutions, and maintenance packages in Kolkata by Tech Base Axis and Bikram Ghosh.',
    ogTitle: 'Engineering Packages & Pricing | Tech Base Axis',
    ogDescription: 'Transparent website development, custom software solutions, and maintenance packages in Kolkata by Tech Base Axis and Bikram Ghosh.',
    ogUrl: 'https://www.tbaonline.online/packages',
  },

  /**
   * CONTACT
   */
  contact: {
    primaryKeyword: 'Contact Tech Base Axis',
    secondaryKeywords: [
      'Hire Bikram Ghosh',
      'Contact Web Development Company Kolkata',
      'Tech Base Axis Contact',
      'Software Consultation Kolkata',
    ],
    searchIntent: 'Transactional',
    semanticRole: 'Local Action Node: Anchors contact and consultation outreach in Kolkata.',
    title: 'Contact Tech Base Axis | Bikram Ghosh Web Developer Kolkata',
    description: 'Connect with Tech Base Axis and founder Bikram Ghosh in Kolkata, West Bengal for custom web applications, software, apps & AI automation.',
    ogTitle: 'Contact Tech Base Axis | Bikram Ghosh',
    ogDescription: 'Connect with Tech Base Axis and founder Bikram Ghosh in Kolkata, West Bengal for custom web applications, software, apps & AI automation.',
    ogUrl: 'https://www.tbaonline.online/contact',
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
    ogUrl: 'https://www.tbaonline.online/admin',
  },

  /**
   * PRIVACY POLICY
   */
  privacy: {
    primaryKeyword: 'Tech Base Axis Privacy Policy',
    secondaryKeywords: ['Data Protection', 'Client Data Security', 'Bikram Ghosh Privacy'],
    searchIntent: 'Informational',
    semanticRole: 'Legal Transparency Node: Details data processing, encryption, and client rights.',
    title: 'Privacy Policy | TECH BASE AXIS & Bikram Ghosh',
    description: 'Learn how TECH BASE AXIS protects your technical data, project specs, and personal information with enterprise-grade encryption and zero data resale.',
    ogTitle: 'Privacy Policy | TECH BASE AXIS & Bikram Ghosh',
    ogDescription: 'Learn how TECH BASE AXIS protects your technical data, project specs, and personal information with enterprise-grade encryption and zero data resale.',
    ogUrl: 'https://www.tbaonline.online/privacy',
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
    ogUrl: 'https://www.tbaonline.online/terms',
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
