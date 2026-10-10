import React from 'react';
import { Filter, Search, RotateCcw, ArrowUpDown, Calendar, Layers, BookOpen, Cpu, BrainCircuit, Radio } from 'lucide-react';
import { ResourceCategory, CourseType, AcademicBranch, ACADEMIC_BRANCHES } from '../types.js';

interface ResourceFiltersProps {
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
  totalCount: number;
}

const CATEGORIES: ResourceCategory[] = ['PYQ', 'Lecture Notes', 'Lab Manual', 'Syllabus'];
const COURSE_TYPES: CourseType[] = [
  'Core Theory',
  'Professional Elective',
  'Open Elective',
  'Practical / Lab',
];
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 8 }, (_, i) => String(CURRENT_YEAR - i));

const BRANCH_TABS: Array<{ id: string; label: string; sub: string; icon: React.FC<{ className?: string }> }> = [
  { id: '', label: 'All Branches', sub: 'Cross-Department', icon: Layers },
  { id: 'CSE', label: 'CSE', sub: 'Computer Science', icon: Cpu },
  { id: 'DSAI', label: 'DSAI', sub: 'Data Science & AI', icon: BrainCircuit },
  { id: 'ECE', label: 'ECE', sub: 'Electronics & Comm.', icon: Radio },
];

export const ResourceFilters: React.FC<ResourceFiltersProps> = ({
  search,
  setSearch,
  branch,
  setBranch,
  semester,
  setSemester,
  category,
  setCategory,
  year,
  setYear,
  courseType,
  setCourseType,
  sort,
  setSort,
  onReset,
  totalCount,
}) => {
  const isFiltered = Boolean(
    search || (branch && branch !== 'all') || semester || category || year || courseType || sort !== 'latest'
  );

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
      {/* Top row: Title and reset button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
            <Filter className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Branch-Wise Academic Material & PYQs</h3>
            <p className="text-xs text-slate-500">
              Showing <span className="font-semibold text-slate-800">{totalCount}</span> verified academic files
              {branch && branch !== 'all' ? ` for ${branch}` : ' across all departments'}
            </p>
          </div>
        </div>

        {isFiltered && (
          <button
            id="reset-filters-btn"
            onClick={onReset}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-indigo-700 hover:bg-indigo-50 border border-slate-200 transition"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear Filters</span>
          </button>
        )}
      </div>

      {/* Prominent Branch Selection Tabs */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="font-semibold text-slate-700">Select Academic Branch / Department:</span>
          {branch && (
            <button
              onClick={() => setBranch('')}
              className="text-indigo-600 hover:text-indigo-800 text-[11px] font-medium"
            >
              Reset to all
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {BRANCH_TABS.map((tab) => {
            const isSelected = (branch === '' && tab.id === '') || branch.toUpperCase() === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                id={`branch-tab-${tab.id || 'all'}`}
                type="button"
                onClick={() => setBranch(tab.id)}
                className={`flex items-center space-x-2.5 p-2.5 rounded-xl border text-left transition ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-white text-slate-600 border border-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                    {tab.label}
                  </div>
                  <div className={`text-[10px] truncate ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                    {tab.sub}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        <input
          id="filter-search-input"
          type="text"
          placeholder="Search by title, subject code, or topic (e.g. Master Theorem, Neural Networks, DSP, CS201)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition"
        />
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-500 font-medium shrink-0">Category:</span>
        <button
          onClick={() => setCategory('')}
          className={`px-3 py-1 rounded-full border transition shrink-0 font-medium ${
            category === ''
              ? 'bg-slate-900 text-white border-slate-900'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          All Categories
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat === category ? '' : cat)}
            className={`px-3 py-1 rounded-full border transition shrink-0 font-medium ${
              category === cat
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid of Dropdown Selectors */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
        {/* Branch Dropdown */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
            Branch / Dept
          </label>
          <select
            id="filter-branch-select"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition"
          >
            <option value="">All Branches</option>
            <option value="CSE">CSE (Computer Science)</option>
            <option value="DSAI">DSAI (Data Science & AI)</option>
            <option value="ECE">ECE (Electronics & Comm.)</option>
            <option value="General">General / Common</option>
          </select>
        </div>

        {/* Semester */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
            Semester
          </label>
          <select
            id="filter-semester-select"
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition"
          >
            <option value="">All Semesters</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <option key={s} value={s}>
                Semester {s}
              </option>
            ))}
          </select>
        </div>

        {/* Year */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
            Exam Year
          </label>
          <select
            id="filter-year-select"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition"
          >
            <option value="">All Years</option>
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Order */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
            Sort Order
          </label>
          <select
            id="filter-sort-select"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition"
          >
            <option value="latest">Latest Uploaded</option>
            <option value="upvotes">Most Upvoted</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>
    </div>
  );
};
