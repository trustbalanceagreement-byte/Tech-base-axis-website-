// Vercel serverless function: GET /api/health
export default function handler(_req: any, res: any) {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    onesignalConfigured: Boolean(process.env.ONESIGNAL_REST_API_KEY || process.env.ONESIGNAL_API_KEY)
  });
}
