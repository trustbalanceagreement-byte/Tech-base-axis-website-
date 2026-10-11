export interface SitemapUrlEntry {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

/**
 * Dynamically generates a valid sitemaps.org XML string for search engine crawlers (Google, Bing, etc.)
 * Includes all essential pages: Home, Projects, Packages, Contact, Admin, and deep links.
 */
export function generateSitemapXml(baseUrl = 'https://www.tbaonline.online'): string {
  const currentDate = new Date().toISOString().split('T')[0];

  const corePages: SitemapUrlEntry[] = [
    { loc: `${baseUrl}/`, priority: 1.0, changefreq: 'daily', lastmod: currentDate },
    { loc: `${baseUrl}/projects`, priority: 0.9, changefreq: 'weekly', lastmod: currentDate },
    { loc: `${baseUrl}/packages`, priority: 0.9, changefreq: 'weekly', lastmod: currentDate },
    { loc: `${baseUrl}/contact`, priority: 0.8, changefreq: 'monthly', lastmod: currentDate },
    { loc: `${baseUrl}/admin`, priority: 0.3, changefreq: 'monthly', lastmod: currentDate },
  ];

  const sectionLinks: SitemapUrlEntry[] = [
    { loc: `${baseUrl}/?section=projects`, priority: 0.8, changefreq: 'weekly', lastmod: currentDate },
    { loc: `${baseUrl}/?section=packages`, priority: 0.8, changefreq: 'weekly', lastmod: currentDate },
    { loc: `${baseUrl}/?section=contact`, priority: 0.8, changefreq: 'monthly', lastmod: currentDate },
    { loc: `${baseUrl}/?section=admin`, priority: 0.3, changefreq: 'monthly', lastmod: currentDate },
  ];

  const projectCases: SitemapUrlEntry[] = [
    { loc: `${baseUrl}/?project=omniflow-os`, priority: 0.7, changefreq: 'monthly', lastmod: currentDate },
    { loc: `${baseUrl}/?project=aether-neural-copilot`, priority: 0.7, changefreq: 'monthly', lastmod: currentDate },
    { loc: `${baseUrl}/?project=nexus-pay-global`, priority: 0.7, changefreq: 'monthly', lastmod: currentDate },
    { loc: `${baseUrl}/?project=hyper-scale-telemetry`, priority: 0.7, changefreq: 'monthly', lastmod: currentDate },
    { loc: `${baseUrl}/?project=quantum-cipher-vault`, priority: 0.7, changefreq: 'monthly', lastmod: currentDate },
    { loc: `${baseUrl}/?project=synapse-flow-bi`, priority: 0.7, changefreq: 'monthly', lastmod: currentDate },
  ];

  const allEntries = [...corePages, ...sectionLinks, ...projectCases];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${allEntries
  .map(
    (e) => `  <url>
    <loc>${e.loc}</loc>
    <lastmod>${e.lastmod || currentDate}</lastmod>
    <changefreq>${e.changefreq || 'weekly'}</changefreq>
    <priority>${e.priority !== undefined ? e.priority.toFixed(1) : '0.5'}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;
}
