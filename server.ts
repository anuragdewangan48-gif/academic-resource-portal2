import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { connectDB, isDBConnected } from './server/config/db.js';
import resourceRoutes from './server/routes/resourceRoutes.js';
import userRoutes from './server/routes/userRoutes.js';
import aiRoutes from './server/routes/aiRoutes.js';
import adminRoutes from './server/routes/adminRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer(): Promise<void> {
  const app = express();
  const PORT = 3000;

  // 1. Initialize MongoDB connection via Mongoose
  await connectDB();

  // 2. Ensure uploads directory exists
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // 3. Core Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // 4. Serve uploaded files statically
  app.use('/uploads', express.static(uploadsDir));

  // 5. Health check & System Status endpoints
  app.get('/api/health', (_req: Request, res: Response) => {
    res.status(200).json({
      status: 'healthy',
      database: isDBConnected() ? 'connected (MongoDB)' : 'in-memory-preview-fallback',
      timestamp: new Date().toISOString(),
    });
  });

  app.get('/api/status', (_req: Request, res: Response) => {
    res.status(200).json({
      service: 'Academic Resource & PYQ Portal API',
      version: '1.0.0',
      database: {
        connected: isDBConnected(),
        type: isDBConnected() ? 'MongoDB via Mongoose' : 'In-Memory Fallback Cache',
        uriConfigured: Boolean(process.env.MONGODB_URI),
      },
      endpoints: [
        { method: 'POST', path: '/api/resources', description: 'Upload resource metadata link' },
        { method: 'GET', path: '/api/resources?semester=&subjectCode=&category=&sort=', description: 'Filter academic resources and PYQs' },
        { method: 'PATCH', path: '/api/resources/:id/upvote', description: 'Atomically upvote resource' },
        { method: 'GET', path: '/api/users', description: 'List student and admin users' },
        { method: 'POST', path: '/api/users', description: 'Register a student or admin user' },
        { method: 'GET', path: '/api/admin/stats', description: 'Administrative metrics and summary statistics' },
        { method: 'GET', path: '/api/admin/resources', description: 'List all resources for administrative management' },
        { method: 'DELETE', path: '/api/admin/resources/:id', description: 'Securely delete or moderate resource' },
      ],
    });
  });

  // 4. Mount API Routes
  app.use('/api/resources', resourceRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/ai', aiRoutes);
  app.use('/api/admin', adminRoutes);

  // 5. Global Express Error Handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('[Server Error]', err);
    res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Internal Server Error',
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
  });

  // 6. Vite middleware for frontend SPA in development, static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // 7. Bind server exclusively to 0.0.0.0 and port 3000
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Academic Resource & PYQ Portal Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
