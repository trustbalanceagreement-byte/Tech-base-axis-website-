export interface SitemapUrlEntry {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
  images?: { loc: string }[];
}

/**
 * Dynamically generates a valid sitemaps.org XML string for search engine crawlers (Google, Bing, etc.)
 * Strictly follows Google Search Console XML sitemap protocol and Google Image Sitemap guidelines.
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
          loc: `${baseUrl}/bikram-ghosh.jpg`
        }
      ],
    },
    { loc: `${baseUrl}/projects`, priority: 0.9, changefreq: 'weekly', lastmod: currentDate },
    { loc: `${baseUrl}/packages`, priority: 0.9, changefreq: 'weekly', lastmod: currentDate },
    { loc: `${baseUrl}/contact`, priority: 0.8, changefreq: 'monthly', lastmod: currentDate },
    { loc: `${baseUrl}/privacy`, priority: 0.3, changefreq: 'yearly', lastmod: currentDate },
    { loc: `${baseUrl}/terms`, priority: 0.3, changefreq: 'yearly', lastmod: currentDate },
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${allEntries
  .map(
    (e) => `  <url>
    <loc>${e.loc}</loc>
    <lastmod>${e.lastmod || currentDate}</lastmod>
    <changefreq>${e.changefreq || 'weekly'}</changefreq>
    <priority>${e.priority !== undefined ? e.priority.toFixed(1) : '0.5'}</priority>${(e.images || [])
      .map((im) => `\n    <image:image>\n      <image:loc>${im.loc}</image:loc>\n    </image:image>`)
      .join('')}
  </url>`
  )
  .join('\n')}
</urlset>`;
}
