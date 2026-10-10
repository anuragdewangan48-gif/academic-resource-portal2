import { Request, Response } from 'express';
import { User, IUser } from '../models/User.js';
import { isDBConnected } from '../config/db.js';

export const DEFAULT_USERS = [
  {
    _id: 'usr-admin-1',
    name: 'Anurag Dewangan',
    email: 'anuragdewangan06@gmail.com',
    role: 'admin',
    department: 'Computer Science & Engineering',
    semester: 6,
    createdAt: new Date('2026-01-01'),
  },
  {
    _id: 'usr-prof-1',
    name: 'Dr. Aris Thorne',
    email: 'thorne@university.edu',
    role: 'admin',
    department: 'Computer Science & Engineering',
    semester: 5,
    createdAt: new Date('2026-01-05'),
  },
  {
    _id: 'usr-prof-2',
    name: 'Prof. Sarah Jenkins',
    email: 'jenkins@university.edu',
    role: 'admin',
    department: 'Data Science & AI',
    semester: 6,
    createdAt: new Date('2026-01-10'),
  },
  {
    _id: 'usr-stud-1',
    name: 'Rohan Sharma',
    email: 'rohan.s@student.edu',
    role: 'student',
    department: 'Computer Science',
    semester: 3,
    createdAt: new Date('2026-01-15'),
  },
  {
    _id: 'usr-stud-2',
    name: 'Ananya Verma',
    email: 'ananya.v@student.edu',
    role: 'student',
    department: 'Data Science & AI',
    semester: 4,
    createdAt: new Date('2026-01-20'),
  },
  {
    _id: 'usr-stud-3',
    name: 'Vikram Patel',
    email: 'vikram.p@student.edu',
    role: 'student',
    department: 'Electronics & Communication',
    semester: 5,
    createdAt: new Date('2026-01-25'),
  },
  {
    _id: 'usr-stud-4',
    name: 'Pooja Iyer',
    email: 'pooja.i@student.edu',
    role: 'student',
    department: 'Electronics & Communication',
    semester: 3,
    createdAt: new Date('2026-01-28'),
  },
];

let inMemoryUsers: any[] = [...DEFAULT_USERS];

/**
 * Ensures default users exist in MongoDB upon connection
 */
export async function ensureDefaultUsersInMongo(): Promise<void> {
  if (!isDBConnected()) return;
  try {
    const count = await User.countDocuments();
    if (count === 0) {
      console.log('[Database] Seeding default academic users into MongoDB...');
      await User.insertMany(
        DEFAULT_USERS.map((u) => ({
          name: u.name,
          email: u.email,
          role: u.role,
          department: u.department,
          semester: u.semester,
        }))
      );
      console.log('[Database] Default academic users successfully seeded into MongoDB.');
    }
  } catch (err: any) {
    console.warn('[Database] Error checking/seeding default users in MongoDB:', err.message);
  }
}

/**
 * @desc    Create a new user (Student or Admin)
 * @route   POST /api/users
 */
export async function createUser(req: Request, res: Response): Promise<void> {
  try {
    const { name, email, role, department, semester } = req.body;

    if (!name || !email || !department || semester === undefined) {
      res.status(400).json({
        success: false,
        message: 'Name, email, department, and semester are required.',
      });
      return;
    }

    const assignedRole = role === 'admin' ? 'admin' : 'student';
    const sem = Number(semester);

    if (isNaN(sem) || sem < 1 || sem > 8) {
      res.status(400).json({
        success: false,
        message: 'Semester must be between 1 and 8.',
      });
      return;
    }

    if (isDBConnected()) {
      const existing = await User.findOne({ email: email.toLowerCase().trim() });
      if (existing) {
        res.status(409).json({
          success: false,
          message: `User with email ${email} already exists.`,
        });
        return;
      }

      const user = await User.create({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        role: assignedRole,
        department: department.trim(),
        semester: sem,
      });

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        storage: 'mongodb',
        data: user,
      });
      return;
    }

    // In-memory fallback
    const newUser = {
      _id: `65f1a2b3c4d5e6f7a8b9${Math.floor(1000 + Math.random() * 9000)}`,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      role: assignedRole,
      department: department.trim(),
      semester: sem,
      createdAt: new Date(),
    };

    inMemoryUsers.push(newUser);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      storage: 'in-memory-preview',
      data: newUser,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to create user',
      error: error.message,
    });
  }
}

/**
 * @desc    Get all registered users
 * @route   GET /api/users
 */
export async function getUsers(req: Request, res: Response): Promise<void> {
  try {
    if (isDBConnected()) {
      const users = await User.find().sort({ createdAt: -1 }).lean();
      res.status(200).json({
        success: true,
        count: users.length,
        storage: 'mongodb',
        data: users,
      });
      return;
    }

    res.status(200).json({
      success: true,
      count: inMemoryUsers.length,
      storage: 'in-memory-preview',
      data: inMemoryUsers,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message,
    });
  }
}
