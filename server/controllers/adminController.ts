import { Request, Response } from 'express';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import { Resource } from '../models/Resource.js';
import { User } from '../models/User.js';
import { isDBConnected } from '../config/db.js';
import {
  getInMemoryResourcesList,
  deleteInMemoryResourceById,
  resetInMemoryResourcesList,
} from './resourceController.js';
import { ensureSeedDocumentsExist } from '../utils/documentGenerator.js';

/**
 * @desc    Fetch Administrative Dashboard Metrics and Portal Overview
 * @route   GET /api/admin/stats
 * @access  Private (Admin Secret Key Required)
 */
export async function getAdminStats(req: Request, res: Response): Promise<void> {
  try {
    let totalResources = 0;
    let totalPYQs = 0;
    let totalLectureNotes = 0;
    let totalLabManuals = 0;
    let totalSyllabus = 0;
    let totalUpvotes = 0;
    let totalUsers = 0;
    const semesterDistribution: Record<number, number> = {
      1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0,
    };
    const branchDistribution: Record<string, number> = {
      CSE: 0, DSAI: 0, ECE: 0, General: 0,
    };

    if (isDBConnected()) {
      const [resCount, usersCount, allResources] = await Promise.all([
        Resource.countDocuments(),
        User.countDocuments(),
        Resource.find().select('category upvotes semester branch').lean(),
      ]);

      totalResources = resCount;
      totalUsers = usersCount;

      for (const r of allResources) {
        if (r.category === 'PYQ') totalPYQs++;
        else if (r.category === 'Lecture Notes') totalLectureNotes++;
        else if (r.category === 'Lab Manual') totalLabManuals++;
        else if (r.category === 'Syllabus') totalSyllabus++;

        totalUpvotes += r.upvotes || 0;
        if (r.semester && r.semester >= 1 && r.semester <= 8) {
          semesterDistribution[r.semester] = (semesterDistribution[r.semester] || 0) + 1;
        }
        if (r.branch) {
          branchDistribution[r.branch] = (branchDistribution[r.branch] || 0) + 1;
        }
      }
    } else {
      // In-Memory Fallback Stats
      const list = getInMemoryResourcesList();
      totalResources = list.length;
      totalUsers = 4; // Mock registered users

      for (const r of list) {
        if (r.category === 'PYQ') totalPYQs++;
        else if (r.category === 'Lecture Notes') totalLectureNotes++;
        else if (r.category === 'Lab Manual') totalLabManuals++;
        else if (r.category === 'Syllabus') totalSyllabus++;

        totalUpvotes += r.upvotes || 0;
        if (r.semester && r.semester >= 1 && r.semester <= 8) {
          semesterDistribution[r.semester] = (semesterDistribution[r.semester] || 0) + 1;
        }
        if (r.branch) {
          branchDistribution[r.branch] = (branchDistribution[r.branch] || 0) + 1;
        }
      }
    }

    res.status(200).json({
      success: true,
      data: {
        totalResources,
        totalPYQs,
        totalLectureNotes,
        totalLabManuals,
        totalSyllabus,
        totalUpvotes,
        totalUsers,
        semesterDistribution,
        branchDistribution,
        storageEngine: isDBConnected() ? 'MongoDB Cluster' : 'In-Memory Cache (Preview)',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to aggregate admin metrics',
      error: error.message,
    });
  }
}

/**
 * @desc    Fetch All Resources for Admin Management Table
 * @route   GET /api/admin/resources
 * @access  Private (Admin Secret Key Required)
 */
export async function getAdminResources(req: Request, res: Response): Promise<void> {
  try {
    const { category, semester, branch, q } = req.query;

    if (isDBConnected()) {
      const filter: any = {};
      if (category && typeof category === 'string' && category !== 'all') filter.category = category;
      if (semester && !isNaN(Number(semester))) filter.semester = Number(semester);
      if (branch && typeof branch === 'string' && branch !== 'all') filter.branch = branch.toUpperCase();
      if (q && typeof q === 'string') {
        filter.title = { $regex: q.trim(), $options: 'i' };
      }

      const resources = await Resource.find(filter)
        .populate('uploadedBy', 'name email role department semester')
        .sort({ createdAt: -1 })
        .lean();

      res.status(200).json({
        success: true,
        count: resources.length,
        storage: 'mongodb',
        data: resources,
      });
      return;
    }

    // In-memory fallback
    let list = [...getInMemoryResourcesList()];
    if (category && typeof category === 'string' && category !== 'all') {
      list = list.filter((r) => r.category === category);
    }
    if (semester && !isNaN(Number(semester))) {
      list = list.filter((r) => r.semester === Number(semester));
    }
    if (branch && typeof branch === 'string' && branch !== 'all') {
      list = list.filter((r) => r.branch === branch.toUpperCase());
    }
    if (q && typeof q === 'string') {
      const queryLower = q.toLowerCase().trim();
      list = list.filter((r) => r.title.toLowerCase().includes(queryLower));
    }

    res.status(200).json({
      success: true,
      count: list.length,
      storage: 'in-memory-preview',
      data: list,
    });
  } catch (error: any) {
    console.error('Error fetching admin resources list:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve admin resources',
      error: error.message,
    });
  }
}

