import React from 'react';
import {
  X,
  Search,
  LayoutDashboard,
  Sparkles,
  Upload,
  Terminal,
  ShieldCheck,
  LogOut,
  GraduationCap,
  Lock,
  Cpu,
  BrainCircuit,
  Radio,
  Layers,
  Database,
  ChevronRight,
  BookOpen,
  FileQuestion,
  FlaskConical,
} from 'lucide-react';
import { NavSection } from './Navbar.js';
import { ServerStatus } from '../types.js';

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeSection: NavSection;
  setActiveSection: (section: NavSection) => void;
  userRole: 'student' | 'admin' | null;
  onLogout: () => void;
  onOpenAdminLogin: () => void;
  branch: string;
  setBranch: (branch: string) => void;
  category: string;
  setCategory: (cat: string) => void;
  status: ServerStatus | null;
  totalResourcesCount?: number;
}

export const SidebarDrawer: React.FC<SidebarDrawerProps> = ({
  isOpen,
  onClose,
  activeSection,
  setActiveSection,
  userRole,
  onLogout,
  onOpenAdminLogin,
  branch,
  setBranch,
  category,
  setCategory,
  status,
  totalResourcesCount = 0,
}) => {
  if (!isOpen) return null;

  const handleNav = (section: NavSection) => {
    setActiveSection(section);
    onClose();
  };

  const handleBranchSelect = (selectedBranch: string) => {
    setBranch(selectedBranch);
    setActiveSection('browse');
    onClose();
  };

  const branches = [
    { id: '', label: 'All Branches', icon: Layers, countLabel: 'All' },
    { id: 'CSE', label: 'Computer Science (CSE)', icon: Cpu, badgeColor: 'bg-blue-50 text-blue-700 border-blue-200' },
    { id: 'DSAI', label: 'Data Science & AI (DSAI)', icon: BrainCircuit, badgeColor: 'bg-purple-50 text-purple-700 border-purple-200' },
    { id: 'ECE', label: 'Electronics & Comm (ECE)', icon: Radio, badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop overlay */}
      <div
        id="sidebar-backdrop"
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
      />

      {/* Drawer panel */}
      <aside
        id="sidebar-drawer-panel"
        className="fixed inset-y-0 left-0 max-w-xs w-full bg-white shadow-2xl z-50 flex flex-col justify-between border-r border-slate-200 transition-transform transform animate-in slide-in-from-left duration-250"
      >
        {/* Top Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-slate-900 text-base tracking-tight leading-none">
                AcademiaPYQ
              </h2>
              <span className="text-[10px] font-semibold text-slate-400">
                Menu & Department Hub
              </span>
            </div>
          </div>

          <button
            id="sidebar-close-btn"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
            title="Close menu"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Nav & Filters Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* User Role Card */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  userRole === 'admin'
                    ? 'bg-purple-600 text-white'
                    : 'bg-indigo-600 text-white'
                }`}
              >
                {userRole === 'admin' ? (
                  <ShieldCheck className="w-4 h-4" />
                ) : (
                  <GraduationCap className="w-4 h-4" />
                )}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">
                  {userRole === 'admin' ? 'Admin / Staff' : 'Student Mode'}
                </div>
                <div className="text-[10px] text-slate-500">
                  {userRole === 'admin' ? 'Full moderation rights' : 'Free repository access'}
                </div>
              </div>
            </div>

            {userRole === 'student' && (
              <button
                id="sidebar-admin-login-btn"
                onClick={() => {
                  onClose();
                  onOpenAdminLogin();
                }}
                className="text-[10px] font-bold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-2 py-1 rounded-lg border border-purple-200 transition shrink-0"
              >
                Admin 🔒
              </button>
            )}
          </div>

          {/* Department / Branch Filters */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <span>Filter By Branch</span>
              <span className="text-[10px] text-indigo-600 font-semibold">Instant Filter</span>
            </div>

            <div className="space-y-1">
              {branches.map((b) => {
                const Icon = b.icon;
                const isSelected = (branch === '' && b.id === '') || branch === b.id;
                return (
                  <button
                    key={b.id || 'all'}
                    id={`sidebar-branch-${b.id || 'all'}`}
                    onClick={() => handleBranchSelect(b.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                      isSelected
                        ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200/80 shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Icon
                        className={`w-4 h-4 ${
                          isSelected ? 'text-indigo-600' : 'text-slate-400'
                        }`}
                      />
                      <span>{b.label}</span>
                    </div>
                    {isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-1.5">
            <div className="px-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <span>Navigation</span>
            </div>

            <div className="space-y-1">
              {/* Browse Resources */}
              <button
                id="sidebar-nav-browse"
                onClick={() => handleNav('browse')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                  activeSection === 'browse'
                    ? 'bg-indigo-600 text-white font-bold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Search className="w-4 h-4" />
                  <span>Browse Notes & PYQs</span>
                </div>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    activeSection === 'browse'
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {totalResourcesCount}
                </span>
              </button>

              {/* AI Study Assistant */}
              <button
                id="sidebar-nav-ai"
                onClick={() => handleNav('ai-helper')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                  activeSection === 'ai-helper'
                    ? 'bg-indigo-600 text-white font-bold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>AI Study Assistant</span>
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                  Gemini
                </span>
              </button>

              {/* Upload PYQ / Note */}
              <button
                id="sidebar-nav-upload"
                onClick={() => handleNav('upload')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                  activeSection === 'upload'
                    ? 'bg-indigo-600 text-white font-bold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Upload className="w-4 h-4" />
                  <span>Upload Resource</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Dashboard Overview */}
              <button
                id="sidebar-nav-dashboard"
                onClick={() => handleNav('dashboard')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                  activeSection === 'dashboard'
                    ? 'bg-indigo-600 text-white font-bold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Statistics & Analytics</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Admin Panel */}
              {userRole === 'admin' ? (
                <button
                  id="sidebar-nav-admin"
                  onClick={() => handleNav('admin')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                    activeSection === 'admin'
                      ? 'bg-purple-700 text-white font-bold shadow-xs'
                      : 'text-purple-700 hover:bg-purple-50'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Admin Control Panel</span>
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-800">
                    Moderator
                  </span>
                </button>
              ) : (
                <button
                  id="sidebar-nav-admin-prompt"
                  onClick={() => {
                    onClose();
                    onOpenAdminLogin();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 transition"
                >
                  <div className="flex items-center space-x-2.5">
                    <Lock className="w-4 h-4 text-slate-400" />
                    <span>Admin Panel</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">Unlock 🔒</span>
                </button>
              )}

              {/* API Documentation */}
              <button
                id="sidebar-nav-docs"
                onClick={() => handleNav('docs')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                  activeSection === 'docs'
                    ? 'bg-indigo-600 text-white font-bold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Terminal className="w-4 h-4" />
                  <span>API Docs & Schemas</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Drawer Footer: Server Health & Prominent Logout */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/80 space-y-2.5">
          {/* Status pill */}
          <div className="flex items-center justify-between px-2 text-[11px] text-slate-500">
            <span className="flex items-center space-x-1.5">
              <span
                className={`inline-block h-2 w-2 rounded-full ${
                  status?.database.connected ? 'bg-emerald-500' : 'bg-amber-400'
                }`}
              />
              <span>{status?.database.connected ? 'MongoDB Connected' : 'In-Memory DB'}</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">v1.0.0</span>
          </div>

          {/* Dedicated Logout Option */}
          <button
            id="sidebar-logout-btn"
            onClick={() => {
              onClose();
              onLogout();
            }}
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-rose-700 border border-rose-200 text-xs font-bold transition shadow-2xs"
            title="Logout from session and return to role selection gate"
          >
            <LogOut className="w-4 h-4 text-rose-600" />
            <span>Logout & Switch Role</span>
          </button>
        </div>
      </aside>
    </div>
  );
};
