import { Request, Response } from 'express';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import {
  Resource,
  RESOURCE_CATEGORIES,
  ResourceCategory,
  AcademicBranch,
  ACADEMIC_BRANCHES,
} from '../models/Resource.js';
import { User } from '../models/User.js';
import { isDBConnected } from '../config/db.js';
import {
  ensureSeedDocumentsExist,
  generateAcademicDocumentHtml,
} from '../utils/documentGenerator.js';

// Pre-populate sample documents in uploads directory
ensureSeedDocumentsExist();

/**
 * Demonstration sample data used as fallback when an external MongoDB instance
 * is not yet connected in the current runtime environment.
 */
interface FallbackResource {
  _id: string;
  title: string;
  subjectCode?: string;
  semester: number;
  branch: AcademicBranch;
  category: ResourceCategory;
  courseType?: string;
  year?: number;
  fileUrl: string;
  uploadedBy: {
    _id: string;
    name: string;
    email: string;
    role: 'student' | 'admin';
    department: string;
    semester: number;
  };
  upvotes: number;
  createdAt: Date;
  updatedAt: Date;
}

const INITIAL_SEED_RESOURCES: FallbackResource[] = [
  // --- CSE (Computer Science & Engineering) Resources ---
  {
    _id: 'res-seed-1',
    title: 'Operating Systems End-Sem Solved PYQ 2024 (Paging, LRU, Deadlocks & Synchronization)',
    subjectCode: 'CS301',
    semester: 5,
    branch: 'CSE',
    category: 'PYQ',
    courseType: 'Core Theory',
    year: 2024,
    fileUrl: '/uploads/OS-EndSem-2024-Solved-PYQ.html',
    uploadedBy: {
      _id: 'usr-prof-1',
      name: 'Dr. Aris Thorne',
      email: 'thorne@university.edu',
      role: 'admin',
      department: 'Computer Science & Engineering',
      semester: 5,
    },
    upvotes: 42,
    createdAt: new Date(Date.now() - 86400000 * 3),
    updatedAt: new Date(Date.now() - 86400000 * 3),
  },
  {
    _id: 'res-seed-2',
    title: 'Master Theorem, Recurrence Relations & Asymptotic Complexity Cheat-Sheet',
    subjectCode: 'CS201',
    semester: 3,
    branch: 'CSE',
    category: 'Lecture Notes',
    courseType: 'Core Theory',
    year: 2024,
    fileUrl: '/uploads/Master-Theorem-Algorithms-Notes.html',
    uploadedBy: {
      _id: 'usr-stud-1',
      name: 'Rohan Sharma',
      email: 'rohan.s@student.edu',
      role: 'student',
      department: 'Computer Science',
      semester: 3,
    },
    upvotes: 38,
    createdAt: new Date(Date.now() - 86400000 * 5),
    updatedAt: new Date(Date.now() - 86400000 * 5),
  },
  {
    _id: 'res-seed-3',
    title: 'Graph Algorithms Mid-Sem PYQ 2023 (Dijkstra, Bellman-Ford, Kruskal & Prim Minimum Spanning Tree)',
    subjectCode: 'CS201',
    semester: 3,
    branch: 'CSE',
    category: 'PYQ',
    courseType: 'Core Theory',
    year: 2023,
    fileUrl: '/uploads/Graph-Algorithms-MidSem-PYQ.html',
    uploadedBy: {
      _id: 'usr-stud-2',
      name: 'Ananya Verma',
      email: 'ananya.v@student.edu',
      role: 'student',
      department: 'Information Technology',
      semester: 3,
    },
    upvotes: 29,
    createdAt: new Date(Date.now() - 86400000 * 10),
    updatedAt: new Date(Date.now() - 86400000 * 10),
  },
  {
    _id: 'res-seed-4',
    title: 'DBMS End-Term Solved PYQ 2024 (ACID Transactions, 3NF/BCNF Normalization & B+ Trees)',
    subjectCode: 'CS302',
    semester: 4,
    branch: 'CSE',
    category: 'PYQ',
    courseType: 'Core Theory',
    year: 2024,
    fileUrl: '/uploads/DBMS-EndTerm-Solved-PYQ-2024.html',
    uploadedBy: {
      _id: 'usr-prof-2',
      name: 'Prof. Sarah Jenkins',
      email: 'jenkins@university.edu',
      role: 'admin',
      department: 'Computer Science & Engineering',
      semester: 4,
    },
    upvotes: 51,
    createdAt: new Date(Date.now() - 86400000 * 2),
    updatedAt: new Date(Date.now() - 86400000 * 2),
  },
  {
    _id: 'res-seed-5',
    title: 'Computer Networks Comprehensive PYQ & Viva Questions (TCP vs UDP, Subnetting, OSI Model)',
    subjectCode: 'CS401',
    semester: 6,
    branch: 'CSE',
    category: 'PYQ',
    courseType: 'Core Theory',
    year: 2024,
    fileUrl: '/uploads/Computer-Networks-PYQ-ExamGuide.html',
    uploadedBy: {
      _id: 'usr-stud-3',
      name: 'Vikram Patel',
      email: 'vikram.p@student.edu',
      role: 'student',
      department: 'Computer Science',
      semester: 6,
    },
    upvotes: 35,
    createdAt: new Date(Date.now() - 86400000 * 7),
    updatedAt: new Date(Date.now() - 86400000 * 7),
  },
  {
    _id: 'res-seed-6',
    title: 'Unix Shell Scripting, Semaphore IPC & Threads Lab Manual',
    subjectCode: 'CS301',
    semester: 5,
    branch: 'CSE',
    category: 'Lab Manual',
    courseType: 'Practical / Lab',
    year: 2024,
    fileUrl: '/uploads/OS-Lab-Manual-Unix-Shell.html',
    uploadedBy: {
      _id: 'usr-prof-1',
      name: 'Dr. Aris Thorne',
      email: 'thorne@university.edu',
      role: 'admin',
      department: 'Computer Science & Engineering',
      semester: 5,
    },
    upvotes: 21,
    createdAt: new Date(Date.now() - 86400000 * 12),
    updatedAt: new Date(Date.now() - 86400000 * 12),
  },

  // --- DSAI (Data Science & Artificial Intelligence) Resources ---
  {
    _id: 'res-seed-dsai-1',
    title: 'Deep Learning & Neural Architectures End-Sem Solved PYQ 2024 (Backprop, CNNs, Attention & Transformers)',
    subjectCode: 'AI301',
    semester: 6,
    branch: 'DSAI',
    category: 'PYQ',
    courseType: 'Core Theory',
    year: 2024,
    fileUrl: '/uploads/Deep-Learning-Neural-Nets-PYQ.html',
    uploadedBy: {
      _id: 'usr-prof-2',
      name: 'Prof. Sarah Jenkins',
      email: 'jenkins@university.edu',
      role: 'admin',
      department: 'Data Science & AI',
      semester: 6,
    },
    upvotes: 46,
    createdAt: new Date(Date.now() - 86400000 * 1),
    updatedAt: new Date(Date.now() - 86400000 * 1),
  },
  {
    _id: 'res-seed-dsai-2',
    title: 'Probability, Statistics & Bayesian Inference Lecture Notes for Data Science & AI',
    subjectCode: 'DS201',
    semester: 4,
    branch: 'DSAI',
    category: 'Lecture Notes',
    courseType: 'Core Theory',
    year: 2024,
    fileUrl: '/uploads/Probability-Stats-ML-Notes.html',
    uploadedBy: {
      _id: 'usr-stud-1',
      name: 'Rohan Sharma',
      email: 'rohan.s@student.edu',
      role: 'student',
      department: 'Data Science & AI',
      semester: 4,
    },
    upvotes: 39,
    createdAt: new Date(Date.now() - 86400000 * 4),
    updatedAt: new Date(Date.now() - 86400000 * 4),
  },
  {
    _id: 'res-seed-dsai-3',
    title: 'Machine Learning & Data Science with PyTorch Lab Manual (PCA, Regression, Gradient Descent)',
    subjectCode: 'DS301',
    semester: 5,
    branch: 'DSAI',
    category: 'Lab Manual',
    courseType: 'Practical / Lab',
    year: 2024,
    fileUrl: '/uploads/PyTorch-DataScience-Lab-Manual.html',
    uploadedBy: {
      _id: 'usr-stud-2',
      name: 'Ananya Verma',
      email: 'ananya.v@student.edu',
      role: 'student',
      department: 'Data Science & AI',
      semester: 5,
    },
    upvotes: 31,
    createdAt: new Date(Date.now() - 86400000 * 6),
    updatedAt: new Date(Date.now() - 86400000 * 6),
  },

  // --- ECE (Electronics & Communication Engineering) Resources ---
  {
    _id: 'res-seed-ece-1',
    title: 'Digital Signal Processing (DSP) & Filter Design Solved End-Sem PYQ 2024 (Z-Transform, FFT & IIR/FIR)',
    subjectCode: 'EC302',
    semester: 5,
    branch: 'ECE',
    category: 'PYQ',
    courseType: 'Core Theory',
    year: 2024,
    fileUrl: '/uploads/DSP-Filter-Design-Solved-PYQ.html',
    uploadedBy: {
      _id: 'usr-prof-1',
      name: 'Dr. Aris Thorne',
      email: 'thorne@university.edu',
      role: 'admin',
      department: 'Electronics & Communication',
      semester: 5,
    },
    upvotes: 44,
    createdAt: new Date(Date.now() - 86400000 * 2),
    updatedAt: new Date(Date.now() - 86400000 * 2),
  },
  {
    _id: 'res-seed-ece-2',
    title: 'Signals & Systems Comprehensive Lecture Notes (Continuous & Discrete Fourier Transforms, LTI Systems)',
    subjectCode: 'EC201',
    semester: 3,
    branch: 'ECE',
    category: 'Lecture Notes',
    courseType: 'Core Theory',
    year: 2024,
    fileUrl: '/uploads/Signals-and-Systems-Notes.html',
    uploadedBy: {
      _id: 'usr-stud-4',
      name: 'Pooja Iyer',
      email: 'pooja.i@student.edu',
      role: 'student',
      department: 'Electronics & Communication',
      semester: 3,
    },
    upvotes: 37,
    createdAt: new Date(Date.now() - 86400000 * 5),
    updatedAt: new Date(Date.now() - 86400000 * 5),
  },
  {
    _id: 'res-seed-ece-3',
    title: 'Microprocessors 8086 & Embedded ARM Microcontroller Architecture Lab Manual',
    subjectCode: 'EC301',
    semester: 5,
    branch: 'ECE',
    category: 'Lab Manual',
    courseType: 'Practical / Lab',
    year: 2024,
    fileUrl: '/uploads/Microprocessors-8086-Lab-Manual.html',
    uploadedBy: {
      _id: 'usr-stud-3',
      name: 'Vikram Patel',
      email: 'vikram.p@student.edu',
      role: 'student',
      department: 'Electronics & Communication',
      semester: 5,
    },
    upvotes: 26,
    createdAt: new Date(Date.now() - 86400000 * 9),
    updatedAt: new Date(Date.now() - 86400000 * 9),
  },

  // --- General / First-Year Engineering Resources ---
  {
    _id: 'res-seed-7',
    title: 'Engineering Mathematics III (Fourier Series, Laplace Transforms & Differential Equations Notes)',
    subjectCode: 'MA201',
    semester: 3,
    branch: 'General',
    category: 'Lecture Notes',
    courseType: 'Core Theory',
    year: 2024,
    fileUrl: '/uploads/Engg-Math-Fourier-Laplace-Notes.html',
    uploadedBy: {
      _id: 'usr-stud-4',
      name: 'Pooja Iyer',
      email: 'pooja.i@student.edu',
      role: 'student',
      department: 'Electrical & Electronics',
      semester: 3,
    },
    upvotes: 19,
    createdAt: new Date(Date.now() - 86400000 * 8),
    updatedAt: new Date(Date.now() - 86400000 * 8),
  }
];

