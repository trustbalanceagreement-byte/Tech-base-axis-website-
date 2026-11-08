export interface SitemapUrlEntry {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
  images?: { loc: string }[];
}

/**
 * Dynamically generates a 100% standards-compliant XML sitemap strictly following
 * the official sitemaps.org 0.9 schema and Google Search Central Image Sitemap protocol.
 * Rejection-free XML formatting with clean namespace declarations and proper element ordering.
 */
export function generateSitemapXml(baseUrl = 'https://tbaonline.online'): string {
  const currentDate = new Date().toISOString().split('T')[0];

  const allEntries: SitemapUrlEntry[] = [
    {
      loc: `${baseUrl}/`,
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: 1.0,
      images: [
        { loc: `${baseUrl}/bikram-ghosh.jpg` }
      ],
    },
    { loc: `${baseUrl}/projects`, lastmod: currentDate, changefreq: 'weekly', priority: 0.9 },
    { loc: `${baseUrl}/packages`, lastmod: currentDate, changefreq: 'weekly', priority: 0.9 },
    { loc: `${baseUrl}/contact`, lastmod: currentDate, changefreq: 'monthly', priority: 0.8 },
    { loc: `${baseUrl}/privacy`, lastmod: currentDate, changefreq: 'yearly', priority: 0.3 },
    { loc: `${baseUrl}/terms`, lastmod: currentDate, changefreq: 'yearly', priority: 0.3 },
  ];

  const urlNodes = allEntries.map((e) => {
    const lines = [
      '  <url>',
      `    <loc>${e.loc}</loc>`,
      `    <lastmod>${e.lastmod || currentDate}</lastmod>`,
      `    <changefreq>${e.changefreq || 'weekly'}</changefreq>`,
      `    <priority>${e.priority !== undefined ? e.priority.toFixed(1) : '0.5'}</priority>`
    ];

    if (e.images && e.images.length > 0) {
      for (const img of e.images) {
        lines.push('    <image:image>');
        lines.push(`      <image:loc>${img.loc}</image:loc>`);
        lines.push('    </image:image>');
      }
    }

    lines.push('  </url>');
    return lines.join('\n');
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urlNodes}\n</urlset>\n`;
}
