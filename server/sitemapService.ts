export interface SitemapUrlEntry {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
  images?: { loc: string; title?: string; caption?: string }[];
}

/**
 * Dynamically generates a valid sitemaps.org XML string for search engine crawlers (Google, Bing, etc.)
 * Includes all essential pages: Home, Projects, Packages, Contact, Admin, and deep links.
 */
export function generateSitemapXml(baseUrl = 'https://www.tbaonline.online'): string {
  const currentDate = new Date().toISOString().split('T')[0];

  const allEntries: SitemapUrlEntry[] = [
    {
      loc: `${baseUrl}/`,
      priority: 1.0,
      changefreq: 'weekly',
      lastmod: currentDate,
      images: [
        {
          loc: `${baseUrl}/bikram-ghosh.jpg`,
          title: 'Bikram Ghosh - Founder and Full Stack Web Developer at Tech Base Axis Kolkata',
          caption: 'Bikram Ghosh Web Developer in Kolkata, Founder of Tech Base Axis'
        },
        {
          loc: `${baseUrl}/tab_logo.png`,
          title: 'Tech Base Axis Official Brand Logo - Web Development Company Kolkata',
          caption: 'Official brand logo of Tech Base Axis, leading web development agency in Kolkata'
        },
        {
          loc: `${baseUrl}/og-image.jpg`,
          title: 'Tech Base Axis - Web Development Company in Kolkata by Bikram Ghosh',
          caption: 'High performance web applications, cloud platforms and AI systems by Bikram Ghosh'
        },
        {
          loc: `${baseUrl}/images/bikram-ghosh-lead-architect-kolkata.webp`,
          title: 'Bikram Ghosh - Lead Software Architect Kolkata',
          caption: 'Bikram Ghosh, Principal Systems Architect and Founder at Tech Base Axis'
        },
        {
          loc: `${baseUrl}/images/tech-base-axis-engineering-hq-kolkata.webp`,
          title: 'Tech Base Axis Engineering HQ Kolkata',
          caption: 'Tech Base Axis web development and software engineering headquarters in Kolkata'
        },
        {
          loc: `${baseUrl}/images/full-stack-web-development-kolkata.webp`,
          title: 'Full Stack Web Development Services Kolkata - Tech Base Axis',
          caption: 'Custom full-stack web application development services in Kolkata'
        },
        {
          loc: `${baseUrl}/images/custom-app-development-architecture.webp`,
          title: 'Custom Web Application Development & Cloud Architecture - Tech Base Axis',
          caption: 'Modern software architecture, React, Node.js and cloud systems'
        },
        {
          loc: `${baseUrl}/images/enterprise-software-development-systems.webp`,
          title: 'Enterprise Software Development Systems Kolkata - Tech Base Axis',
          caption: 'Enterprise grade web platforms, microservices and secure backends'
        },
        {
          loc: `${baseUrl}/images/ai-intelligence-neural-systems.webp`,
          title: 'AI & Neural Reasoning Systems - Tech Base Axis',
          caption: 'AI powered web platforms, Gemini LLM integrations and automated workflows'
        },
        {
          loc: `${baseUrl}/images/workflow-automation-systems.webp`,
          title: 'Workflow Automation Systems - Tech Base Axis',
          caption: 'Cloud pipeline automation and enterprise digital transformation'
        }
      ],
    },
    {
      loc: `${baseUrl}/projects`,
      priority: 0.9,
      changefreq: 'weekly',
      lastmod: currentDate,
      images: [
        {
          loc: `${baseUrl}/images/full-stack-web-development-kolkata.webp`,
          title: 'Tech Base Axis Client Projects & Architecture Deployments',
          caption: 'Case studies and software engineering portfolio of Tech Base Axis'
        },
        {
          loc: `${baseUrl}/images/enterprise-software-development-systems.webp`,
          title: 'OmniFlow Cloud OS & Enterprise Distributed Systems',
          caption: 'Production grade cloud applications architected by Bikram Ghosh'
        },
        {
          loc: `${baseUrl}/images/ai-intelligence-neural-systems.webp`,
          title: 'Aether AI Neural Copilot Architecture',
          caption: 'Generative AI platforms built by Tech Base Axis'
        }
      ]
    },
    {
      loc: `${baseUrl}/packages`,
      priority: 0.9,
      changefreq: 'weekly',
      lastmod: currentDate,
      images: [
        {
          loc: `${baseUrl}/images/custom-app-development-architecture.webp`,
          title: 'Web Development Pricing & Maintenance Packages - Tech Base Axis',
          caption: 'Transparent engineering tiers, subscription plans and ongoing maintenance packages'
        }
      ]
    },
    {
      loc: `${baseUrl}/contact`,
      priority: 0.8,
      changefreq: 'monthly',
      lastmod: currentDate,
      images: [
        {
          loc: `${baseUrl}/bikram-ghosh.jpg`,
          title: 'Connect Directly with Bikram Ghosh - Founder of Tech Base Axis',
          caption: 'Book consultations or project briefs directly with Bikram Ghosh in Kolkata'
        },
        {
          loc: `${baseUrl}/tab_logo.png`,
          title: 'Tech Base Axis Office & Contact Channel',
          caption: 'Direct engineering channel for Tech Base Axis Kolkata'
        }
      ]
    },
    { loc: `${baseUrl}/privacy`, priority: 0.3, changefreq: 'yearly', lastmod: currentDate },
    { loc: `${baseUrl}/terms`, priority: 0.3, changefreq: 'yearly', lastmod: currentDate },
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${allEntries
  .map(
    (e) => `  <url>
    <loc>${e.loc}</loc>
    <lastmod>${e.lastmod || currentDate}</lastmod>
    <changefreq>${e.changefreq || 'weekly'}</changefreq>
    <priority>${e.priority !== undefined ? e.priority.toFixed(1) : '0.5'}</priority>${(e.images || [])
      .map((im) => `\n    <image:image>\n      <image:loc>${im.loc}</image:loc>${im.title ? `\n      <image:title>${im.title}</image:title>` : ''}${im.caption ? `\n      <image:caption>${im.caption}</image:caption>` : ''}\n    </image:image>`)
      .join('')}
  </url>`
  )
  .join('\n')}
</urlset>`;
}
