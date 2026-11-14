import { getNotificationDiagnosticInfo } from '../server/onesignalService.js';

export default function handler(_req: any, res: any) {
  const diag = getNotificationDiagnosticInfo();
  res.status(200).json({
    ...diag,
    host: 'vercel'
  });
}
