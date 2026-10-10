import React, { useState, useEffect, useCallback } from 'react';
import { Navbar, NavSection } from './components/Navbar.js';
import { SidebarDrawer } from './components/SidebarDrawer.js';
import { Dashboard } from './components/Dashboard.js';
import { ResourceBrowser } from './components/ResourceBrowser.js';
import { UploadForm } from './components/UploadForm.js';
import { AiStudyHelper } from './components/AiStudyHelper.js';
import { BackendDocs } from './components/BackendDocs.js';
import { AdminDashboard } from './components/AdminDashboard.js';
import { RoleSelectionModal } from './components/RoleSelectionModal.js';
import { UploadModal } from './components/UploadModal.js';
import { ResourceDoc, UserDoc, ServerStatus } from './types.js';
import {
  getResources,
  getUsers,
  getServerStatus,
  upvoteResource,
} from './services/api.js';
import {
  Sparkles,
  BookOpen,
  Database,
  GraduationCap,
  Layers,
  CheckCircle,
  Linkedin,
  Mail,
  ExternalLink,
} from 'lucide-react';

export default function App() {
  const [activeSection, setActiveSection] = useState<NavSection>('browse');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [resources, setResources] = useState<ResourceDoc[]>([]);
  const [users, setUsers] = useState<UserDoc[]>([]);
  const [status, setStatus] = useState<ServerStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Role-Based Access Control State
  const [userRole, setUserRole] = useState<'student' | 'admin' | null>(() => {
    const savedRole = sessionStorage.getItem('academia_user_role') as 'student' | 'admin' | null;
    const savedAdminKey = sessionStorage.getItem('academia_admin_key');
    if (savedRole === 'admin' && savedAdminKey) {
      return 'admin';
    }
    if (savedRole === 'student') {
      return 'student';
    }
    // Null on first visit to root URL so user is prompted with RoleSelectionModal
    return null;
  });

  const [adminKey, setAdminKey] = useState<string>(() => {
    return sessionStorage.getItem('academia_admin_key') || '';
  });

  // Modal is opened automatically on root visit if role is not chosen yet
  const [isRoleModalOpen, setIsRoleModalOpen] = useState<boolean>(() => {
    return !sessionStorage.getItem('academia_user_role');
  });

  const [roleModalInitialView, setRoleModalInitialView] = useState<'select' | 'admin-login'>('select');

  // Filters State
  const [search, setSearch] = useState('');
  const [branch, setBranch] = useState('');
  const [semester, setSemester] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [category, setCategory] = useState('');
  const [year, setYear] = useState('');
  const [courseType, setCourseType] = useState('');
  const [sort, setSort] = useState('latest');

  // Context for AI Assistant
  const [aiContextResource, setAiContextResource] = useState<ResourceDoc | null>(null);

  // Handle Student Role Selection
  const handleSelectStudent = () => {
    setUserRole('student');
    setAdminKey('');
    sessionStorage.setItem('academia_user_role', 'student');
    sessionStorage.removeItem('academia_admin_key');
    setIsRoleModalOpen(false);
    setActiveSection('browse');
  };

  // Handle Admin Role Authentication Success
  const handleAdminAuthenticated = (verifiedKey: string) => {
    setUserRole('admin');
    setAdminKey(verifiedKey);
    sessionStorage.setItem('academia_user_role', 'admin');
    sessionStorage.setItem('academia_admin_key', verifiedKey);
    setIsRoleModalOpen(false);
    setActiveSection('admin');
  };

  // Role Switcher Handlers
  const handleOpenRoleSwitcher = () => {
    setRoleModalInitialView('select');
    setIsRoleModalOpen(true);
  };

  const handleOpenAdminLogin = () => {
    setRoleModalInitialView('admin-login');
    setIsRoleModalOpen(true);
  };

  // Handle Logout (Clears all session/local credentials and returns user to role selection gate)
  const handleLogout = () => {
    setUserRole(null);
    setAdminKey('');
    sessionStorage.removeItem('academia_user_role');
    sessionStorage.removeItem('academia_admin_key');
    localStorage.removeItem('academia_admin_key');
    setActiveSection('browse');
    setRoleModalInitialView('select');
    setIsRoleModalOpen(true);
    setIsSidebarOpen(false);
  };

  // Fetch Server status
  const fetchStatus = async () => {
    try {
      const data = await getServerStatus();
      setStatus(data);
    } catch (e) {
      console.warn('Status endpoint error:', e);
    }
  };

  // Fetch Users
  const fetchUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (e) {
      console.warn('Users endpoint error:', e);
    }
  };

  // Fetch Resources with current filters
  const fetchResourcesData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getResources({
        branch,
        semester,
        subjectCode,
        category,
        sort,
        year,
        courseType,
      });
      setResources(data);
    } catch (err) {
      console.error('Error fetching resources:', err);
    } finally {
      setLoading(false);
    }
  }, [branch, semester, subjectCode, category, sort, year, courseType]);

  useEffect(() => {
    fetchStatus();
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchResourcesData();
  }, [fetchResourcesData]);

  // Handle Upvote action
  const handleUpvote = async (id: string) => {
    try {
      const updated = await upvoteResource(id);
      setResources((prev) =>
        prev.map((item) => (item._id === id ? updated : item))
      );
    } catch (err) {
      console.error('Error upvoting resource:', err);
      throw err;
    }
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearch('');
    setBranch('');
    setSemester('');
    setSubjectCode('');
    setCategory('');
    setYear('');
    setCourseType('');
    setSort('latest');
  };

  // Navigate from Dashboard to Browse or AI
  const handleDashboardNavigate = (
    section: 'browse' | 'upload' | 'ai-helper',
    filterParams?: { branch?: string; semester?: string; category?: string }
  ) => {
    if (filterParams?.branch !== undefined) {
      setBranch(filterParams.branch);
    }
    if (filterParams?.semester) {
      setSemester(filterParams.semester);
    }
    if (filterParams?.category) {
      setCategory(filterParams.category);
    }
    setActiveSection(section);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Pre-load AI Assistant with selected Resource
  const handleAskAi = (resource: ResourceDoc) => {
    setAiContextResource(resource);
    setActiveSection('ai-helper');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50/80 text-slate-900 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-800">
      {/* Slide-Out Sidebar Drawer */}
      <SidebarDrawer
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        userRole={userRole}
        onLogout={handleLogout}
        onOpenAdminLogin={handleOpenAdminLogin}
        branch={branch}
        setBranch={setBranch}
        category={category}
        setCategory={setCategory}
        status={status}
        totalResourcesCount={resources.length}
      />

      {/* Minimalist Top Application Navbar */}
      <Navbar
        onOpenSidebar={() => setIsSidebarOpen(true)}
        search={search}
        setSearch={setSearch}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        branch={branch}
        userRole={userRole}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeSection === 'dashboard' && (
          <Dashboard
            resources={resources}
            users={users}
            onNavigate={handleDashboardNavigate}
            onUpvote={handleUpvote}
            onAskAi={handleAskAi}
          />
        )}

        {activeSection === 'browse' && (
          <ResourceBrowser
            resources={resources}
            loading={loading}
            search={search}
            setSearch={setSearch}
            branch={branch}
            setBranch={setBranch}
            semester={semester}
            setSemester={setSemester}
            subjectCode={subjectCode}
            setSubjectCode={setSubjectCode}
            category={category}
            setCategory={setCategory}
            year={year}
            setYear={setYear}
            courseType={courseType}
            setCourseType={setCourseType}
            sort={sort}
            setSort={setSort}
            onReset={handleResetFilters}
            onUpvote={handleUpvote}
            onAskAi={handleAskAi}
            onOpenUpload={() => setActiveSection('upload')}
          />
        )}

        {activeSection === 'upload' && (
          <div className="space-y-6">
            <UploadForm
              users={users}
              onSuccess={() => {
                fetchResourcesData();
                setActiveSection('browse');
              }}
              onCancel={() => setActiveSection('browse')}
            />
          </div>
        )}

        {activeSection === 'ai-helper' && (
          <AiStudyHelper
            initialResource={aiContextResource}
            onClearContext={() => setAiContextResource(null)}
            onUpvote={handleUpvote}
          />
        )}

        {activeSection === 'docs' && (
          <BackendDocs status={status} />
        )}

        {activeSection === 'admin' && (
          <AdminDashboard
            adminKey={adminKey}
            onResourceDeleted={() => {
              fetchResourcesData();
              fetchStatus();
            }}
            onNavigateToUpload={() => setActiveSection('upload')}
            onPromptAdminKey={handleOpenAdminLogin}
            onReturnToStudent={() => {
              setUserRole('student');
              setActiveSection('dashboard');
            }}
          />
        )}
      </main>

      {/* Role Selection Gate / Switcher Modal */}
      <RoleSelectionModal
        isOpen={isRoleModalOpen}
        canDismiss={userRole !== null}
        onClose={userRole !== null ? () => setIsRoleModalOpen(false) : undefined}
        onSelectStudent={handleSelectStudent}
        onAdminAuthenticated={handleAdminAuthenticated}
        initialView={roleModalInitialView}
      />

      {/* Global Quick Upload Modal (if triggered from anywhere) */}
      <UploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          fetchResourcesData();
        }}
        users={users}
      />

      {/* Modern Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 mt-16 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-800 text-sm tracking-tight">AcademiaPYQ</span>
              <p className="text-[11px] text-slate-400">
                Academic Resource & Previous Year Question Repository for College Students
              </p>
            </div>
          </div>

          <div
            id="creator-attribution"
            className="flex flex-col sm:flex-row items-center sm:items-center gap-3.5 text-slate-700 text-xs text-center sm:text-left"
          >
            <div className="flex flex-wrap items-center justify-center gap-1.5 text-slate-600">
              <span className="text-slate-400 font-medium">Created by</span>
              <span className="font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/80">
                Anurag Dewangan
              </span>
              <span className="text-slate-300 mx-1 hidden sm:inline">•</span>
              <span className="text-slate-400 font-medium">Team:</span>
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-medium border border-indigo-100 text-[11px]">
                  Sudeeshna
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-medium border border-indigo-100 text-[11px]">
                  Abhinav Kanwar
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-medium border border-indigo-100 text-[11px]">
                  Dimple Stylee
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-medium border border-indigo-100 text-[11px]">
                  Pavani Yadav
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                id="author-linkedin-link"
                href="https://www.linkedin.com/in/anurag-dewangan-builds"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium transition border border-blue-200 text-xs shadow-2xs"
                title="Connect with Anurag Dewangan on LinkedIn"
              >
                <Linkedin className="w-3.5 h-3.5 fill-current" />
                <span>LinkedIn</span>
                <ExternalLink className="w-3 h-3 opacity-70" />
              </a>

              <a
                id="author-email-link"
                href="mailto:anuragdewangan06@gmail.com"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium transition border border-slate-200 text-xs"
                title="Contact Anurag Dewangan via Email"
              >
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>Contact</span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
