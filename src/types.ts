export type ResourceCategory = 'PYQ' | 'Lecture Notes' | 'Lab Manual' | 'Syllabus';

export type AcademicBranch = 'CSE' | 'DSAI' | 'ECE' | 'General';

export const ACADEMIC_BRANCHES: AcademicBranch[] = ['CSE', 'DSAI', 'ECE', 'General'];

export type CourseType = 'Core Theory' | 'Professional Elective' | 'Open Elective' | 'Practical / Lab';

export interface UserDoc {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  department: string;
  semester: number;
  createdAt?: string;
}

export interface ResourceDoc {
  _id: string;
  title: string;
  subjectCode?: string;
  semester: number;
  branch: AcademicBranch;
  category: ResourceCategory;
  courseType?: string;
  year?: number;
  fileUrl: string;
  uploadedBy: UserDoc | string;
  upvotes: number;
  createdAt: string;
  updatedAt?: string;
}

export interface ServerStatus {
  service: string;
  version: string;
  database: {
    connected: boolean;
    type: string;
    uriConfigured: boolean;
  };
  endpoints: Array<{
    method: string;
    path: string;
    description: string;
  }>;
}

export interface UploadResourcePayload {
  title: string;
  subjectCode?: string;
  semester: number;
  branch?: AcademicBranch;
  category: ResourceCategory;
  courseType: string;
  year: number;
  fileUrl: string;
  uploadedBy?: string;
  contributorName?: string;
}

export interface FilterParams {
  branch?: string;
  semester?: string | number;
  subjectCode?: string;
  category?: string;
  sort?: 'newest' | 'oldest' | 'upvotes';
}

export interface AiAskPayload {
  question: string;
  subjectCode?: string;
  topic?: string;
  semester?: number | string;
  branch?: AcademicBranch | string;
  mode?: 'explain' | 'pyq_predictor' | 'quick_revision';
}

export interface AiAskResponse {
  success: boolean;
  answer: string;
  model: string;
  matchingResources?: ResourceDoc[];
  suggestedFollowUps?: string[];
  message?: string;
}

export interface AdminStats {
  totalResources: number;
  totalPYQs: number;
  totalLectureNotes: number;
  totalLabManuals: number;
  totalSyllabus: number;
  totalUpvotes: number;
  totalUsers: number;
  semesterDistribution: Record<number, number>;
  branchDistribution?: Record<string, number>;
  storageEngine: string;
  uptime: number;
  timestamp: string;
}

