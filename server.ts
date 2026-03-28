import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { requireAuth } from './backend/middleware/index.js';
import apiRoutes from './backend/routes/index.js';
import buyerApiRoutes from './backend-buyer/routes/index.js';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

import { Catalogue } from './backend/models/index.js';
import { connectDB } from './backend/config/db.js';
import { BuyerUser } from './backend-buyer/models/index.js';
import { hashPassword } from './backend-buyer/middleware/auth.js';

// Health Check (Public)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Public Catalogue Items
app.get('/api/public/catalogue', async (req, res) => {
  try {
    await connectDB();
    const items = await Catalogue.find({});
    res.json(items);
  } catch (err) {
    console.error('Failed to fetch public catalogue', err);
    res.status(500).json({ error: 'Failed to fetch catalogue' });
  }
});

// API Routes
app.use('/api', requireAuth as express.RequestHandler, apiRoutes);
app.use('/api/buyer', buyerApiRoutes);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global Error Handler caught:', err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    error: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

async function startServer() {
  try {
    console.log('Initializing database connection...');
    await connectDB();

    // Create default buyer admin if configured
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
    
    if (ADMIN_EMAIL && ADMIN_PASSWORD) {
      const existingAdmin = await BuyerUser.findOne({ email: ADMIN_EMAIL.toLowerCase().trim() });
      if (!existingAdmin) {
        console.log('Creating default buyer admin...');
        await BuyerUser.create({
          name: 'System Admin',
          email: ADMIN_EMAIL.toLowerCase().trim(),
          password: hashPassword(ADMIN_PASSWORD),
          role: 'admin'
        });
        console.log('Default buyer admin created.');
      }
    } else {
      console.warn('ADMIN_EMAIL or ADMIN_PASSWORD not configured. Skipping default admin creation.');
    }
  } catch (err) {
    console.error('Initial DB connection failed or admin creation failed:', err);
  }

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('dist'));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Only start the server if not running in Vercel
if (process.env.NODE_ENV !== 'production' || process.env.VERCEL !== '1') {
  startServer();
}

export default app;