let inMemoryResources: FallbackResource[] = [...INITIAL_SEED_RESOURCES];

export function getInMemoryResourcesList(): FallbackResource[] {
  return inMemoryResources;
}

export function deleteInMemoryResourceById(id: string): boolean {
  const initialLength = inMemoryResources.length;
  inMemoryResources = inMemoryResources.filter((r) => r._id !== id);
  return inMemoryResources.length < initialLength;
}

export function resetInMemoryResourcesList(): void {
  inMemoryResources = [...INITIAL_SEED_RESOURCES];
}

/**
 * Intelligent helper to find matching resources based on student doubt / query keywords.
 */
export async function findRelevantResources(options: {
  query: string;
  semester?: number;
  category?: string;
  branch?: string;
  limit?: number;
}): Promise<any[]> {
  const { query, semester, category, branch, limit = 4 } = options;

  const stopWords = new Set([
    'what', 'is', 'are', 'the', 'explain', 'how', 'to', 'for', 'a', 'an',
    'in', 'of', 'and', 'with', 'please', 'me', 'give', 'about', 'need',
    'questions', 'question', 'exam', 'paper', 'university', 'college', 'help',
    'find', 'show', 'provide', 'solve', 'solution', 'i', 'my', 'study', 'studying',
  ]);

  const rawTokens = query
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));

  // If live MongoDB is active
  if (isDBConnected()) {
    try {
      const orConditions: any[] = [];
      for (const token of rawTokens) {
        orConditions.push({ title: { $regex: token, $options: 'i' } });
        orConditions.push({ courseType: { $regex: token, $options: 'i' } });
        orConditions.push({ category: { $regex: token, $options: 'i' } });
        orConditions.push({ subjectCode: { $regex: token, $options: 'i' } });
      }

      const filter: any = {};
      if (orConditions.length > 0) {
        filter.$or = orConditions;
      }
      if (semester) {
        filter.semester = Number(semester);
      }
      if (category) {
        filter.category = category;
      }
      if (branch && branch.toLowerCase() !== 'all') {
        filter.branch = branch.toUpperCase();
      }

      const docs = await Resource.find(filter)
        .populate('uploadedBy', 'name email department role semester')
        .sort({ upvotes: -1, createdAt: -1 })
        .limit(limit)
        .lean();

      if (docs.length > 0) return docs;

      // Fallback: top upvoted in MongoDB
      const fallbackFilter: any = {};
      if (branch && branch.toLowerCase() !== 'all') {
        fallbackFilter.branch = branch.toUpperCase();
      }
      return await Resource.find(fallbackFilter)
        .populate('uploadedBy', 'name email department role semester')
        .sort({ upvotes: -1 })
        .limit(limit)
        .lean();
    } catch (dbErr) {
      console.warn('Error querying MongoDB for AI resources:', dbErr);
    }
  }

  // Fallback in-memory search
  let pool = [...inMemoryResources];

  if (branch && branch.toLowerCase() !== 'all') {
    pool = pool.filter((r) => r.branch === branch.toUpperCase());
  }
  if (semester) {
    const semNum = Number(semester);
    if (!isNaN(semNum)) pool = pool.filter((r) => r.semester === semNum);
  }
  if (category) {
    pool = pool.filter((r) => r.category.toLowerCase() === category.toLowerCase());
  }

  if (rawTokens.length === 0) {
    return pool.sort((a, b) => b.upvotes - a.upvotes).slice(0, limit);
  }

  const scored = pool.map((r) => {
    let score = 0;
    const titleLower = r.title.toLowerCase();
    const catLower = r.category.toLowerCase();
    const typeLower = (r.courseType || '').toLowerCase();
    const codeLower = (r.subjectCode || '').toLowerCase();

    for (const token of rawTokens) {
      if (titleLower.includes(token)) score += 6;
      if (typeLower.includes(token)) score += 3;
      if (catLower.includes(token)) score += 2;
      if (codeLower.includes(token)) score += 5;
    }

    // Boost with upvotes
    score += (r.upvotes || 0) * 0.05;

    return { resource: r, score };
  });

  const matching = scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((s) => s.resource);

  if (matching.length > 0) {
    return matching.slice(0, limit);
  }

  // If no direct token match, return the highest-rated resources as recommendations
  return pool.sort((a, b) => b.upvotes - a.upvotes).slice(0, limit);
}

