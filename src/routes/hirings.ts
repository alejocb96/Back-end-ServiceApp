import { Router } from 'express';
import {
  getHirings,
  getHiring,
  createHiring,
  updateHiringStatus,
  addPayment,
  rateHiring,
  getMyHirings
} from '../controllers/hirings';
import { protect, admin } from '../middleware/auth';

const router = Router();

// All routes are protected
router.use(protect);

// User routes
router.get('/my', getMyHirings);
router.post('/', createHiring);
router.get('/:id', getHiring);
router.put('/:id/status', updateHiringStatus);
router.post('/:id/payment', addPayment);
router.post('/:id/rate', rateHiring);

// Admin routes
router.get('/', admin, getHirings);

export default router;
