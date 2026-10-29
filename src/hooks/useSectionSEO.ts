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

export const SECTION_SEO_MAP: Record<NavSection, SectionSEOConfig> = {
  /**
   * HOMEPAGE (#home)
   * Role: Master Topical Authority & Brand Entity Root
   * Focus: Broad organizational credibility, core full-stack service offering in Kolkata.
   */
  home: {
    primaryKeyword: 'Web Development Company Kolkata',
    secondaryKeywords: [
      'Bikram Ghosh Web Developer',
      'Tech Base Axis',
      'Kolkata Web Developers',
      'Custom Software Development Kolkata',
      'Full Stack Developer Kolkata',
      'Cloud Architecture Kolkata',
    ],
    searchIntent: 'Commercial Investigation',
    semanticRole: 'Topical Hub: Establishes Tech Base Axis as the top-tier web development firm founded by Bikram Ghosh in Kolkata.',
    title: 'Tech Base Axis | Web Development Company Kolkata | Bikram Ghosh Web Developer',
    description: 'Tech Base Axis is a premier web development company in Kolkata, founded by Bikram Ghosh. We engineer high-performance web applications, scalable cloud platforms, and bespoke digital solutions.',
    ogTitle: 'Tech Base Axis | Web Development Company Kolkata | Bikram Ghosh Web Developer',
    ogDescription: 'Tech Base Axis is a premier web development company in Kolkata, founded by Bikram Ghosh. We engineer high-performance web applications, scalable cloud platforms, and bespoke digital solutions.',
    ogUrl: 'https://www.tbaonline.online',
  },

  /**
   * PROJECTS
   * Role: Proof of Work & Empirical Evidence Node
   * Focus: Case studies, verified production builds, and technology stack demonstrations.
   * Anti-Cannibalization Rule: Quarantines "Portfolio", "Case Studies", and "Demos" away from the homepage.
   */
  projects: {
    primaryKeyword: 'Full Stack Web Developer Portfolio Kolkata',
    secondaryKeywords: [
      'Bikram Ghosh Web Developer',
      'Web Application Case Studies Kolkata',
      'Tech Base Axis Projects',
      'Production React TypeScript Portfolio',
      'Custom Software Development Demos Kolkata',
    ],
    searchIntent: 'Commercial Investigation',
    semanticRole: 'Evidence Node: Validates engineering capabilities with production case studies, preventing query overlap with general agency inquiries.',
    title: 'Projects & Case Studies | Bikram Ghosh Web Developer | Kolkata',
    description: 'Explore production software, web apps, and digital solutions delivered by Kolkata web development company Tech Base Axis and lead web developer Bikram Ghosh.',
    ogTitle: 'Featured Projects | Tech Base Axis - Web Development Company Kolkata',
    ogDescription: 'Explore production software, web apps, and digital solutions delivered by Kolkata web development company Tech Base Axis and lead web developer Bikram Ghosh.',
    ogUrl: 'https://www.tbaonline.online',
  },

  /**
   * PACKAGES
   * Role: Commercial Offer & Transactional Pricing Node
   * Focus: Service tier pricing, package inclusions, hourly/milestone rates, and contract models.
   * Anti-Cannibalization Rule: Exclusively owns terms with commercial modifier "Packages", "Cost", and "Pricing".
   */
  packages: {
    primaryKeyword: 'Web Development Packages Kolkata',
    secondaryKeywords: [
      'Website Development Cost Kolkata',
      'Hire Bikram Ghosh Web Developer',
      'Tech Base Axis Pricing',
      'Custom Web Development Rates India',
      'Full Stack Development Retainer Kolkata',
    ],
    searchIntent: 'Transactional',
    semanticRole: 'Commercial Offer Node: Targets high-intent clients actively seeking budget, package scope, and hiring options.',
    title: 'Web Development Packages & Pricing | Tech Base Axis Kolkata',
    description: 'Transparent web development packages from Kolkata\'s leading tech firm Tech Base Axis. Hire Bikram Ghosh, senior web developer, for bespoke digital solutions.',
    ogTitle: 'Engineering Packages & Pricing | Tech Base Axis Kolkata',
    ogDescription: 'Transparent web development packages from Kolkata\'s leading tech firm Tech Base Axis. Hire Bikram Ghosh, senior web developer, for bespoke digital solutions.',
    ogUrl: 'https://www.tbaonline.online',
  },

  /**
   * CONTACT
   * Role: Conversion & Local Geographic Outreach Node
   * Focus: Direct lead generation, office booking, phone/email contact, and client consultation.
   * Anti-Cannibalization Rule: Exclusively targets direct action verbs ("Contact", "Consultation", "Book").
   */
  contact: {
    primaryKeyword: 'Contact Web Development Company Kolkata',
    secondaryKeywords: [
      'Hire Bikram Ghosh Web Developer',
      'Web Developer Kolkata Contact',
      'Tech Base Axis Consultation',
      'Software Engineering Inquiries Kolkata',
      'Tech Base Axis Office Kolkata',
    ],
    searchIntent: 'Transactional',
    semanticRole: 'Local Action Node: Anchors geographical NAP (Name, Address, Phone) citation relevance for local search queries.',
    title: 'Contact Tech Base Axis | Hire Bikram Ghosh Web Developer Kolkata',
    description: 'Get in touch with Tech Base Axis, a leading web development company in Kolkata. Consult with Bikram Ghosh to architect and build your next web application.',
    ogTitle: 'Contact Tech Base Axis | Web Development Company Kolkata',
    ogDescription: 'Get in touch with Tech Base Axis, a leading web development company in Kolkata. Consult with Bikram Ghosh to architect and build your next web application.',
    ogUrl: 'https://www.tbaonline.online',
  },

  /**
   * ADMIN
   * Role: Internal Operations Console (Excluded from Public Search Indexing)
   */
  admin: {
    primaryKeyword: 'Admin Console',
    secondaryKeywords: ['Tech Base Axis Portal', 'Administrative Control'],
    searchIntent: 'Administrative',
    semanticRole: 'Private System Node: Must be ignored by public search engines.',
    title: 'Admin Console | Tech Base Axis',
    description: 'Restricted administrative control center for Tech Base Axis web engineering platform.',
    ogTitle: 'Admin Console | Tech Base Axis',
    ogDescription: 'Restricted administrative control center for Tech Base Axis web engineering platform.',
    ogUrl: 'https://www.tbaonline.online',
  },

  /**
   * PRIVACY POLICY
   */
  privacy: {
    primaryKeyword: 'Tech Base Axis Privacy Policy',
    secondaryKeywords: ['Data Protection', 'Confidentiality Agreement Kolkata', 'Client Data Security'],
    searchIntent: 'Informational',
    semanticRole: 'Legal Transparency Node: Details data processing, encryption, and client rights.',
    title: 'Privacy Policy | Tech Base Axis & Bikram Ghosh',
    description: 'Learn how Tech Base Axis protects your technical data, project specs, and personal information with enterprise-grade encryption and zero data resale.',
    ogTitle: 'Privacy Policy | Tech Base Axis & Bikram Ghosh',
    ogDescription: 'Learn how Tech Base Axis protects your technical data, project specs, and personal information with enterprise-grade encryption and zero data resale.',
    ogUrl: 'https://www.tbaonline.online',
  },

  /**
   * TERMS & CONDITIONS (INCLUDES REFUND POLICY)
   */
  terms: {
    primaryKeyword: 'Tech Base Axis Terms & Conditions',
    secondaryKeywords: ['Strict No-Refund Policy', 'Software Development Agreement Kolkata', 'Payment Terms'],
    searchIntent: 'Informational',
    semanticRole: 'Legal & Policy Node: Details service terms, milestone billing, and our strict no-refund policy.',
    title: 'Terms & Conditions | Strict No-Refund Policy | Tech Base Axis',
    description: 'Review our terms of service, payment milestones, code ownership guarantees, and strict no-refund policy across all digital solutions and services.',
    ogTitle: 'Terms & Conditions & Strict No-Refund Policy | Tech Base Axis',
    ogDescription: 'Review our terms of service, payment milestones, code ownership guarantees, and strict no-refund policy across all digital solutions and services.',
    ogUrl: 'https://www.tbaonline.online',
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