/**
 * @desc    Upload resource metadata link
 * @route   POST /api/resources
 * @access  Public (or Authenticated User)
 */
export async function uploadResource(req: Request, res: Response): Promise<void> {
  try {
    const {
      title,
      subjectCode,
      semester,
      branch,
      category,
      uploadedBy,
      courseType,
      year,
      contributorName,
      contributorEmail,
      contributorDepartment,
    } = req.body;

    // Resolve fileUrl from uploaded file (via multer) or direct link body
    let targetFileUrl = req.body.fileUrl ? String(req.body.fileUrl).trim() : '';
    if (req.file) {
      targetFileUrl = `/uploads/${req.file.filename}`;
    }

    // 1. Basic validation (subjectCode is now optional)
    if (!title || semester === undefined || !category || !targetFileUrl) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields: title, semester, category, and file or fileUrl are mandatory.',
      });
      return;
    }

    // 2. Validate category enum
    if (!RESOURCE_CATEGORIES.includes(category)) {
      res.status(400).json({
        success: false,
        message: `Invalid category: '${category}'. Allowed values are: ${RESOURCE_CATEGORIES.join(', ')}`,
      });
      return;
    }

    const parsedSemester = Number(semester);
    if (isNaN(parsedSemester) || parsedSemester < 1 || parsedSemester > 8) {
      res.status(400).json({
        success: false,
        message: 'Semester must be a valid number between 1 and 8.',
      });
      return;
    }

    // Validate branch enum (e.g. CSE, DSAI, ECE, General)
    const normalizedBranch: AcademicBranch = (branch && ACADEMIC_BRANCHES.includes(branch.trim().toUpperCase() as AcademicBranch))
      ? (branch.trim().toUpperCase() as AcademicBranch)
      : 'CSE';

    const formattedSubjectCode = subjectCode ? String(subjectCode).trim().toUpperCase() : '';
    const parsedYear = year ? Number(year) : new Date().getFullYear();
    const validatedCourseType = courseType ? String(courseType).trim() : 'Core Course';

    // 3. Execution via Live MongoDB if connected
    if (isDBConnected()) {
      // Validate ObjectId for uploadedBy if provided
      let validUploadedBy = uploadedBy;
      if (uploadedBy && !mongoose.Types.ObjectId.isValid(uploadedBy)) {
        res.status(400).json({
          success: false,
          message: 'Invalid uploadedBy ID format. Must be a 24-character hex ObjectId.',
        });
        return;
      }

      // If valid ObjectId provided, verify User exists in database
      if (validUploadedBy) {
        const userExists = await User.findById(validUploadedBy);
        if (!userExists) {
          validUploadedBy = undefined;
        }
      }

      // If no valid uploadedBy, fallback to first user in database or create default admin
      if (!validUploadedBy) {
        let firstUser = await User.findOne();
        if (!firstUser) {
          firstUser = await User.create({
            name: contributorName?.trim() || 'Anurag Dewangan',
            email: 'anuragdewangan06@gmail.com',
            role: 'admin',
            department: `${normalizedBranch} Engineering`,
            semester: parsedSemester,
          });
        }
        validUploadedBy = firstUser._id;
      }

      // Create Mongoose document
      const newResource = await Resource.create({
        title: title.trim(),
        subjectCode: formattedSubjectCode,
        semester: parsedSemester,
        branch: normalizedBranch,
        category,
        courseType: validatedCourseType,
        year: parsedYear,
        fileUrl: targetFileUrl,
        uploadedBy: validUploadedBy,
        upvotes: 0,
      });

      // Populate user info for immediate response
      const populated = await newResource.populate('uploadedBy', 'name email department role semester');

      res.status(201).json({
        success: true,
        message: 'Resource metadata link successfully uploaded',
        storage: 'mongodb',
        data: populated,
      });
      return;
    }

    // 4. In-Memory Store Execution (Development/Preview without active MongoDB daemon)
    const newDoc: FallbackResource = {
      _id: new mongoose.Types.ObjectId().toString(),
      title: title.trim(),
      subjectCode: formattedSubjectCode,
      semester: parsedSemester,
      branch: normalizedBranch,
      category,
      courseType: validatedCourseType,
      year: parsedYear,
      fileUrl: targetFileUrl,
      uploadedBy: {
        _id: typeof uploadedBy === 'string' ? uploadedBy : new mongoose.Types.ObjectId().toString(),
        name: contributorName?.trim() || (typeof uploadedBy === 'object' && uploadedBy?.name) || 'Student Contributor',
        email: contributorEmail?.trim() || (typeof uploadedBy === 'object' && uploadedBy?.email) || 'student@university.edu',
        role: 'student',
        department: contributorDepartment?.trim() || `${normalizedBranch} Engineering`,
        semester: parsedSemester,
      },
      upvotes: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    inMemoryResources.unshift(newDoc);

    res.status(201).json({
      success: true,
      message: 'Resource metadata link successfully uploaded',
      storage: 'in-memory-preview',
      data: newDoc,
    });
  } catch (error: any) {
    console.error('Error uploading resource:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload resource metadata link',
      error: error.message,
    });
  }
}

