import mongoose, { Document, Schema, Model, Types } from 'mongoose';
import { IUser } from './User.js';

export type ResourceCategory = 'PYQ' | 'Lecture Notes' | 'Lab Manual' | 'Syllabus';

export const RESOURCE_CATEGORIES: ResourceCategory[] = [
  'PYQ',
  'Lecture Notes',
  'Lab Manual',
  'Syllabus',
];

export type AcademicBranch = 'CSE' | 'DSAI' | 'ECE' | 'General';

export const ACADEMIC_BRANCHES: AcademicBranch[] = [
  'CSE',
  'DSAI',
  'ECE',
  'General',
];

/**
 * Interface representing an Academic Resource / Previous Year Question (PYQ) document
 */
export interface IResource extends Document {
  title: string;
  subjectCode?: string;
  semester: number;
  branch: AcademicBranch;
  category: ResourceCategory;
  courseType?: string;
  year?: number;
  fileUrl: string;
  uploadedBy: Types.ObjectId | IUser;
  upvotes: number;
  createdAt: Date;
  updatedAt?: Date;
}

/**
 * Mongoose Schema for Academic Resource and PYQ
 */
const ResourceSchema = new Schema<IResource>(
  {
    title: {
      type: String,
      required: [true, 'Resource title is required'],
      trim: true,
      maxlength: [180, 'Title cannot exceed 180 characters'],
    },
    subjectCode: {
      type: String,
      required: false,
      trim: true,
      uppercase: true,
      default: '',
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
      min: [1, 'Semester cannot be less than 1'],
      max: [8, 'Semester cannot exceed 8'],
    },
    branch: {
      type: String,
      required: [true, 'Academic branch is required (e.g. CSE, DSAI, ECE)'],
      enum: {
        values: ACADEMIC_BRANCHES,
        message: '{VALUE} is not a valid branch. Must be one of: CSE, DSAI, ECE, General',
      },
      default: 'CSE',
      uppercase: true,
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Resource category is required'],
      enum: {
        values: RESOURCE_CATEGORIES,
        message: '{VALUE} is not a valid category. Must be one of: PYQ, Lecture Notes, Lab Manual, Syllabus',
      },
    },
    courseType: {
      type: String,
      trim: true,
      default: 'Core Course',
    },
    year: {
      type: Number,
      min: [2000, 'Year must be 2000 or newer'],
      max: [2035, 'Year must not exceed 2035'],
      default: new Date().getFullYear(),
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL or storage link is required'],
      trim: true,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference (uploadedBy) is required'],
    },
    upvotes: {
      type: Number,
      default: 0,
      min: [0, 'Upvotes cannot be negative'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
  }
);

// Indexes to optimize filter queries by branch, semester, subjectCode, and category
ResourceSchema.index({ branch: 1, category: 1, semester: 1 });
ResourceSchema.index({ branch: 1, semester: 1 });
ResourceSchema.index({ semester: 1, subjectCode: 1, category: 1 });
ResourceSchema.index({ subjectCode: 1 });
ResourceSchema.index({ category: 1 });
ResourceSchema.index({ branch: 1 });
ResourceSchema.index({ upvotes: -1 });

export const Resource: Model<IResource> =
  mongoose.models.Resource || mongoose.model<IResource>('Resource', ResourceSchema);
