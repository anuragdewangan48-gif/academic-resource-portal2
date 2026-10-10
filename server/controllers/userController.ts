import { Request, Response } from 'express';
import { User, IUser } from '../models/User.js';
import { isDBConnected } from '../config/db.js';

let inMemoryUsers: any[] = [];

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