/**
 * @desc    Fetch resources with query filters (branch, semester, subjectCode, category)
 * @route   GET /api/resources
 * @query   ?branch=CSE&semester=3&subjectCode=CS201&category=PYQ&sort=upvotes
 */
export async function getResources(req: Request, res: Response): Promise<void> {
  try {
    const { semester, subjectCode, category, branch, sort } = req.query;

    // Construct filter object for MongoDB
    const filter: Record<string, any> = {};

    if (branch && typeof branch === 'string' && branch.trim() !== '' && branch.toLowerCase() !== 'all') {
      filter.branch = branch.trim().toUpperCase();
    }

    if (semester !== undefined && semester !== '') {
      const semNum = Number(semester);
      if (!isNaN(semNum)) {
        filter.semester = semNum;
      }
    }

    if (subjectCode && typeof subjectCode === 'string' && subjectCode.trim() !== '') {
      // Regex for flexible case-insensitive search or exact subjectCode matching
      filter.subjectCode = subjectCode.trim().toUpperCase();
    }

    if (category && typeof category === 'string' && category.trim() !== '') {
      filter.category = category.trim();
    }

    // Determine sort order
    let sortOptions: any = { createdAt: -1 };
    if (sort === 'upvotes') {
      sortOptions = { upvotes: -1, createdAt: -1 };
    } else if (sort === 'oldest') {
      sortOptions = { createdAt: 1 };
    }

    // 1. Live MongoDB Query Execution
    if (isDBConnected()) {
      const resources = await Resource.find(filter)
        .populate('uploadedBy', 'name email department role semester')
        .sort(sortOptions)
        .lean();

      res.status(200).json({
        success: true,
        count: resources.length,
        filters: filter,
        storage: 'mongodb',
        data: resources,
      });
      return;
    }

    // 2. Fallback in-memory filter execution
    let filtered = [...inMemoryResources];

    if (filter.branch) {
      filtered = filtered.filter((r) => r.branch === filter.branch);
    }
    if (filter.semester !== undefined) {
      filtered = filtered.filter((r) => r.semester === filter.semester);
    }
    if (filter.subjectCode) {
      filtered = filtered.filter((r) => (r.subjectCode || '').toUpperCase() === filter.subjectCode);
    }
    if (filter.category) {
      filtered = filtered.filter((r) => r.category === filter.category);
    }

    if (sort === 'upvotes') {
      filtered.sort((a, b) => b.upvotes - a.upvotes);
    } else {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    res.status(200).json({
      success: true,
      count: filtered.length,
      filters: filter,
      storage: 'in-memory-preview',
      data: filtered,
    });
  } catch (error: any) {
    console.error('Error fetching resources:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve academic resources',
      error: error.message,
    });
  }
}

