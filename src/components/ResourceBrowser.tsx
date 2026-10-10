import React, { useState, useMemo } from 'react';
import {
  FolderOpen,
  RefreshCw,
  LayoutGrid,
  List,
  Sparkles,
  ArrowUpDown,
  FileQuestion,
  BookOpen,
  Layers,
  Cpu,
  BrainCircuit,
  Radio,
  X,
  SlidersHorizontal,
} from 'lucide-react';
import { ResourceDoc } from '../types.js';
import { ResourceCard } from './ResourceCard.js';

interface ResourceBrowserProps {
  resources: ResourceDoc[];
  loading: boolean;
  search: string;
  setSearch: (val: string) => void;
  branch: string;
  setBranch: (val: string) => void;
  semester: string;
  setSemester: (val: string) => void;
  subjectCode?: string;
  setSubjectCode?: (val: string) => void;
  category: string;
  setCategory: (val: string) => void;
  year: string;
  setYear: (val: string) => void;
  courseType: string;
  setCourseType: (val: string) => void;
  sort: string;
  setSort: (val: string) => void;
  onReset: () => void;
  onUpvote: (id: string) => Promise<void>;
  onAskAi: (resource: ResourceDoc) => void;
  onOpenUpload: () => void;
}

export const ResourceBrowser: React.FC<ResourceBrowserProps> = ({
  resources,
  loading,
  search,
  setSearch,
  branch,
  setBranch,
  semester,
  setSemester,
  category,
  setCategory,
  sort,
  setSort,
  onReset,
  onUpvote,
  onAskAi,
  onOpenUpload,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Client-side filtering
  const filteredResources = useMemo(() => {
    let list = [...resources];

    if (branch && branch !== 'all') {
      list = list.filter((r) => r.branch && r.branch.toUpperCase() === branch.toUpperCase());
    }

    if (category) {
      list = list.filter((r) => r.category === category);
    }

    if (semester) {
      list = list.filter((r) => String(r.semester) === String(semester));
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          (r.subjectCode && r.subjectCode.toLowerCase().includes(q)) ||
          (r.branch && r.branch.toLowerCase().includes(q)) ||
          (r.courseType && r.courseType.toLowerCase().includes(q))
      );
    }

    if (sort === 'upvotes') {
      list.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
    } else if (sort === 'oldest') {
      list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return list;
  }, [resources, search, branch, category, semester, sort]);

  const branches = [
    { id: '', label: 'All Branches', icon: Layers },
    { id: 'CSE', label: 'CSE', icon: Cpu },
    { id: 'DSAI', label: 'DSAI', icon: BrainCircuit },
    { id: 'ECE', label: 'ECE', icon: Radio },
  ];

  const categories = [
    { id: '', label: 'All Types' },
    { id: 'PYQ', label: 'Past Papers (PYQs)' },
    { id: 'Lecture Notes', label: 'Lecture Notes' },
    { id: 'Lab Manual', label: 'Lab Manuals' },
  ];

  const semesters = ['1', '2', '3', '4', '5', '6', '7', '8'];

  const hasActiveFilters = Boolean(search || branch || category || semester || sort !== 'latest');

  return (
    <div className="space-y-6">
      {/* Streamlined Minimalist Control Strip */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-4">
        {/* Top Row: Branch Pills & View Toggles */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Department / Branch Selector Chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {branches.map((b) => {
              const Icon = b.icon;
              const isSelected = (branch === '' && b.id === '') || branch === b.id;
              return (
                <button
                  key={b.id || 'all'}
                  id={`filter-branch-${b.id || 'all'}`}
                  onClick={() => setBranch(b.id)}
                  className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-2xs font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{b.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right Controls: Sort & Grid/List View Mode */}
          <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto">
            <div className="flex items-center space-x-1.5 bg-slate-100 px-2.5 py-1 rounded-xl text-xs text-slate-600">
              <ArrowUpDown className="w-3 h-3 text-slate-400" />
              <select
                id="filter-sort-select"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                aria-label="Sort resources"
                className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="latest">Latest First</option>
                <option value="upvotes">Most Upvoted</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>

            <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200/60">
              <button
                id="view-mode-grid-btn"
                onClick={() => setViewMode('grid')}
                title="Grid View"
                aria-label="Grid View"
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'grid'
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                id="view-mode-list-btn"
                onClick={() => setViewMode('list')}
                title="List View"
                aria-label="List View"
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'list'
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Secondary Row: Category Tabs & Semester Filter */}
        <div className="pt-2 border-t border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {categories.map((c) => {
              const isSelected = (category === '' && c.id === '') || category === c.id;
              return (
                <button
                  key={c.id || 'all'}
                  id={`filter-cat-${c.id || 'all'}`}
                  onClick={() => setCategory(c.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                    isSelected
                      ? 'bg-slate-900 text-white font-bold'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  {c.label}
                </button>
              );
            })}
          </div>

          {/* Semester Chips & Reset */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-semibold text-slate-400 mr-1">Semester:</span>
            {semesters.map((sem) => {
              const isSelected = semester === sem;
              return (
                <button
                  key={sem}
                  id={`filter-sem-${sem}`}
                  onClick={() => setSemester(semester === sem ? '' : sem)}
                  className={`w-6 h-6 rounded-lg text-[11px] font-bold transition flex items-center justify-center ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {sem}
                </button>
              );
            })}

            {hasActiveFilters && (
              <button
                id="reset-all-filters-btn"
                onClick={onReset}
                className="ml-2 inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 transition"
                title="Clear all active filters"
              >
                <X className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Active Context / Search Banner if user searched */}
      {search.trim() && (
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-900">
          <div className="flex items-center space-x-2">
            <span>
              Search results for <strong className="font-bold">"{search}"</strong>
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-600">{filteredResources.length} items found</span>
          </div>
          <button
            onClick={() => setSearch('')}
            className="font-bold text-indigo-700 hover:text-indigo-950 underline text-[11px]"
          >
            Clear Search
          </button>
        </div>
      )}

      {/* Clean Grid Layout with Generous Spacing */}
      {loading ? (
        <div className="py-24 text-center bg-white rounded-3xl border border-slate-200/80 shadow-xs">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-700 font-bold">
            Loading verified academic materials...
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Querying previous year questions, notes, and lab manuals
          </p>
        </div>
      ) : filteredResources.length > 0 ? (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-3'
          }
        >
          {filteredResources.map((item) => (
            <ResourceCard
              key={item._id}
              resource={item}
              onUpvote={onUpvote}
              onAskAi={onAskAi}
              viewMode={viewMode}
            />
          ))}
        </div>
      ) : (
        /* Clean Empty State */
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs space-y-4 max-w-md mx-auto my-6">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-inner">
            <FolderOpen className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-slate-900">No Resources Found</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              No previous year questions or lecture notes match your active branch or search criteria.
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center space-x-2">
            <button
              onClick={onReset}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
            >
              Reset Filters
            </button>
            <button
              onClick={onOpenUpload}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs"
            >
              Upload Material
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
