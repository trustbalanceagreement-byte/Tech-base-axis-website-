// Vercel serverless function: GET /api/notification-status (never prints secrets)
export default function handler(_req: any, res: any) {
  const hasKey = Boolean(process.env.ONESIGNAL_REST_API_KEY || process.env.ONESIGNAL_API_KEY);
  const appId = process.env.ONESIGNAL_APP_ID ? `${process.env.ONESIGNAL_APP_ID.slice(0, 8)}...` : 'default';
  res.status(200).json({
    onesignalReady: hasKey,
    appIdPreview: appId,
    host: 'vercel',
    timestamp: new Date().toISOString()
  });
}
