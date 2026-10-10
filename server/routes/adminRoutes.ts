import { Router } from 'express';
import { requireAdmin } from '../middleware/adminAuth.js';
import {
  getAdminStats,
  getAdminResources,
  deleteAdminResource,
  resetDefaultSeeds,
  verifyAdminKey,
} from '../controllers/adminController.js';

const router = Router();

// Require valid admin key for all administrative operations
router.use(requireAdmin);

/**
 * @route   POST /api/admin/verify
 * @desc    Verify if provided Admin Secret Key is valid
 */
router.post('/verify', verifyAdminKey);
router.get('/verify', verifyAdminKey);

/**
 * @route   GET /api/admin/stats
 * @desc    Fetch portal metrics (PYQ counts, upvotes, category distribution)
 */
router.get('/stats', getAdminStats);

/**
 * @route   GET /api/admin/resources
 * @desc    Fetch all resources for administrative management
 */
router.get('/resources', getAdminResources);

/**
 * @route   DELETE /api/admin/resources/:id
 * @desc    Delete obsolete, spam, or duplicate resource by ID
 */
router.delete('/resources/:id', deleteAdminResource);

/**
 * @route   POST /api/admin/reset-seeds
 * @desc    Reset or restore repository demonstration seeds
 */
router.post('/reset-seeds', resetDefaultSeeds);

export default router;