/**
 * @desc    Upvote a resource by ID
 * @route   PATCH /api/resources/:id/upvote (or POST /api/resources/:id/upvote)
 * @param   id - Resource ObjectId
 */
export async function upvoteResource(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Resource ID parameter is required',
      });
      return;
    }

    // 1. Live MongoDB Atomic Upvote
    if (isDBConnected() && mongoose.Types.ObjectId.isValid(id)) {
      // Atomically increment upvotes field by 1 using MongoDB $inc operator
      const updatedResource = await Resource.findByIdAndUpdate(
        id,
        { $inc: { upvotes: 1 } },
        { new: true, runValidators: true }
      ).populate('uploadedBy', 'name email department role');

      if (updatedResource) {
        res.status(200).json({
          success: true,
          message: 'Resource upvoted successfully',
          storage: 'mongodb',
          data: updatedResource,
        });
        return;
      }
    }

    // 2. In-Memory Store Execution
    const item = inMemoryResources.find((r) => r._id === id);
    if (!item) {
      res.status(404).json({
        success: false,
        message: `Resource with ID ${id} not found`,
      });
      return;
    }

    item.upvotes += 1;
    item.updatedAt = new Date();

    res.status(200).json({
      success: true,
      message: 'Resource upvoted successfully',
      storage: 'in-memory-preview',
      data: item,
    });
  } catch (error: any) {
    console.error('Error upvoting resource:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upvote resource',
      error: error.message,
    });
  }
}

