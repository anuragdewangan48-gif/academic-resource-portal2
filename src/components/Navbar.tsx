import React from 'react';
import {
  Menu,
  Search,
  X,
  GraduationCap,
} from 'lucide-react';

export type NavSection = 'dashboard' | 'browse' | 'upload' | 'ai-helper' | 'docs' | 'admin';

interface NavbarProps {
  onOpenSidebar: () => void;
  search: string;
  setSearch: (search: string) => void;
  activeSection: NavSection;
  setActiveSection: (section: NavSection) => void;
  branch?: string;
  userRole?: 'student' | 'admin' | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSidebar,
  search,
  setSearch,
  activeSection,
  setActiveSection,
  branch,
  userRole,
}) => {
  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          {/* Left: Sidebar Hamburger Toggle & Brand Logo */}
          <div className="flex items-center shrink-0">
            <button
              id="sidebar-toggle-btn"
              onClick={onOpenSidebar}
              className="p-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition border border-slate-200/80 mr-2.5 sm:mr-3"
              title="Open Navigation Menu & Branch Filters"
              aria-label="Open Sidebar Menu"
            >
              <Menu className="w-5 h-5 text-slate-700" />
            </button>

            <div
              onClick={() => setActiveSection('browse')}
              className="flex items-center space-x-2.5 cursor-pointer select-none"
            >
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200 shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight">
                  AcademiaPYQ
                </span>
                {branch && branch !== 'all' && (
                  <span className="hidden sm:inline-flex px-2 py-0.5 text-[10px] font-bold rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {branch}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Center: Quick Search Bar */}
          <div className="flex-1 max-w-xl mx-2 sm:mx-4">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="navbar-quick-search-input"
                type="text"
                placeholder="Search notes, PYQs, subject code (e.g. CS201)..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  if (activeSection !== 'browse') {
                    setActiveSection('browse');
                  }
                }}
                className="w-full pl-9 pr-8 py-2 bg-slate-100 hover:bg-slate-150 focus:bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition"
              />
              {search && (
                <button
                  id="navbar-clear-search-btn"
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
                  title="Clear search"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Right: Clean Role Indicator */}
          <div className="flex items-center shrink-0">
            <span
              id="navbar-role-pill"
              className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${
                userRole === 'admin'
                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                  : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              {userRole === 'admin' ? 'Admin' : 'Student'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