/**
 * @desc    Delete or Moderate a Resource by ID
 * @route   DELETE /api/admin/resources/:id
 * @access  Private (Admin Secret Key Required)
 */
export async function deleteAdminResource(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Resource ID parameter is required for deletion',
      });
      return;
    }

    let deletedTitle = 'Resource';
    let fileUrlToDelete: string | null = null;
    let deletedFromMongo = false;

    if (isDBConnected() && mongoose.Types.ObjectId.isValid(id)) {
      const resourceToDelete = await Resource.findById(id);
      if (resourceToDelete) {
        deletedTitle = resourceToDelete.title;
        fileUrlToDelete = resourceToDelete.fileUrl;
        await Resource.findByIdAndDelete(id);
        deletedFromMongo = true;
      }
    }

    if (!deletedFromMongo) {
      // In-Memory Fallback
      const currentList = getInMemoryResourcesList();
      const existing = currentList.find((r) => r._id === id);

      if (!existing) {
        res.status(404).json({
          success: false,
          message: `Resource with ID '${id}' not found.`,
        });
        return;
      }

      deletedTitle = existing.title;
      fileUrlToDelete = existing.fileUrl;

      deleteInMemoryResourceById(id);
    }

    // Clean up local physical file in uploads folder if applicable (avoid deleting seed .html docs)
    if (fileUrlToDelete && fileUrlToDelete.startsWith('/uploads/')) {
      const filename = path.basename(fileUrlToDelete);
      // Only delete uploaded files with numeric timestamps, preserve shared demo seeds
      if (/^\d+-/.test(filename)) {
        const filePath = path.join(process.cwd(), 'uploads', filename);
        if (fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath);
          } catch (e) {
            console.warn('[Admin Delete] Could not remove file from disk:', e);
          }
        }
      }
    }

    res.status(200).json({
      success: true,
      message: `Resource "${deletedTitle}" was successfully deleted by administrator.`,
      deletedId: id,
      deletedTitle,
    });
  } catch (error: any) {
    console.error('Error deleting resource:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete resource',
      error: error.message,
    });
  }
}

/**
 * @desc    Reset or Re-seed Default Materials
 * @route   POST /api/admin/reset-seeds
 * @access  Private (Admin Secret Key Required)
 */
export async function resetDefaultSeeds(_req: Request, res: Response): Promise<void> {
  try {
    ensureSeedDocumentsExist();
    resetInMemoryResourcesList();

    const count = getInMemoryResourcesList().length;

    res.status(200).json({
      success: true,
      message: 'Demonstration materials and examination PYQs have been restored to initial state.',
      count,
    });
  } catch (error: any) {
    console.error('Error resetting seeds:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset repository seeds',
      error: error.message,
    });
  }
}

/**
 * @desc    Verify Administrative Credentials / Secret Key
 * @route   POST /api/admin/verify
 * @access  Private (Admin Secret Key Required via requireAdmin middleware)
 */
export async function verifyAdminKey(_req: Request, res: Response): Promise<void> {
  res.status(200).json({
    success: true,
    message: 'Admin Secret Key verified successfully.',
    role: 'admin',
  });
}
