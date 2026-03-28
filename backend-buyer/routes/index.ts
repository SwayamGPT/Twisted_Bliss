import express from 'express';
import authRoutes from './auth.js';
import catalogRoutes from './catalog.js';
import orderRoutes from './order.js';
import paymentRoutes from './payment.js';
import adminRoutes from './admin.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/', catalogRoutes); // collections at /api/buyer/collections
router.use('/orders', orderRoutes);
router.use('/payments', paymentRoutes);
router.use('/admin', adminRoutes);

export default router;
