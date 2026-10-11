import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { defineConfig, Plugin } from 'vite';
import dotenv from 'dotenv';
dotenv.config();

import { 
  sendAdminOneSignalNotification, 
  sendOneSignalPushNotification, 
  AdminNotificationEvent 
} from './server/onesignalService';
import {
  getActivityDashboard,
  recordActivityEvent,
  getProjectsList,
  saveProjectsList,
  handleUpload
} from './server/activityHelper';
import {
  handleCreateRazorpayOrder,
  handleVerifyRazorpaySignature
} from './server/razorpayHelper';
import { handleSupabaseUploadStream } from './server/supabaseHelper';

function onesignalDevApiPlugin(): Plugin {
  return {
    name: 'onesignal-dev-api',
    configureServer(server) {
      // User Activity & Real-time Presence Dashboard
      server.middlewares.use('/api/activity/event', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let body = '';
        req.on('data', (chunk) => { body += chunk; });
        req.on('end', () => {
          try {
            const payload = JSON.parse(body || '{}');
            const result = recordActivityEvent(payload);
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(JSON.stringify(result));
          } catch (err: any) {
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 400;
            res.end(JSON.stringify({ error: err?.message || 'Failed to record event' }));
          }
        });
      });

      server.middlewares.use('/api/activity', (req, res) => {
        if (req.method === 'GET' || req.method === 'HEAD') {
          try {
            const data = getActivityDashboard();
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(JSON.stringify(data));
          } catch (err: any) {
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err?.message || 'Server error' }));
          }
          return;
        }

        res.statusCode = 405;
        res.end(JSON.stringify({ error: 'Method not allowed' }));
      });

      // Public and Admin Projects Sync
      server.middlewares.use('/api/projects', (req, res) => {
        if (req.method === 'GET') {
          try {
            const list = getProjectsList();
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(JSON.stringify(list));
          } catch (err: any) {
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 500;
            res.end(JSON.stringify([]));
          }
          return;
        }

        if (req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => { body += chunk; });
          req.on('end', () => {
            try {
              const projects = JSON.parse(body || '[]');
              saveProjectsList(projects);
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, count: projects.length }));
            } catch (err: any) {
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 400;
              res.end(JSON.stringify({ error: err?.message || 'Invalid projects format' }));
            }
          });
          return;
        }

        res.statusCode = 405;
        res.end(JSON.stringify({ error: 'Method not allowed' }));
      });

      // Static media delivery for uploaded images and videos
      server.middlewares.use('/uploads', (req, res, next) => {
        const reqPath = req.url ? req.url.split('?')[0].replace(/^\//, '') : '';
        const filePath = path.join(process.cwd(), 'uploads', reqPath);
        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
          const ext = path.extname(filePath).toLowerCase();
          const mimeTypes: Record<string, string> = {
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.webp': 'image/webp',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml',
            '.mp4': 'video/mp4',
            '.webm': 'video/webm',
            '.ogg': 'video/ogg'
          };
          res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
          fs.createReadStream(filePath).pipe(res);
          return;
        }
        next();
      });

      // Direct raw binary media upload endpoint (ultra-fast stream, zero memory overhead)
      const handleRawStreamUpload = (req: any, res: any) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        const urlObj = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
        const rawFilename = urlObj.searchParams.get('filename') || (req.headers['x-filename'] as string) || `upload_${Date.now()}`;
        const rawFolder = urlObj.searchParams.get('folder') || (req.headers['x-folder'] as string) || 'media';
        const safeFilename = rawFilename.replace(/[^a-zA-Z0-9._-]/g, '_');
        const safeFolder = rawFolder.replace(/[^a-zA-Z0-9_-]/g, '');

        const uploadsBase = path.join(process.cwd(), 'uploads', safeFolder);
        if (!fs.existsSync(uploadsBase)) {
          fs.mkdirSync(uploadsBase, { recursive: true });
        }
        const targetPath = path.join(uploadsBase, safeFilename);
        const writeStream = fs.createWriteStream(targetPath);

        req.pipe(writeStream);

        writeStream.on('finish', () => {
          const publicUrl = `/uploads/${safeFolder}/${safeFilename}`;
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 200;
          res.end(JSON.stringify({ success: true, url: publicUrl, filename: safeFilename }));
        });

        writeStream.on('error', (err: any) => {
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 500;
          res.end(JSON.stringify({ error: err?.message || 'Failed to write raw stream' }));
        });
      };

      // Supabase Storage upload endpoint (guaranteed bucket persistence + public CDN URL)
      server.middlewares.use('/api/supabase/upload', handleSupabaseUploadStream);

      server.middlewares.use('/api/upload-raw', handleRawStreamUpload);
      server.middlewares.use('/api/upload/raw', handleRawStreamUpload);

      // Direct media upload endpoint (instant, reliable, no external bucket blocking)
      server.middlewares.use('/api/upload', (req, res, next) => {
        // If request is intended for raw upload or other sub-routes, bypass to next
        if (req.url && (req.url === '/raw' || req.url.startsWith('/raw?') || (req.url !== '/' && !req.url.startsWith('/?')))) {
          if (typeof next === 'function') return next();
        }

        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let body = '';
        req.on('data', (chunk) => { body += chunk; });
        req.on('end', () => {
          try {
            const payload = JSON.parse(body || '{}');
            const result = handleUpload(payload);
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(JSON.stringify(result));
          } catch (err: any) {
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 400;
            res.end(JSON.stringify({ error: err?.message || 'Failed to process media upload' }));
          }
        });
      });
      // Diagnostic status
      server.middlewares.use('/api/notification-status', (_req, res) => {
        const hasKey = Boolean(process.env.ONESIGNAL_REST_API_KEY || process.env.ONESIGNAL_API_KEY);
        const appId = process.env.ONESIGNAL_APP_ID ? `${process.env.ONESIGNAL_APP_ID.slice(0, 8)}...` : 'default';
        const targetId = process.env.ONESIGNAL_ADMIN_PLAYER_ID || '99a86c9f-366e-4625-9506-5af191a0297d';

        res.setHeader('Content-Type', 'application/json');
        res.statusCode = 200;
        res.end(JSON.stringify({
          onesignalReady: hasKey,
          appIdPreview: appId,
          targetAdminPlayerId: targetId,
          timestamp: new Date().toISOString()
        }));
      });

      // Legacy booking endpoint
      server.middlewares.use('/api/notify-booking', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let body = '';
        req.on('data', (chunk) => { body += chunk; });
        req.on('end', async () => {
          try {
            const payload = JSON.parse(body || '{}');
            const result = await sendOneSignalPushNotification(payload);
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = result.success ? 200 : 502;
            res.end(JSON.stringify(result));
          } catch (err: any) {
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err?.message || 'Server error' }));
          }
        });
      });

      // Central notify-admin endpoint for all 8 events
      server.middlewares.use('/api/notify-admin', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let body = '';
        req.on('data', (chunk) => { body += chunk; });
        req.on('end', async () => {
          try {
            const eventData: AdminNotificationEvent = JSON.parse(body || '{}');
            const result = await sendAdminOneSignalNotification(eventData);
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = result.success ? 200 : 502;
            res.end(JSON.stringify(result));
          } catch (err: any) {
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err?.message || 'Server error' }));
          }
        });
      });

      // STEP 1: Backend Create Order (Razorpay Standard Checkout)
      server.middlewares.use('/api/create-order', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let body = '';
        req.on('data', (chunk) => { body += chunk; });
        req.on('end', async () => {
          try {
            const params = JSON.parse(body || '{}');
            const result = await handleCreateRazorpayOrder(params);
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = result.statusCode;
            if (result.success && result.data) {
              res.end(JSON.stringify(result.data));
            } else {
              res.end(JSON.stringify({ error: result.error || 'Failed to create order' }));
            }
          } catch (err: any) {
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err?.message || 'Internal server error while creating order' }));
          }
        });
      });

      // STEP 3: Backend Verify Payment Signature (Razorpay & Webhooks)
      server.middlewares.use('/api/verify-payment', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let body = '';
        req.on('data', (chunk) => { body += chunk; });
        req.on('end', async () => {
          try {
            const payload = JSON.parse(body || '{}');
            const { 
              razorpay_order_id, 
              razorpay_payment_id, 
              razorpay_signature,
              paymentId, 
              orderId, 
              amount, 
              clientName, 
              email, 
              phone,
              packageName,
              projectId, 
              status 
            } = payload;

            const isRazorpayVerification = Boolean(
              razorpay_signature || 
              (razorpay_order_id && razorpay_payment_id)
            );

            if (isRazorpayVerification) {
              // 1. Verify Razorpay HMAC-SHA256 signature
              const verifyResult = handleVerifyRazorpaySignature(payload);
              if (!verifyResult.verified) {
                res.statusCode = verifyResult.statusCode;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ 
                  success: false, 
                  verified: false, 
                  error: verifyResult.error || 'Invalid signature' 
                }));
                return;
              }

              // 2. Verified successfully - Trigger admin notification
              const resolvedPaymentId = razorpay_payment_id || paymentId;
              const resolvedOrderId = razorpay_order_id || orderId;

              const notificationResult = await sendAdminOneSignalNotification({
                eventType: 'payment_success',
                clientName: clientName || 'Valued Client',
                email: email || '',
                phone: phone || '',
                amount: amount || 0,
                paymentId: resolvedPaymentId,
                orderId: resolvedOrderId,
                packageName: packageName || 'Service Package',
                projectId: projectId || packageName || 'Razorpay Gateway',
                timestamp: new Date().toISOString()
              });

              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              res.end(JSON.stringify({
                success: true,
                verified: true,
                order_id: resolvedOrderId,
                payment_id: resolvedPaymentId,
                amount: amount,
                message: 'Payment verified successfully',
                notification: notificationResult
              }));
              return;
            }

            // Legacy direct UPI verification fallback
            if (!paymentId || !amount) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Invalid payment payload' }));
              return;
            }

            if (status !== 'success' && status !== 'captured' && status !== 'paid' && status !== undefined) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: `Payment not verified. Status: ${status}` }));
              return;
            }

            const result = await sendAdminOneSignalNotification({
              eventType: 'payment_success',
              clientName: clientName || 'Valued Client',
              email: email || '',
              amount: amount,
              paymentId: paymentId,
              orderId: orderId || `ord_${Date.now()}`,
              projectId: projectId || 'NexusPay / Architecture',
              timestamp: new Date().toISOString()
            });

            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(JSON.stringify({
              verified: true,
              paymentId,
              amount,
              notification: result
            }));
          } catch (err: any) {
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err?.message || 'Server error during payment verification' }));
          }
        });
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), onesignalDevApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
