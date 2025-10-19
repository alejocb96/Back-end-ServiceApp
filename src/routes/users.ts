import { Router } from 'express';
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser
} from '../controllers/users';
import { protect, admin } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(protect);

// Admin only routes
router.use(admin);

router
  .route('/')
  .get(getUsers)
  .post(createUser);

router
  .route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

export default router;
