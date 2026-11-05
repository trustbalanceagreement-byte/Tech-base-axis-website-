import {
  getInquiriesList,
  saveInquiry,
  updateInquiry,
  deleteInquiry
} from '../server/inquiryHelper.ts';

export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json');

  try {
    if (req.method === 'GET') {
      const list = getInquiriesList();
      return res.status(200).json({ success: true, inquiries: list });
    }

    if (req.method === 'POST') {
      let inq = req.body;
      if (typeof inq === 'string') {
        try {
          inq = JSON.parse(inq);
        } catch (_) {}
      }

      if (!inq || (typeof inq !== 'object')) {
        return res.status(400).json({ error: 'Invalid inquiry payload' });
      }

      const result = saveInquiry(inq);
      return res.status(200).json({ success: true, id: result.id, inquiry: result.inquiry });
    }

    if (req.method === 'PUT') {
      let body = req.body;
      if (typeof body === 'string') {
        try {
          body = JSON.parse(body);
        } catch (_) {}
      }

      const id = body?.id || (req.query && req.query.id);
      if (!id) {
        return res.status(400).json({ error: 'Missing inquiry ID' });
      }

      const patch = body?.patch || body;
      const result = updateInquiry(id, patch);
      return res.status(200).json({ success: result.success });
    }

    if (req.method === 'DELETE') {
      const url = new URL(req.url || '', 'http://localhost');
      const id = url.searchParams.get('id') || req.query?.id || req.body?.id;
      if (!id) {
        return res.status(400).json({ error: 'Missing inquiry ID' });
      }

      const result = deleteInquiry(id);
      return res.status(200).json({ success: result.success });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('[API /api/inquiries] Error:', error);
    return res.status(500).json({ error: error?.message || 'Inquiry store error' });
  }
}
