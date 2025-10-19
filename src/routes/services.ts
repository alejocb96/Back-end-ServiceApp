import { Router } from 'express';
import {
  getServices,
  getService,
  createService,
  updateService,
  deleteService,
  searchServices,
  calculateServicePrice,
  getServicesByProvider
} from '../controllers/services';
import { protect, providerOrAdmin, userOrAdmin } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', getServices);
router.get('/search', searchServices);
router.get('/provider/:providerId', getServicesByProvider);
router.get('/:id', getService);
router.post('/:id/calculate-price', calculateServicePrice);

// Protected routes
router.post('/', protect, providerOrAdmin, createService);
router.put('/:id', protect, userOrAdmin, updateService);
router.delete('/:id', protect, userOrAdmin, deleteService);

export default router;
