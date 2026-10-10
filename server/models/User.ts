import mongoose, { Document, Schema, Model } from 'mongoose';

/**
 * User Interface defining document structure in TypeScript
 */
export interface IUser extends Document {
  name: string;
  email: string;
  role: 'student' | 'admin';
  department: string;
  semester: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Mongoose Schema for User
 * Represents registered students and administrators who can upload and manage academic resources.
 */
const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'User name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    role: {
      type: String,
      enum: {
        values: ['student', 'admin'],
        message: '{VALUE} is not a valid role. Allowed roles: student, admin',
      },
      default: 'student',
      required: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required (e.g., Computer Science, Electrical Engineering)'],
      trim: true,
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
      min: [1, 'Semester must be at least 1'],
      max: [8, 'Semester cannot exceed 8'],
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

// Export Mongoose Model (re-uses existing compiled model if already cached)
export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
