import fs from 'fs';
import path from 'path';
import { generateSitemapXml } from '../server/sitemapService';

const publicDir = path.join(process.cwd(), 'public');
const distDir = path.join(process.cwd(), 'dist');

const sitemapContent = generateSitemapXml('https://www.tbaonline.online');

// Write to public/
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}
const publicSitemapPath = path.join(publicDir, 'sitemap.xml');
fs.writeFileSync(publicSitemapPath, sitemapContent, 'utf-8');
console.log(`[sitemap-generator] Successfully generated: ${publicSitemapPath}`);

// If dist exists, write to dist as well
if (fs.existsSync(distDir)) {
  const distSitemapPath = path.join(distDir, 'sitemap.xml');
  fs.writeFileSync(distSitemapPath, sitemapContent, 'utf-8');
  console.log(`[sitemap-generator] Successfully synced to: ${distSitemapPath}`);
}
