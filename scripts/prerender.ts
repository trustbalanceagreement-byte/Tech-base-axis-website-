import fs from 'fs';
import path from 'path';
import { SECTION_SEO_MAP, SECTION_PATHS } from '../src/hooks/useSectionSEO';

const dist = path.join(process.cwd(), 'dist');
const base = 'https://www.tbaonline.online';
const tpl = fs.readFileSync(path.join(dist, 'index.html'), 'utf-8');

const esc = (v: string) => v.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const setMeta = (html: string, attr: 'name' | 'property', key: string, value: string) =>
  html.replace(new RegExp(`(<meta ${attr}="${key}" content=")[^"]*(")`), `$1${esc(value)}$2`);

const ld = (o: unknown) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`;

const pages: Array<'home' | 'projects' | 'packages' | 'contact' | 'privacy' | 'terms'> = [
  'home', 'projects', 'packages', 'contact', 'privacy', 'terms',
];

for (const key of pages) {
  const cfg = SECTION_SEO_MAP[key];
  const route = SECTION_PATHS[key];
  const url = key === 'home' ? base : `${base}${route}`;
  let html = tpl;
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${esc(cfg.title)}</title>`);
  html = setMeta(html, 'name', 'description', cfg.description);
  html = setMeta(html, 'name', 'keywords', [cfg.primaryKeyword, ...cfg.secondaryKeywords].join(', '));
  html = setMeta(html, 'property', 'og:title', cfg.ogTitle);
  html = setMeta(html, 'property', 'og:description', cfg.ogDescription);
  html = setMeta(html, 'property', 'og:url', url);
  html = setMeta(html, 'name', 'twitter:title', cfg.ogTitle);
  html = setMeta(html, 'name', 'twitter:description', cfg.ogDescription);
  html = html.replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`);

  const extra: string[] = [];
  if (key !== 'home') {
    extra.push(
      ld({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${base}/` },
          { '@type': 'ListItem', position: 2, name: cfg.ogTitle.split('|')[0].trim(), item: url },
        ],
      })
    );
  }
  html = html.replace('</head>', `    ${extra.join('\n    ')}\n  </head>`);

  const body =
    key === 'home'
      ? null
      : `<!--seo-fallback-start-->
      <main style="position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0">
        <h1>${esc(cfg.ogTitle)}</h1>
        <p>${esc(cfg.description)}</p>
        <nav aria-label="Main"><a href="/">Home</a> · <a href="/projects">Projects</a> · <a href="/packages">Packages</a> · <a href="/contact">Contact</a></nav>
      </main>
    <!--seo-fallback-end-->`;
  if (body) html = html.replace(/<!--seo-fallback-start-->[\s\S]*<!--seo-fallback-end-->/, body);

  const out = key === 'home' ? path.join(dist, 'index.html') : path.join(dist, route.slice(1), 'index.html');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, html, 'utf-8');
  console.log(`[prerender] ${route} -> ${path.relative(process.cwd(), out)}`);
}

// Real 404 for unknown URLs (noindex), so crawlers don't index soft-404 duplicates of the home page.
{
  let html = tpl;
  html = html.replace(/<title>[^<]*<\/title>/, '<title>Page not found | Tech Base Axis</title>');
  html = html.replace(/<meta name="robots" content="[^"]*" \/>/, '<meta name="robots" content="noindex, follow" />');
  html = html.replace(/<link rel="canonical" href="[^"]*"\s*\/?>/, '');
  html = html.replace(/<!--seo-fallback-start-->[\s\S]*<!--seo-fallback-end-->/, '<main style="padding:3rem 1rem;font-family:system-ui,sans-serif;color:#e5e5e5;text-align:center"><h1>Page not found</h1><p><a href="/" style="color:#ff3b30">Go to the Tech Base Axis home page</a></p></main>');
  fs.writeFileSync(path.join(dist, '404.html'), html, 'utf-8');
  console.log('[prerender] 404.html');
}
