import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  Trash2,
  ExternalLink,
  Download,
  Search,
  Filter,
  RefreshCw,
  FileQuestion,
  BookOpen,
  FlaskConical,
  ThumbsUp,
  AlertTriangle,
  CheckCircle2,
  Key,
  Database,
  Layers,
  Calendar,
  X,
  RotateCcw,
  Clock,
  Sparkles,
  FileText,
  Lock,
  ArrowRight,
  LogOut,
} from 'lucide-react';
import { ResourceDoc, AdminStats, ResourceCategory } from '../types.js';
import {
  getAdminStats,
  getAdminResources,
  deleteAdminResource,
  resetAdminSeeds,
  DEFAULT_ADMIN_KEY,
  getResourceFileUrl,
} from '../services/api.js';

interface AdminDashboardProps {
  adminKey?: string;
  onResourceDeleted?: () => void;
  onNavigateToUpload?: () => void;
  onPromptAdminKey?: () => void;
  onReturnToStudent?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  adminKey: propAdminKey,
  onResourceDeleted,
  onNavigateToUpload,
  onPromptAdminKey,
  onReturnToStudent,
}) => {
  // Authentication & Settings State
  const [adminKey, setAdminKey] = useState<string>(() => {
    return propAdminKey || localStorage.getItem('academia_admin_key') || '';
  });
  const [isKeyEditorOpen, setIsKeyEditorOpen] = useState(false);
  const [tempKeyInput, setTempKeyInput] = useState(adminKey);

  useEffect(() => {
    if (propAdminKey !== undefined && propAdminKey !== adminKey) {
      setAdminKey(propAdminKey);
      setTempKeyInput(propAdminKey);
    }
  }, [propAdminKey]);

  // Data State
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [resources, setResources] = useState<ResourceDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Filter & Search Controls
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSemester, setSelectedSemester] = useState<string>('all');

  // Deletion Confirmation Modal State
  const [resourceToDelete, setResourceToDelete] = useState<ResourceDoc | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch Dashboard Stats & Resources
  const loadDashboardData = useCallback(async () => {
    if (!adminKey) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [statsData, resourcesData] = await Promise.all([
        getAdminStats(adminKey),
        getAdminResources(undefined, adminKey),
      ]);
      setStats(statsData);
      setResources(resourcesData);
    } catch (err: any) {
      console.error('Admin fetch error:', err);
      setError(err.message || 'Failed to authenticate admin session. Please verify your Admin Secret Key.');
    } finally {
      setLoading(false);
    }
  }, [adminKey]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Handle Save Admin Key
  const handleSaveKey = () => {
    const trimmed = tempKeyInput.trim();
    if (!trimmed) return;
    setAdminKey(trimmed);
    localStorage.setItem('academia_admin_key', trimmed);
    setIsKeyEditorOpen(false);
    setNotification({
      type: 'success',
      message: 'Admin Secret Key updated. Refreshing secure session...',
    });
  };

  // Handle Delete Resource
  const confirmDelete = async () => {
    if (!resourceToDelete) return;
    const targetId = resourceToDelete._id;
    const targetTitle = resourceToDelete.title;

    setDeletingId(targetId);
    setActionLoading(true);
    try {
      await deleteAdminResource(targetId, adminKey);

      // Optimistic state updates
      setResources((prev) => prev.filter((r) => r._id !== targetId));
      if (stats) {
        setStats((prev) =>
          prev
            ? {
                ...prev,
                totalResources: Math.max(0, prev.totalResources - 1),
                totalPYQs:
                  resourceToDelete.category === 'PYQ' ? Math.max(0, prev.totalPYQs - 1) : prev.totalPYQs,
                totalLectureNotes:
                  resourceToDelete.category === 'Lecture Notes'
                    ? Math.max(0, prev.totalLectureNotes - 1)
                    : prev.totalLectureNotes,
                totalLabManuals:
                  resourceToDelete.category === 'Lab Manual'
                    ? Math.max(0, prev.totalLabManuals - 1)
                    : prev.totalLabManuals,
                totalUpvotes: Math.max(0, prev.totalUpvotes - (resourceToDelete.upvotes || 0)),
              }
            : null
        );
      }

      setNotification({
        type: 'success',
        message: `Resource "${targetTitle}" has been permanently removed from the portal.`,
      });
      setResourceToDelete(null);

      // Notify parent app to re-sync public browse data
      if (onResourceDeleted) {
        onResourceDeleted();
      }
    } catch (err: any) {
      console.error('Failed to delete resource:', err);
      setNotification({
        type: 'error',
        message: err.message || 'Error occurred while attempting to delete resource.',
      });
    } finally {
      setDeletingId(null);
      setActionLoading(false);
    }
  };

  // Handle Restore Default Demonstration Seeds
  const handleResetSeeds = async () => {
    if (!window.confirm('Reset sample academic materials and examination PYQs to their default initial state?')) {
      return;
    }

    setActionLoading(true);
    try {
      const res = await resetAdminSeeds(adminKey);
      setNotification({
        type: 'success',
        message: res.message || 'Default academic materials successfully restored.',
      });
      await loadDashboardData();
      if (onResourceDeleted) onResourceDeleted();
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.message || 'Failed to restore default seeds.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Filter Resources based on client filters
  const filteredResources = resources.filter((item) => {
    const matchesSearch =
      !searchQuery ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      (item.branch && item.branch.toLowerCase().includes(searchQuery.toLowerCase().trim())) ||
      (item.subjectCode && item.subjectCode.toLowerCase().includes(searchQuery.toLowerCase().trim())) ||
      (item.courseType && item.courseType.toLowerCase().includes(searchQuery.toLowerCase().trim()));

    const matchesBranch =
      selectedBranch === 'all' ||
      (item.branch && item.branch.toUpperCase() === selectedBranch.toUpperCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSemester =
      selectedSemester === 'all' || String(item.semester) === selectedSemester;

    return matchesSearch && matchesBranch && matchesCategory && matchesSemester;
  });

  // Branch Badge Helper
  const renderBranchBadge = (branch?: string) => {
    switch (branch) {
      case 'CSE':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            CSE
          </span>
        );
      case 'DSAI':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
            DSAI
          </span>
        );
      case 'ECE':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            ECE
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            {branch || 'General'}
          </span>
        );
    }
  };

  // Category Badge Helper
  const renderCategoryBadge = (cat: ResourceCategory) => {
    switch (cat) {
      case 'PYQ':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <FileQuestion className="w-3 h-3" />
            <span>Past Year Paper (PYQ)</span>
          </span>
        );
      case 'Lecture Notes':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <BookOpen className="w-3 h-3" />
            <span>Lecture Notes</span>
          </span>
        );
      case 'Lab Manual':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <FlaskConical className="w-3 h-3" />
            <span>Lab Manual / Experiment</span>
          </span>
        );
      case 'Syllabus':
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <FileText className="w-3 h-3" />
            <span>{cat}</span>
          </span>
        );
    }
  };

  // If unauthenticated or no admin key provided, display locked access gate
  if (!adminKey) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-3xl border border-slate-200 shadow-xl text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto shadow-inner">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Admin Control Panel Locked
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Unauthorized users cannot access administrative moderation tools. Please authenticate using the valid server <code className="text-purple-700 font-mono font-semibold">ADMIN_SECRET_KEY</code>.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
          {onPromptAdminKey && (
            <button
              id="admin-dashboard-unlock-btn"
              onClick={onPromptAdminKey}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold shadow-md shadow-purple-200 transition flex items-center justify-center space-x-2"
            >
              <Key className="w-3.5 h-3.5" />
              <span>Enter Admin Key 🔒</span>
            </button>
          )}
          {onReturnToStudent && (
            <button
              onClick={onReturnToStudent}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition"
            >
              Return to Student View
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner / Security Context */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-100 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  Academic Portal Administration
                </h1>
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Authenticated</span>
                </span>
              </div>
              <p className="text-slate-500 text-xs mt-1">
                Manage uploaded previous year questions, lecture notes, and lab manuals. Delete obsolete or spam documents and review live repository metrics.
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              id="admin-refresh-btn"
              onClick={() => loadDashboardData()}
              disabled={loading}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition disabled:opacity-50"
              title="Reload administrative metrics and resource list"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              id="admin-key-modal-btn"
              onClick={() => {
                setTempKeyInput(adminKey);
                setIsKeyEditorOpen(true);
              }}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition"
              title="Configure or inspect Admin Secret Key"
            >
              <Key className="w-3.5 h-3.5" />
              <span>Admin Key</span>
            </button>

            <button
              id="admin-reset-seeds-btn"
              onClick={handleResetSeeds}
              disabled={actionLoading}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition disabled:opacity-50"
              title="Restore standard demonstration PYQs and course notes"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restore Default Seeds</span>
            </button>

            {onReturnToStudent && (
              <button
                id="admin-exit-to-student-btn"
                onClick={onReturnToStudent}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition"
                title="Switch back to Student View"
              >
                <LogOut className="w-3.5 h-3.5 text-slate-500" />
                <span>Exit to Student</span>
              </button>
            )}
          </div>
        </div>

        {/* Key Editor Drawer */}
        {isKeyEditorOpen && (
          <div className="mt-4 pt-4 border-t border-slate-100 animate-in fade-in duration-200">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Key className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-bold text-slate-800">
                    Admin Authorization Secret Key
                  </span>
                </div>
                <button
                  onClick={() => setIsKeyEditorOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mb-3">
                All requests to <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono text-[10px]">/api/admin/*</code> routes require this key in the <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono text-[10px]">x-admin-key</code> header.
              </p>
              <div className="flex items-center gap-2">
                <input
                  id="admin-secret-key-input"
                  type="password"
                  value={tempKeyInput}
                  onChange={(e) => setTempKeyInput(e.target.value)}
                  placeholder="Enter admin secret key..."
                  className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  id="admin-save-key-btn"
                  onClick={handleSaveKey}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition"
                >
                  Apply Key
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Dynamic Toast / Notification */}
      {notification && (
        <div
          id="admin-toast-notification"
          className={`flex items-center justify-between p-4 rounded-xl border text-xs font-medium animate-in slide-in-from-top-2 duration-200 ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <div className="flex items-center space-x-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div
          id="admin-error-banner"
          className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-xs text-rose-800 flex items-start space-x-3"
        >
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-rose-900">Authorization Error</p>
            <p className="mt-0.5">{error}</p>
            <p className="mt-2 text-[11px] text-rose-700">
              Ensure you have provided the key configured in your backend (<code className="font-mono font-bold">{DEFAULT_ADMIN_KEY}</code> by default). Click "Admin Key" above to update your local key.
            </p>
          </div>
        </div>
      )}

      {/* Stats Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: PYQ Papers */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 border border-purple-100">
            <FileQuestion className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total PYQs
            </span>
            <div className="flex items-baseline space-x-2 mt-0.5">
              <span className="text-2xl font-black text-slate-900">
                {loading ? '...' : stats?.totalPYQs || 0}
              </span>
              <span className="text-[11px] text-purple-600 font-medium">Exam Papers</span>
            </div>
          </div>
        </div>

        {/* Card 2: Lecture Notes */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-100">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Lecture Notes
            </span>
            <div className="flex items-baseline space-x-2 mt-0.5">
              <span className="text-2xl font-black text-slate-900">
                {loading ? '...' : stats?.totalLectureNotes || 0}
              </span>
              <span className="text-[11px] text-blue-600 font-medium">Study Guides</span>
            </div>
          </div>
        </div>

        {/* Card 3: Lab Manuals */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-100">
            <FlaskConical className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Lab Manuals
            </span>
            <div className="flex items-baseline space-x-2 mt-0.5">
              <span className="text-2xl font-black text-slate-900">
                {loading ? '...' : stats?.totalLabManuals || 0}
              </span>
              <span className="text-[11px] text-amber-600 font-medium">Practicals</span>
            </div>
          </div>
        </div>

        {/* Card 4: Total Student Upvotes */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center shrink-0 border border-rose-100">
            <ThumbsUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Upvotes
            </span>
            <div className="flex items-baseline space-x-2 mt-0.5">
              <span className="text-2xl font-black text-slate-900">
                {loading ? '...' : stats?.totalUpvotes || 0}
              </span>
              <span className="text-[11px] text-rose-600 font-medium">Student Endorsements</span>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Meta Bar & Branch Breakdown */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <span>
                Total Materials in Vault:{' '}
                <strong className="text-slate-900">{stats?.totalResources || resources.length}</strong>
              </span>
            </div>
            <span className="text-slate-300">•</span>
            <div className="flex items-center space-x-1.5">
              <Database className="w-3.5 h-3.5 text-slate-400" />
              <span>
                Storage Engine:{' '}
                <strong className="text-slate-900">{stats?.storageEngine || 'Active'}</strong>
              </span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400">
            Last Synced: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
        </div>

        {/* Branch Distribution Chips */}
        {stats?.branchDistribution && (
          <div className="pt-2 border-t border-slate-100 flex items-center space-x-2 text-xs flex-wrap gap-y-1.5">
            <span className="text-[11px] font-semibold text-slate-500">Branch Distribution:</span>
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 text-[11px] font-bold border border-blue-200">
              <span>CSE:</span>
              <span>{stats.branchDistribution.CSE || 0}</span>
            </span>
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-800 text-[11px] font-bold border border-purple-200">
              <span>DSAI:</span>
              <span>{stats.branchDistribution.DSAI || 0}</span>
            </span>
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200">
              <span>ECE:</span>
              <span>{stats.branchDistribution.ECE || 0}</span>
            </span>
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold border border-slate-200">
              <span>General:</span>
              <span>{stats.branchDistribution.General || 0}</span>
            </span>
          </div>
        )}
      </div>

      {/* Resource Management Table / List Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Controls Header */}
        <div className="p-5 border-b border-slate-200 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Resource Moderation Table</h2>
              <p className="text-xs text-slate-500">
                Review, filter by branch, open, download, or delete uploaded files and documents.
              </p>
            </div>

            {/* Quick Count Badge */}
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                Showing {filteredResources.length} of {resources.length} materials
              </span>
            </div>
          </div>

          {/* Filter / Search Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
            {/* Search */}
            <div className="sm:col-span-5 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="admin-search-input"
                type="text"
                placeholder="Search by title, subject code, or topic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Branch Filter */}
            <div className="sm:col-span-3">
              <select
                id="admin-branch-filter"
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition font-medium"
              >
                <option value="all">All Branches</option>
                <option value="CSE">CSE (Computer Science)</option>
                <option value="DSAI">DSAI (Data Science & AI)</option>
                <option value="ECE">ECE (Electronics & Comm.)</option>
                <option value="General">General / Common</option>
              </select>
            </div>

            {/* Category Filter */}
            <div className="sm:col-span-2">
              <select
                id="admin-category-filter"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              >
                <option value="all">All Categories</option>
                <option value="PYQ">Previous Year Questions (PYQ)</option>
                <option value="Lecture Notes">Lecture Notes</option>
                <option value="Lab Manual">Lab Manuals</option>
                <option value="Syllabus">Syllabus</option>
              </select>
            </div>

            {/* Semester Filter */}
            <div className="sm:col-span-2">
              <select
                id="admin-semester-filter"
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              >
                <option value="all">All Semesters</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={String(s)}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Resources Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
              <p className="text-xs font-medium text-slate-600">Loading resources for administrator...</p>
            </div>
          ) : filteredResources.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No resources match your filters</p>
              <p className="text-xs text-slate-400 mt-1">
                Try resetting your search query, branch selection, or category.
              </p>
              {(searchQuery || selectedBranch !== 'all' || selectedCategory !== 'all' || selectedSemester !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedBranch('all');
                    setSelectedCategory('all');
                    setSelectedSemester('all');
                  }}
                  className="mt-3 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition"
                >
                  Reset Filters
                </button>
              )}
            </div>
          ) : (
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="px-5 py-3.5">Resource Title & Info</th>
                  <th className="px-3 py-3.5">Branch</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-3 py-3.5">Semester</th>
                  <th className="px-4 py-3.5">Course Type</th>
                  <th className="px-3 py-3.5">Upvotes</th>
                  <th className="px-4 py-3.5">Added Date</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredResources.map((res) => {
                  const uploaderName =
                    typeof res.uploadedBy === 'object' && res.uploadedBy !== null
                      ? res.uploadedBy.name
                      : 'Verified Contributor';

                  const viewUrl = getResourceFileUrl(res, 'view');
                  const downloadUrl = getResourceFileUrl(res, 'download');

                  return (
                    <tr
                      key={res._id}
                      id={`admin-resource-row-${res._id}`}
                      className="hover:bg-slate-50/70 transition group"
                    >
                      {/* Title & Uploader Info */}
                      <td className="px-5 py-4 max-w-sm">
                        <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition leading-snug">
                          {res.title}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 flex items-center space-x-2">
                          <span>By {uploaderName}</span>
                          {res.subjectCode && <span>• {res.subjectCode}</span>}
                          {res.year && <span>• Year {res.year}</span>}
                        </div>
                      </td>

                      {/* Branch */}
                      <td className="px-3 py-4 whitespace-nowrap">
                        {renderBranchBadge(res.branch)}
                      </td>

                      {/* Category */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        {renderCategoryBadge(res.category)}
                      </td>

                      {/* Semester */}
                      <td className="px-3 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                          Sem {res.semester}
                        </span>
                      </td>

                      {/* Course Type */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-slate-600 text-[11px] font-medium">
                          {res.courseType || 'Core Theory'}
                        </span>
                      </td>

                      {/* Upvotes */}
                      <td className="px-3 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-1 font-semibold text-slate-800">
                          <ThumbsUp className="w-3 h-3 text-indigo-500" />
                          <span>{res.upvotes || 0}</span>
                        </div>
                      </td>

                      {/* Added Date */}
                      <td className="px-4 py-4 whitespace-nowrap text-slate-400 text-[11px]">
                        {res.createdAt
                          ? new Date(res.createdAt).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : 'Recent'}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-1.5">
                          {/* Open File Link */}
                          <a
                            href={viewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                            title="Open document in browser"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>

                          {/* Download File Link */}
                          <a
                            href={downloadUrl}
                            download
                            className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                            title="Download document"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>

                          {/* Delete Action Button */}
                          <button
                            id={`delete-btn-${res._id}`}
                            onClick={() => setResourceToDelete(res)}
                            disabled={actionLoading && deletingId === res._id}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition border border-rose-100 hover:border-rose-200"
                            title="Delete or moderate this resource"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {resourceToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Delete Academic Resource?
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Are you sure you want to permanently delete this material? This action cannot be undone.
                </p>
              </div>
            </div>

            {/* Target Item Preview */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="font-semibold text-slate-900 line-clamp-2">
                {resourceToDelete.title}
              </div>
              <div className="text-[11px] text-slate-500 flex items-center space-x-2">
                <span>Semester {resourceToDelete.semester}</span>
                <span>•</span>
                <span>{resourceToDelete.category}</span>
                <span>•</span>
                <span>{resourceToDelete.upvotes || 0} Upvotes</span>
              </div>
            </div>

            {/* Modal Controls */}
            <div className="flex items-center justify-end space-x-2.5 pt-2">
              <button
                id="cancel-delete-modal-btn"
                onClick={() => setResourceToDelete(null)}
                disabled={actionLoading}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl border border-slate-200 transition"
              >
                Cancel
              </button>
              <button
                id="confirm-delete-modal-btn"
                onClick={confirmDelete}
                disabled={actionLoading}
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs transition disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{actionLoading ? 'Deleting...' : 'Delete Resource'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
