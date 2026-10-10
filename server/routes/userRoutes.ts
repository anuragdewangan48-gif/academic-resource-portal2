import { Router } from 'express';
import { createUser, getUsers } from '../controllers/userController.js';

const router = Router();

/**
 * @route   GET /api/users - Fetch all users
 * @route   POST /api/users - Register new user (student or admin)
 */
router.route('/')
  .get(getUsers)
  .post(createUser);

export default router;
