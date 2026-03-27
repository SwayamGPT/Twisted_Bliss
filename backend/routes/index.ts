import express from 'express';
import authRoutes from './auth.js';
import crafterRoutes from './crafters.js';
import orderRoutes from './orders.js';
import customerOrderRoutes from './customerOrders.js';
import walletRoutes from './wallet.js';
import inventoryRoutes from './inventory.js';
import expenseRoutes from './expenses.js';
import auditRoutes from './audit.js';
import catalogueRoutes from './catalogue.js';

const router = express.Router();

router.use('/', authRoutes);
router.use('/crafters', crafterRoutes);
router.use('/orders', orderRoutes);
router.use('/customer-orders', customerOrderRoutes);
router.use('/wallet', walletRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/expenses', expenseRoutes);
router.use('/audit', auditRoutes);
router.use('/catalogue', catalogueRoutes);

export default router;
