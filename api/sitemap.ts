import { generateSitemapXml } from '../server/sitemapService';

export default function handler(_req: any, res: any) {
  const xml = generateSitemapXml('https://www.tbaonline.online');
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
  res.status(200).send(xml);
}
