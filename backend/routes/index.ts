import express from 'express';
import authRoutes from './auth';
import crafterRoutes from './crafters';
import orderRoutes from './orders';
import customerOrderRoutes from './customerOrders';
import walletRoutes from './wallet';
import inventoryRoutes from './inventory';
import expenseRoutes from './expenses';
import auditRoutes from './audit';

const router = express.Router();

router.use('/', authRoutes);
router.use('/crafters', crafterRoutes);
router.use('/orders', orderRoutes);
router.use('/customer-orders', customerOrderRoutes);
router.use('/wallet', walletRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/expenses', expenseRoutes);
router.use('/audit', auditRoutes);

export default router;
