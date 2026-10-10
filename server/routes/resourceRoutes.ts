import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  uploadResource,
  getResources,
  upvoteResource,
  downloadResource,
  viewResource,
} from '../controllers/resourceController.js';

const router = Router();

// Configure Multer storage to persist uploaded files inside /uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadPath = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (_req, file, cb) => {
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueName = `${Date.now()}-${cleanName}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max file size
});

/**
 * @route   POST /api/resources
 * @desc    Upload resource with either a physical file (multipart) or external link
 *
 * @route   GET /api/resources
 * @desc    Fetch resources with query filters: ?semester=3&category=PYQ
 */
router.route('/')
  .post(upload.single('file'), uploadResource)
  .get(getResources);

/**
 * @route   GET /api/resources/:id/download
 * @desc    Directly download the resource file or view as attachment
 */
router.get('/:id/download', downloadResource);

/**
 * @route   GET /api/resources/:id/view
 * @desc    Directly view/open the resource in browser
 */
router.get('/:id/view', viewResource);

/**
 * @route   PATCH /api/resources/:id/upvote
 * @route   POST /api/resources/:id/upvote
 * @desc    Atomically increment upvotes count on a resource
 */
router.patch('/:id/upvote', upvoteResource);
router.post('/:id/upvote', upvoteResource);

export default router;
