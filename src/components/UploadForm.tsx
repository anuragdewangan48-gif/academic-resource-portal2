import React, { useState, useRef } from 'react';
import {
  Upload,
  UploadCloud,
  Link as LinkIcon,
  FileText,
  CheckCircle2,
  AlertCircle,
  FolderUp,
  X,
  Sparkles,
  Cpu,
  BrainCircuit,
  Radio,
  Layers,
  FileArchive,
  RefreshCw,
  FileUp,
} from 'lucide-react';
import { ResourceCategory, CourseType, UserDoc, UploadResourcePayload, AcademicBranch } from '../types.js';
import { createResource } from '../services/api.js';

interface UploadFormProps {
  users: UserDoc[];
  onSuccess: () => void;
  onCancel?: () => void;
}

const CATEGORIES: ResourceCategory[] = ['PYQ', 'Lecture Notes', 'Lab Manual', 'Syllabus'];
const COURSE_TYPES: CourseType[] = [
  'Core Theory',
  'Professional Elective',
  'Open Elective',
  'Practical / Lab',
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 10 }, (_, i) => CURRENT_YEAR - i);
const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt', 'zip', 'rar', 'odt', 'html'];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB max

export const UploadForm: React.FC<UploadFormProps> = ({ users, onSuccess, onCancel }) => {
  const [title, setTitle] = useState('');
  const [branch, setBranch] = useState<AcademicBranch>('CSE');
  const [subjectName, setSubjectName] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [semester, setSemester] = useState<number>(3);
  const [courseType, setCourseType] = useState<CourseType>('Core Theory');
  const [year, setYear] = useState<number>(CURRENT_YEAR);
  const [category, setCategory] = useState<ResourceCategory>('PYQ');
  const [uploadMode, setUploadMode] = useState<'file' | 'link'>('file');
  const [fileUrl, setFileUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState('');
  const [contributorName, setContributorName] = useState('Anurag Dewangan');
  const [uploadedBy, setUploadedBy] = useState<string>(
    users.length > 0 ? users[0]._id : ''
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileBadgeDetails = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    if (ext === 'pdf') {
      return { tag: 'PDF', bg: 'bg-rose-50 border-rose-200 text-rose-700', badge: 'bg-rose-100 text-rose-800' };
    }
    if (['doc', 'docx'].includes(ext)) {
      return { tag: 'DOCX', bg: 'bg-blue-50 border-blue-200 text-blue-700', badge: 'bg-blue-100 text-blue-800' };
    }
    if (['ppt', 'pptx'].includes(ext)) {
      return { tag: 'PPTX', bg: 'bg-amber-50 border-amber-200 text-amber-700', badge: 'bg-amber-100 text-amber-800' };
    }
    if (['zip', 'rar', '7z'].includes(ext)) {
      return { tag: 'ZIP', bg: 'bg-purple-50 border-purple-200 text-purple-700', badge: 'bg-purple-100 text-purple-800' };
    }
    return { tag: ext.toUpperCase() || 'FILE', bg: 'bg-indigo-50 border-indigo-200 text-indigo-700', badge: 'bg-indigo-100 text-indigo-800' };
  };

  const validateAndSelectFile = (file: File): boolean => {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setError(`Unsupported file format (.${ext}). Allowed formats: PDF, DOCX, PPTX, TXT, ZIP.`);
      return false;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError(`File exceeds maximum size of 50 MB (your file is ${(file.size / (1024 * 1024)).toFixed(1)} MB).`);
      return false;
    }

    setError(null);
    setSelectedFile(file);
    setFileUrl('');

    // If title is currently blank, smartly populate from file name
    if (!title.trim()) {
      const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      const cleanTitle = baseName.replace(/[-_]/g, ' ').replace(/\s+/g, ' ').trim();
      setTitle(cleanTitle);
    }
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSelectFile(e.target.files[0]);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      validateAndSelectFile(file);
    }
  };

  const handleRemoveFile = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedFile(null);
    setUploadProgress(0);
    setUploadStage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    // Form validation
    if (!title.trim()) {
      setError('Please provide a descriptive resource title.');
      return;
    }
    if (uploadMode === 'link' && !fileUrl.trim()) {
      setError('Please provide a valid file link or storage URL.');
      return;
    }
    if (uploadMode === 'file' && !selectedFile) {
      setError('Please drag & drop or select a file to upload.');
      return;
    }

    setLoading(true);
    setUploadProgress(10);
    setUploadStage('Preparing upload payload...');

    try {
      const finalTitle = subjectName.trim()
        ? `${title.trim()} (${subjectName.trim()})`
        : title.trim();

      if (uploadMode === 'file' && selectedFile) {
        // Send multipart form data with real file attached and progress listener
        const formData = new FormData();
        formData.append('title', finalTitle);
        formData.append('branch', branch);
        if (subjectCode.trim()) formData.append('subjectCode', subjectCode.trim().toUpperCase());
        formData.append('semester', String(semester));
        formData.append('category', category);
        formData.append('courseType', courseType);
        formData.append('year', String(year));
        formData.append('file', selectedFile);
        if (uploadedBy) formData.append('uploadedBy', uploadedBy);
        if (contributorName.trim()) formData.append('contributorName', contributorName.trim());

        await createResource(formData, (percent) => {
          setUploadProgress(percent);
          if (percent < 40) {
            setUploadStage(`Uploading document file (${percent}%)...`);
          } else if (percent < 85) {
            setUploadStage(`Writing file to academic storage vault (${percent}%)...`);
          } else if (percent < 100) {
            setUploadStage('Syncing metadata in database...');
          } else {
            setUploadStage('Verifying file integrity...');
          }
        });
      } else {
        // Send JSON payload with external link
        const payload: UploadResourcePayload = {
          title: finalTitle,
          branch,
          subjectCode: subjectCode.trim() ? subjectCode.trim().toUpperCase() : undefined,
          semester: Number(semester),
          category,
          courseType,
          year: Number(year),
          fileUrl: fileUrl.trim(),
          uploadedBy: uploadedBy || (users[0] ? users[0]._id : undefined),
          contributorName: contributorName.trim() || undefined,
        };

        await createResource(payload);
      }

      setUploadProgress(100);
      setUploadStage('Upload verified!');
      setSuccessMsg('Academic resource successfully uploaded and available for students!');
      setTimeout(() => {
        onSuccess();
      }, 900);
    } catch (err: any) {
      setError(err.message || 'Failed to upload resource. Please check server connection.');
      setUploadProgress(0);
      setUploadStage('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 max-w-3xl mx-auto">
      <div className="flex items-start justify-between pb-5 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-2">
            <FolderUp className="w-3.5 h-3.5" />
            <span>Academic Contribution</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Upload PYQ or Study Material
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Share exam question papers, verified lecture notes, or lab manuals with fellow students.
          </p>
        </div>
        {onCancel && (
          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {error && (
        <div className="mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-2.5 text-xs text-rose-800">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="mt-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start space-x-2.5 text-xs text-emerald-800">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 pt-5">
        {/* 1. Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-1">
            Resource Title <span className="text-rose-500">*</span>
          </label>
          <input
            id="resource-title-input"
            type="text"
            required
            placeholder="e.g. End-Sem Solved Exam Paper with Marking Scheme"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition"
          />
        </div>

        {/* 2. Academic Branch Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-1">
            Academic Branch / Department <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
            {[
              { id: 'CSE' as AcademicBranch, label: 'CSE', desc: 'Computer Science', icon: Cpu },
              { id: 'DSAI' as AcademicBranch, label: 'DSAI', desc: 'Data Science & AI', icon: BrainCircuit },
              { id: 'ECE' as AcademicBranch, label: 'ECE', desc: 'Electronics & Comm.', icon: Radio },
              { id: 'General' as AcademicBranch, label: 'General', desc: 'Common / First Year', icon: Layers },
            ].map((item) => {
              const Icon = item.icon;
              const isSelected = branch === item.id;
              return (
                <button
                  key={item.id}
                  id={`upload-branch-btn-${item.id}`}
                  type="button"
                  onClick={() => setBranch(item.id)}
                  className={`flex items-center space-x-2 p-2 rounded-xl border text-left transition ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs font-bold">{item.label}</div>
                    <div className={`text-[10px] truncate ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                      {item.desc}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Subject Code & Subject Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Subject Code <span className="text-xs font-normal text-slate-400">(Optional)</span>
            </label>
            <input
              id="resource-subject-code-input"
              type="text"
              placeholder="e.g. CS201, EC301, MA102 (Optional)"
              value={subjectCode}
              onChange={(e) => setSubjectCode(e.target.value.toUpperCase())}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold uppercase text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Subject Full Name (Optional)
            </label>
            <input
              id="resource-subject-name-input"
              type="text"
              placeholder="e.g. Data Structures & Algorithms"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition"
            />
          </div>
        </div>

        {/* 3. Semester, Course Type, and Year */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Semester <span className="text-rose-500">*</span>
            </label>
            <select
              id="resource-semester-select"
              value={semester}
              onChange={(e) => setSemester(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={s}>
                  Semester {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Course Type <span className="text-rose-500">*</span>
            </label>
            <select
              id="resource-coursetype-select"
              value={courseType}
              onChange={(e) => setCourseType(e.target.value as CourseType)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition"
            >
              {COURSE_TYPES.map((ct) => (
                <option key={ct} value={ct}>
                  {ct}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Year of Examination / Material <span className="text-rose-500">*</span>
            </label>
            <select
              id="resource-year-select"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition"
            >
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 4. Category & Uploader */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Resource Category <span className="text-rose-500">*</span>
            </label>
            <select
              id="resource-category-select"
              value={category}
              onChange={(e) => setCategory(e.target.value as ResourceCategory)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Contributor Name
            </label>
            {users.length > 0 ? (
              <select
                id="resource-uploader-select"
                value={uploadedBy}
                onChange={(e) => setUploadedBy(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition"
              >
                {users.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name} ({u.role} - {u.department || 'Student'})
                  </option>
                ))}
              </select>
            ) : (
              <input
                id="resource-contributor-name-input"
                type="text"
                placeholder="e.g. Anurag Dewangan"
                value={contributorName}
                onChange={(e) => setContributorName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition"
              />
            )}
          </div>
        </div>

        {/* 5. File / Link Upload Section */}
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-slate-800">
              Study Material File / Link <span className="text-rose-500">*</span>
            </label>
            <div className="inline-flex rounded-lg bg-slate-100 p-0.5 text-xs font-medium">
              <button
                type="button"
                id="upload-mode-file-btn"
                onClick={() => setUploadMode('file')}
                className={`px-3 py-1 rounded-md transition ${
                  uploadMode === 'file'
                    ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Upload File
              </button>
              <button
                type="button"
                id="upload-mode-link-btn"
                onClick={() => setUploadMode('link')}
                className={`px-3 py-1 rounded-md transition ${
                  uploadMode === 'link'
                    ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Direct Link
              </button>
            </div>
          </div>

          {uploadMode === 'link' ? (
            <div>
              <div className="relative">
                <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  id="resource-link-input"
                  type="url"
                  placeholder="https://drive.google.com/file/... or https://arxiv.org/..."
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Provide a shareable Google Drive, GitHub, Notion, or cloud document link.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Hidden Native File Input */}
              <input
                ref={fileInputRef}
                id="resource-file-input"
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.zip,.rar,.odt,.html"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* Drag-and-Drop Zone */}
              {!selectedFile ? (
                <div
                  id="drag-and-drop-zone"
                  onDragEnter={handleDragEnter}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label="Upload file by drag and drop or clicking to browse"
                  className={`border-2 border-dashed rounded-2xl p-7 flex flex-col items-center justify-center cursor-pointer transition-all duration-150 text-center select-none ${
                    isDragging
                      ? 'border-indigo-500 bg-indigo-50/80 ring-4 ring-indigo-500/10 scale-[1.01]'
                      : 'border-slate-200 hover:border-indigo-400 bg-slate-50/50 hover:bg-indigo-50/20'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-transform ${
                      isDragging ? 'bg-indigo-600 text-white scale-110' : 'bg-indigo-100 text-indigo-600'
                    }`}
                  >
                    <UploadCloud className="w-6 h-6" />
                  </div>

                  <p className="text-sm font-semibold text-slate-900 mb-1">
                    {isDragging ? (
                      <span className="text-indigo-600 font-bold">Drop your file right here!</span>
                    ) : (
                      <>
                        Drag & drop your study notes or PYQ files here, or{' '}
                        <span className="text-indigo-600 hover:underline">browse files</span>
                      </>
                    )}
                  </p>

                  <p className="text-xs text-slate-500 mb-3">
                    Supports high-resolution semester papers, lecture slides, and manuals
                  </p>

                  <div className="flex items-center gap-1.5 flex-wrap justify-center">
                    {['PDF', 'DOCX', 'PPTX', 'TXT', 'ZIP'].map((fmt) => (
                      <span
                        key={fmt}
                        className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-white text-slate-600 border border-slate-200 shadow-2xs"
                      >
                        {fmt}
                      </span>
                    ))}
                    <span className="text-[11px] text-slate-400 font-medium ml-1">
                      (Max 50MB)
                    </span>
                  </div>
                </div>
              ) : (
                /* Selected File Preview Card */
                <div
                  id="selected-file-card"
                  className="bg-slate-50/90 border border-slate-200 rounded-2xl p-4 transition"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center space-x-3 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center border font-bold text-xs shrink-0 ${
                          getFileBadgeDetails(selectedFile.name).bg
                        }`}
                      >
                        {getFileBadgeDetails(selectedFile.name).tag}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <p
                            className="text-xs sm:text-sm font-bold text-slate-900 truncate"
                            title={selectedFile.name}
                          >
                            {selectedFile.name}
                          </p>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.2 rounded shrink-0 ${
                              getFileBadgeDetails(selectedFile.name).badge
                            }`}
                          >
                            {getFileBadgeDetails(selectedFile.name).tag}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2 text-xs text-slate-500 mt-0.5">
                          <span className="font-medium text-slate-700">
                            {formatFileSize(selectedFile.size)}
                          </span>
                          <span>•</span>
                          <span className="inline-flex items-center space-x-1 text-emerald-700 font-medium">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Ready to upload</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* File Controls */}
                    <div className="flex items-center space-x-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={loading}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 transition"
                        title="Choose a different file"
                      >
                        Replace
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        disabled={loading}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        title="Remove selected file"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Real-time Upload Progress Bar */}
                  {loading && (
                    <div className="mt-3 pt-3 border-t border-slate-200/80 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-indigo-700 flex items-center space-x-1.5">
                          <RefreshCw className="w-3 h-3 animate-spin text-indigo-600" />
                          <span>{uploadStage || 'Uploading document...'}</span>
                        </span>
                        <span className="font-mono font-bold text-indigo-900">
                          {uploadProgress}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 rounded-full transition-all duration-200 ease-out"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition rounded-xl"
            >
              Cancel
            </button>
          )}
          <button
            id="submit-resource-btn"
            type="submit"
            disabled={loading}
            className="flex items-center space-x-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm transition disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            <span>{loading ? 'Uploading Resource...' : 'Submit Resource'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
