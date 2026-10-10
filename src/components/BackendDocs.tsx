import React, { useState } from 'react';
import {
  Code,
  Terminal,
  Database,
  Check,
  Copy,
  Layers,
  Sparkles,
  Server,
} from 'lucide-react';
import { ServerStatus } from '../types.js';

interface BackendDocsProps {
  status: ServerStatus | null;
}

export const BackendDocs: React.FC<BackendDocsProps> = ({ status }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const userSchemaCode = `// server/models/User.ts
import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  role: 'student' | 'admin';
  department: string;
  semester: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'User name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['student', 'admin'],
      default: 'student',
      required: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
      min: 1,
      max: 8,
    },
  },
  { timestamps: true }
);

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);`;

  const resourceSchemaCode = `// server/models/Resource.ts
import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export const RESOURCE_CATEGORIES = ['PYQ', 'Lecture Notes', 'Lab Manual', 'Syllabus'] as const;
export type ResourceCategory = typeof RESOURCE_CATEGORIES[number];

export interface IResource extends Document {
  title: string;
  subjectCode?: string;
  semester: number;
  category: ResourceCategory;
  fileUrl: string;
  uploadedBy: Types.ObjectId;
  upvotes: number;
  createdAt: Date;
}

const ResourceSchema = new Schema<IResource>(
  {
    title: {
      type: String,
      required: [true, 'Resource title is required'],
      trim: true,
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
      min: 1,
      max: 8,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: RESOURCE_CATEGORIES,
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL link is required'],
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
      min: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Query optimization index for semester, subject, and category
ResourceSchema.index({ semester: 1, subjectCode: 1, category: 1 });

export const Resource: Model<IResource> =
  mongoose.models.Resource || mongoose.model<IResource>('Resource', ResourceSchema);`;

  const curlUpload = `curl -X POST http://localhost:3000/api/resources \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "Data Structures End-Sem 2024 (Solved)",
    "subjectCode": "CS201",
    "semester": 3,
    "category": "PYQ",
    "fileUrl": "https://arxiv.org/pdf/example-dsa-pyq-2024.pdf",
    "uploadedBy": "65f1a2b3c4d5e6f7a8b90001"
  }'`;

  const curlFilter = `curl -X GET "http://localhost:3000/api/resources?semester=3&category=PYQ&subjectCode=CS201"`;

  const curlUpvote = `curl -X PATCH http://localhost:3000/api/resources/65f1a2b3c4d5e6f7a8b9c001/upvote`;

  const curlAdminStats = `curl -X GET http://localhost:3000/api/admin/stats \\
  -H "x-admin-key: academia-admin-secret-2026"`;

  const curlAdminDelete = `curl -X DELETE http://localhost:3000/api/admin/resources/65f1a2b3c4d5e6f7a8b9c001 \\
  -H "x-admin-key: academia-admin-secret-2026"`;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Overview Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
              <h2 className="text-lg font-bold text-slate-900">
                Backend Architecture & Schemas Overview
              </h2>
            </div>
            <p className="text-xs text-slate-500 max-w-2xl">
              Node.js + Express backend with MongoDB object modeling via Mongoose.
              Features atomic upvotes, relational population between User and Resource,
              and compound indexed queries.
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 text-xs">
            <Database className="w-4 h-4 text-indigo-600 shrink-0" />
            <div>
              <div className="font-semibold text-slate-800">
                {status?.database.type || 'MongoDB via Mongoose'}
              </div>
              <div className="text-[11px] text-slate-500">
                Connection Status: {status?.database.connected ? 'Active Cluster' : 'Live / Preview Ready'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Schemas Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Schema */}
        <div className="bg-slate-900 text-slate-100 rounded-2xl p-5 shadow-sm border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold text-indigo-300">1. User Schema</span>
              <span className="text-[11px] text-slate-400 font-mono">models/User.ts</span>
            </div>
            <button
              onClick={() => copyToClipboard(userSchemaCode, 'userSchema')}
              className="flex items-center space-x-1 text-xs text-slate-400 hover:text-white transition"
            >
              {copiedKey === 'userSchema' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <pre className="text-[11px] font-mono leading-relaxed overflow-x-auto text-slate-300 max-h-[380px] p-2 bg-slate-950/60 rounded-lg">
            <code>{userSchemaCode}</code>
          </pre>
        </div>

        {/* Resource Schema */}
        <div className="bg-slate-900 text-slate-100 rounded-2xl p-5 shadow-sm border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-emerald-300">2. Resource / PYQ Schema</span>
              <span className="text-[11px] text-slate-400 font-mono">models/Resource.ts</span>
            </div>
            <button
              onClick={() => copyToClipboard(resourceSchemaCode, 'resourceSchema')}
              className="flex items-center space-x-1 text-xs text-slate-400 hover:text-white transition"
            >
              {copiedKey === 'resourceSchema' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <pre className="text-[11px] font-mono leading-relaxed overflow-x-auto text-slate-300 max-h-[380px] p-2 bg-slate-950/60 rounded-lg">
            <code>{resourceSchemaCode}</code>
          </pre>
        </div>
      </div>

      {/* Express Routes & Curl Examples */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center space-x-2 pb-4 border-b border-slate-100">
          <Terminal className="w-5 h-5 text-indigo-600" />
          <h3 className="font-bold text-slate-900 text-base">
            3. Express API Routes & Testing Curl Commands
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {/* Route 1: Upload */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-600 text-white font-mono">
                  POST
                </span>
                <span className="font-mono text-xs font-bold text-slate-800">
                  /api/resources
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Upload a resource metadata link
                </span>
              </div>
              <button
                onClick={() => copyToClipboard(curlUpload, 'curlUpload')}
                className="text-xs text-slate-500 hover:text-indigo-600 flex items-center space-x-1"
              >
                {copiedKey === 'curlUpload' ? (
                  <Check className="w-3 h-3 text-emerald-600" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
                <span>Copy Curl</span>
              </button>
            </div>
            <pre className="text-[11px] font-mono bg-slate-900 text-slate-200 p-3 rounded-lg overflow-x-auto">
              <code>{curlUpload}</code>
            </pre>
          </div>

          {/* Route 2: Filter */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-sky-600 text-white font-mono">
                  GET
                </span>
                <span className="font-mono text-xs font-bold text-slate-800">
                  /api/resources?semester=3&category=PYQ&subjectCode=CS201
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Fetch resources with query filters
                </span>
              </div>
              <button
                onClick={() => copyToClipboard(curlFilter, 'curlFilter')}
                className="text-xs text-slate-500 hover:text-indigo-600 flex items-center space-x-1"
              >
                {copiedKey === 'curlFilter' ? (
                  <Check className="w-3 h-3 text-emerald-600" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
                <span>Copy Curl</span>
              </button>
            </div>
            <pre className="text-[11px] font-mono bg-slate-900 text-slate-200 p-3 rounded-lg overflow-x-auto">
              <code>{curlFilter}</code>
            </pre>
          </div>

          {/* Route 3: Upvote */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-600 text-white font-mono">
                  PATCH
                </span>
                <span className="font-mono text-xs font-bold text-slate-800">
                  /api/resources/:id/upvote
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Atomically upvote a resource via $inc
                </span>
              </div>
              <button
                onClick={() => copyToClipboard(curlUpvote, 'curlUpvote')}
                className="text-xs text-slate-500 hover:text-indigo-600 flex items-center space-x-1"
              >
                {copiedKey === 'curlUpvote' ? (
                  <Check className="w-3 h-3 text-emerald-600" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
                <span>Copy Curl</span>
              </button>
            </div>
            <pre className="text-[11px] font-mono bg-slate-900 text-slate-200 p-3 rounded-lg overflow-x-auto">
              <code>{curlUpvote}</code>
            </pre>
          </div>

          {/* Route 4: Admin Stats */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-indigo-600 text-white font-mono">
                  GET
                </span>
                <span className="font-mono text-xs font-bold text-slate-800">
                  /api/admin/stats
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Fetch administrative metrics (Requires x-admin-key)
                </span>
              </div>
              <button
                onClick={() => copyToClipboard(curlAdminStats, 'curlAdminStats')}
                className="text-xs text-slate-500 hover:text-indigo-600 flex items-center space-x-1"
              >
                {copiedKey === 'curlAdminStats' ? (
                  <Check className="w-3 h-3 text-emerald-600" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
                <span>Copy Curl</span>
              </button>
            </div>
            <pre className="text-[11px] font-mono bg-slate-900 text-slate-200 p-3 rounded-lg overflow-x-auto">
              <code>{curlAdminStats}</code>
            </pre>
          </div>

          {/* Route 5: Admin Delete Resource */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-rose-600 text-white font-mono">
                  DELETE
                </span>
                <span className="font-mono text-xs font-bold text-slate-800">
                  /api/admin/resources/:id
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Delete/moderate obsolete resource & cleanup file (Requires x-admin-key)
                </span>
              </div>
              <button
                onClick={() => copyToClipboard(curlAdminDelete, 'curlAdminDelete')}
                className="text-xs text-slate-500 hover:text-indigo-600 flex items-center space-x-1"
              >
                {copiedKey === 'curlAdminDelete' ? (
                  <Check className="w-3 h-3 text-emerald-600" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
                <span>Copy Curl</span>
              </button>
            </div>
            <pre className="text-[11px] font-mono bg-slate-900 text-slate-200 p-3 rounded-lg overflow-x-auto">
              <code>{curlAdminDelete}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