/**
 * Internal helper to stream or redirect academic resource file
 */
async function streamOrRedirectResource(
  req: Request,
  res: Response,
  action: 'download' | 'view'
): Promise<void> {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ success: false, message: 'Resource ID parameter is required' });
      return;
    }

    let resource: any = null;

    if (isDBConnected() && mongoose.Types.ObjectId.isValid(id)) {
      resource = await Resource.findById(id).populate('uploadedBy', 'name email department role semester').lean();
    }

    if (!resource) {
      resource = inMemoryResources.find((r) => r._id === id);
    }

    if (!resource) {
      res.status(404).json({ success: false, message: `Resource with ID '${id}' not found` });
      return;
    }

    const rawUrl: string = resource.fileUrl || '';
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // 1. If it's a local uploads path (/uploads/... or relative uploads/... or mock internal domain)
    if (
      rawUrl.startsWith('/uploads/') ||
      rawUrl.startsWith('uploads/') ||
      rawUrl.includes('academic-vault.internal/uploads/')
    ) {
      const filename = path.basename(rawUrl);
      const localFilePath = path.join(uploadsDir, filename);

      if (fs.existsSync(localFilePath)) {
        if (action === 'download') {
          const ext = path.extname(filename) || '';
          const cleanTitle = (resource.title || 'academic_document').replace(/[^a-zA-Z0-9.-]/g, '_');
          const finalDownloadName = cleanTitle.toLowerCase().endsWith(ext.toLowerCase())
            ? cleanTitle
            : `${cleanTitle}${ext}`;
          res.download(localFilePath, finalDownloadName);
        } else {
          const ext = path.extname(filename).toLowerCase();
          if (ext === '.pdf') {
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(filename)}"`);
          } else if (ext === '.html' || ext === '.htm') {
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
          } else if (ext === '.txt') {
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
          }
          res.sendFile(localFilePath);
        }
        return;
      }

      // If physical file is missing from disk, generate academic document HTML on the fly and save it
      const uploaderName =
        typeof resource.uploadedBy === 'object' && resource.uploadedBy !== null
          ? (resource.uploadedBy as any).name
          : 'Verified Academic Contributor';

      const generatedHtml = generateAcademicDocumentHtml({
        title: resource.title,
        category: resource.category,
        semester: resource.semester,
        year: resource.year,
        courseType: resource.courseType,
        uploadedByName: uploaderName,
      });
      fs.writeFileSync(localFilePath, generatedHtml, 'utf-8');

      if (action === 'download') {
        const safeTitle = resource.title.replace(/[^a-zA-Z0-9.-]/g, '_');
        res.download(localFilePath, `${safeTitle}.html`);
      } else {
        res.sendFile(localFilePath);
      }
      return;
    }

    // 2. If it's an external URL (Google Drive, Dropbox, arXiv, etc.)
    if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
      res.redirect(rawUrl);
      return;
    }

    // 3. Fallback: check if local file by basename exists
    const candidatePath = path.join(uploadsDir, path.basename(rawUrl));
    if (fs.existsSync(candidatePath)) {
      if (action === 'download') {
        res.download(candidatePath);
      } else {
        res.sendFile(candidatePath);
      }
      return;
    }

    // 4. Default fallback: generate and send document directly
    const uploaderName =
      typeof resource.uploadedBy === 'object' && resource.uploadedBy !== null
        ? (resource.uploadedBy as any).name
        : 'Verified Academic Contributor';

    const fallbackHtml = generateAcademicDocumentHtml({
      title: resource.title,
      category: resource.category,
      semester: resource.semester,
      year: resource.year,
      courseType: resource.courseType,
      uploadedByName: uploaderName,
    });
    res.type('html').send(fallbackHtml);
  } catch (err: any) {
    console.error(`Error in resource ${action}:`, err);
    res.status(500).json({
      success: false,
      message: `Failed to ${action} resource file`,
      error: err.message,
    });
  }
}

/**
 * @desc    Download resource file
 * @route   GET /api/resources/:id/download
 */
export async function downloadResource(req: Request, res: Response): Promise<void> {
  return streamOrRedirectResource(req, res, 'download');
}

/**
 * @desc    View resource file inline
 * @route   GET /api/resources/:id/view
 */
export async function viewResource(req: Request, res: Response): Promise<void> {
  return streamOrRedirectResource(req, res, 'view');
}

