import React from 'react';
import {
  BookOpen,
  FileCheck,
  TrendingUp,
  Sparkles,
  Upload,
  Search,
  ArrowRight,
  GraduationCap,
  Clock,
  Layers,
  Award,
  Zap,
  Cpu,
  BrainCircuit,
  Radio,
} from 'lucide-react';
import { ResourceDoc, UserDoc } from '../types.js';
import { ResourceCard } from './ResourceCard.js';

interface DashboardProps {
  resources: ResourceDoc[];
  users: UserDoc[];
  onNavigate: (
    section: 'browse' | 'upload' | 'ai-helper',
    filterParams?: { branch?: string; semester?: string; category?: string }
  ) => void;
  onUpvote: (id: string) => Promise<void>;
  onAskAi: (resource: ResourceDoc) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  resources,
  users,
  onNavigate,
  onUpvote,
  onAskAi,
}) => {
  // Compute key academic metrics
  const pyqCount = resources.filter((r) => r.category === 'PYQ').length;
  const notesCount = resources.filter((r) => r.category === 'Lecture Notes').length;
  const manualsCount = resources.filter((r) => r.category === 'Lab Manual').length;
  const totalUpvotes = resources.reduce((acc, curr) => acc + (curr.upvotes || 0), 0);

  // Branch-wise counts
  const cseCount = resources.filter((r) => r.branch === 'CSE').length;
  const dsaiCount = resources.filter((r) => r.branch === 'DSAI').length;
  const eceCount = resources.filter((r) => r.branch === 'ECE').length;

  // Top 3 trending / most upvoted resources
  const trendingResources = [...resources]
    .sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0))
    .slice(0, 3);

  // Recent uploads
  const recentResources = [...resources].slice(0, 3);

  return (
    <div className="space-y-8">
      {/* 1. College Student Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white p-6 sm:p-10 shadow-xl border border-indigo-800/40">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-400/30">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Academic Semester & Exam Hub</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Ace Your Semester Exams with Verified PYQs & Notes
          </h1>
          <p className="text-sm sm:text-base text-indigo-200/90 leading-relaxed">
            Instant access to previous year question papers, high-scoring classroom notes, and an AI study assistant powered by Gemini 3.8 Flash.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              id="dash-browse-btn"
              onClick={() => onNavigate('browse')}
              className="flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md transition transform active:scale-95"
            >
              <Search className="w-4 h-4" />
              <span>Browse All Resources</span>
            </button>
            <button
              id="dash-upload-btn"
              onClick={() => onNavigate('upload')}
              className="flex items-center space-x-2 px-5 py-2.5 bg-white/10 hover:bg-white/15 text-white text-xs sm:text-sm font-semibold rounded-xl border border-white/20 transition"
            >
              <Upload className="w-4 h-4" />
              <span>Upload PYQ / Notes</span>
            </button>
            <button
              id="dash-ai-btn"
              onClick={() => onNavigate('ai-helper')}
              className="flex items-center space-x-2 px-5 py-2.5 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200 text-xs sm:text-sm font-semibold rounded-xl border border-indigo-400/40 transition"
            >
              <Sparkles className="w-4 h-4 text-indigo-300" />
              <span>AI Exam Helper</span>
            </button>
          </div>
        </div>

        {/* Decorative background gradients */}
        <div className="absolute right-0 top-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 -mb-20 w-64 h-64 rounded-full bg-indigo-600/10 blur-2xl pointer-events-none" />
      </div>

      {/* 2. Key Academic Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{pyqCount}</div>
            <div className="text-xs text-slate-500 font-medium">Exam PYQs Available</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
            <FileCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{notesCount}</div>
            <div className="text-xs text-slate-500 font-medium">Lecture Notes</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{manualsCount}</div>
            <div className="text-xs text-slate-500 font-medium">Lab Manuals</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{totalUpvotes}</div>
            <div className="text-xs text-slate-500 font-medium">Helpful Upvotes</div>
          </div>
        </div>
      </div>

      {/* 2.5 Branch-Wise Bifurcated Portals (CSE, DSAI, ECE) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Branch-Wise Academic Material & PYQs
              </h2>
              <p className="text-xs text-slate-500">
                Dedicated archives curated specifically for CSE, DSAI, and ECE engineering streams
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('browse')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 self-start sm:self-auto"
          >
            Explore all branches →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {/* CSE Card */}
          <div
            id="branch-card-cse"
            onClick={() => onNavigate('browse', { branch: 'CSE' })}
            className="group relative cursor-pointer overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/70 via-white to-blue-50/30 p-5 hover:border-blue-300 hover:shadow-md transition duration-200"
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-100">
                <Cpu className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-100/80 text-blue-800 border border-blue-200">
                {cseCount} {cseCount === 1 ? 'Resource' : 'Resources'}
              </span>
            </div>
            <div className="mt-4 space-y-1">
              <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition">
                Computer Science & Engg. (CSE)
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Algorithms, Data Structures, Operating Systems, Computer Networks & Theory of Computation.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-blue-100/80 flex items-center justify-between text-xs font-semibold text-blue-700">
              <span>Browse CSE PYQs & Notes</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* DSAI Card */}
          <div
            id="branch-card-dsai"
            onClick={() => onNavigate('browse', { branch: 'DSAI' })}
            className="group relative cursor-pointer overflow-hidden rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50/70 via-white to-purple-50/30 p-5 hover:border-purple-300 hover:shadow-md transition duration-200"
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-100">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-100/80 text-purple-800 border border-purple-200">
                {dsaiCount} {dsaiCount === 1 ? 'Resource' : 'Resources'}
              </span>
            </div>
            <div className="mt-4 space-y-1">
              <h3 className="text-base font-bold text-slate-900 group-hover:text-purple-700 transition">
                Data Science & AI (DSAI)
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Machine Learning, Deep Learning, Big Data Analytics, Statistical Inference & NLP.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-purple-100/80 flex items-center justify-between text-xs font-semibold text-purple-700">
              <span>Browse DSAI PYQs & Notes</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* ECE Card */}
          <div
            id="branch-card-ece"
            onClick={() => onNavigate('browse', { branch: 'ECE' })}
            className="group relative cursor-pointer overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/70 via-white to-emerald-50/30 p-5 hover:border-emerald-300 hover:shadow-md transition duration-200"
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-100">
                <Radio className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100/80 text-emerald-800 border border-emerald-200">
                {eceCount} {eceCount === 1 ? 'Resource' : 'Resources'}
              </span>
            </div>
            <div className="mt-4 space-y-1">
              <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition">
                Electronics & Comm. (ECE)
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Digital Signal Processing, VLSI Design, Analog Circuits, Microprocessors & Embedded Systems.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-emerald-100/80 flex items-center justify-between text-xs font-semibold text-emerald-700">
              <span>Browse ECE PYQs & Notes</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Semester Quick Selectors (Sem 1 to Sem 8) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <GraduationCap className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Jump Directly to Your Semester
            </h2>
          </div>
          <span className="text-xs text-slate-500 hidden sm:inline font-medium">
            Curriculum B.Tech / Engineering (Sem 1 - 8)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => {
            const count = resources.filter((r) => r.semester === sem).length;
            return (
              <button
                key={sem}
                id={`sem-quick-btn-${sem}`}
                onClick={() => onNavigate('browse', { semester: String(sem) })}
                className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 transition group text-center"
              >
                <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-700">
                  Semester {sem}
                </span>
                <span className="text-[11px] text-slate-400 group-hover:text-indigo-600 font-medium mt-0.5">
                  {count} {count === 1 ? 'file' : 'files'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. AI Exam Assistant Quick Action Promo */}
      <div className="bg-gradient-to-r from-indigo-50 via-slate-50 to-purple-50 rounded-2xl p-6 border border-indigo-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Have an exam or tricky PYQ question coming up?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mt-0.5">
              Ask our Gemini 3.8 Flash Assistant to explain core proofs, solve numerical questions, or generate a 5-minute revision sheet.
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigate('ai-helper')}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition shrink-0 self-start md:self-auto"
        >
          <span>Try AI Study Assistant</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 5. Trending & Most Upvoted PYQs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Trending & Most Helpful PYQs
            </h2>
          </div>
          <button
            onClick={() => onNavigate('browse', { category: 'PYQ' })}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 inline-flex items-center space-x-1"
          >
            <span>View all PYQs</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {trendingResources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {trendingResources.map((res) => (
              <ResourceCard
                key={res._id}
                resource={res}
                onUpvote={onUpvote}
                onAskAi={onAskAi}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200/80 shadow-xs flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">No Trending PYQs Yet</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                As students upload and upvote previous year exam papers, the most helpful resources will appear here.
              </p>
            </div>
            <button
              onClick={() => onNavigate('upload')}
              className="mt-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition"
            >
              Upload First PYQ
            </button>
          </div>
        )}
      </div>

      {/* 6. Recent Uploads */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Recently Uploaded Academic Files
            </h2>
          </div>
          {recentResources.length > 0 && (
            <button
              onClick={() => onNavigate('browse')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 inline-flex items-center space-x-1"
            >
              <span>Browse all materials</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>

        {recentResources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {recentResources.map((res) => (
              <ResourceCard
                key={res._id}
                resource={res}
                onUpvote={onUpvote}
                onAskAi={onAskAi}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200/80 shadow-xs flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">No Recent Uploads</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Your repository is currently fresh and empty. Upload lecture notes, syllabi, or lab manuals to get started.
              </p>
            </div>
            <button
              onClick={() => onNavigate('upload')}
              className="mt-1 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs transition"
            >
              Contribute First Resource
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
