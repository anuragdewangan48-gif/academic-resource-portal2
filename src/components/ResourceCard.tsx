import React, { useState } from 'react';
import {
  FileText,
  ExternalLink,
  ThumbsUp,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  Bookmark,
  Check,
  Download,
} from 'lucide-react';
import { ResourceDoc, UserDoc } from '../types.js';
import { getResourceFileUrl } from '../services/api.js';

interface ResourceCardProps {
  resource: ResourceDoc;
  onUpvote: (id: string) => Promise<void>;
  onAskAi?: (resource: ResourceDoc) => void;
  viewMode?: 'grid' | 'list';
}

export const ResourceCard: React.FC<ResourceCardProps> = ({
  resource,
  onUpvote,
  onAskAi,
  viewMode = 'grid',
}) => {
  const [upvoting, setUpvoting] = useState(false);
  const [localUpvotes, setLocalUpvotes] = useState(resource.upvotes);
  const [copied, setCopied] = useState(false);

  const viewUrl = getResourceFileUrl(resource, 'view');
  const downloadUrl = getResourceFileUrl(resource, 'download');

  const handleUpvoteClick = async () => {
    if (upvoting) return;
    setUpvoting(true);
    setLocalUpvotes((prev) => prev + 1);
    try {
      await onUpvote(resource._id);
    } catch {
      setLocalUpvotes(resource.upvotes);
    } finally {
      setUpvoting(false);
    }
  };

  const handleCopyLink = () => {
    const fullUrl = viewUrl.startsWith('/') ? `${window.location.origin}${viewUrl}` : viewUrl;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getCategoryStyle = (cat: string) => {
    switch (cat) {
      case 'PYQ':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Lecture Notes':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 'Lab Manual':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Syllabus':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getBranchBadgeStyle = (branch?: string) => {
    switch (branch) {
      case 'CSE':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'DSAI':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'ECE':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const uploader: UserDoc | null =
    typeof resource.uploadedBy === 'object' && resource.uploadedBy !== null
      ? (resource.uploadedBy as UserDoc)
      : null;

  // List / Table-row view
  if (viewMode === 'list') {
    return (
      <div
        id={`resource-card-${resource._id}`}
        className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-200 transition duration-150 flex flex-col md:flex-row md:items-center md:justify-between gap-4 group"
      >
        {/* Core details: Branch, Category, Semester, Year, Title, Resource Type */}
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${getBranchBadgeStyle(
                resource.branch
              )}`}
            >
              {resource.branch || 'CSE'}
            </span>
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-md border ${getCategoryStyle(
                resource.category
              )}`}
            >
              {resource.category}
            </span>
            <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
              Sem {resource.semester}
            </span>
            {resource.year && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-slate-50 text-slate-600 border border-slate-200">
                {resource.year}
              </span>
            )}
            {resource.subjectCode && (
              <span className="text-[11px] font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                {resource.subjectCode}
              </span>
            )}
            {resource.courseType && (
              <span className="text-[11px] font-medium text-slate-500 bg-slate-50 border border-slate-200/60 px-2 py-0.5 rounded-md">
                {resource.courseType}
              </span>
            )}
          </div>

          <h3 className="text-sm sm:text-base font-semibold text-slate-900 leading-snug truncate group-hover:text-indigo-600 transition-colors">
            {resource.title}
          </h3>

          <div className="flex items-center space-x-2 text-[11px] text-slate-500">
            <span className="truncate">
              Uploaded by <span className="font-medium text-slate-700">{uploader ? uploader.name : 'Verified Student'}</span>
            </span>
            {resource.createdAt && (
              <>
                <span>•</span>
                <span>
                  {new Date(resource.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {onAskAi && (
            <button
              onClick={() => onAskAi(resource)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-indigo-700 bg-indigo-50/80 hover:bg-indigo-100 transition border border-indigo-200/60"
              title="Ask AI about this resource"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Ask AI</span>
            </button>
          )}

          <a
            id={`view-resource-${resource._id}`}
            href={viewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-xs"
            title="Open and read document in browser"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Open</span>
            <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
          </a>

          <a
            id={`download-resource-${resource._id}`}
            href={downloadUrl}
            download
            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition border border-slate-200"
            title="Download document file"
          >
            <Download className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={handleCopyLink}
            title="Copy resource URL"
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition border border-slate-200"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Bookmark className="w-3.5 h-3.5" />
            )}
          </button>

          <button
            id={`upvote-btn-${resource._id}`}
            onClick={handleUpvoteClick}
            disabled={upvoting}
            className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition border ${
              localUpvotes > 0
                ? 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
            title="Upvote resource"
          >
            <ThumbsUp
              className={`w-3.5 h-3.5 ${
                upvoting ? 'animate-bounce' : ''
              } ${localUpvotes > 0 ? 'fill-amber-600 text-amber-600' : ''}`}
            />
            <span>{localUpvotes}</span>
          </button>
        </div>
      </div>
    );
  }

  // Grid view (Default)
  return (
    <div
      id={`resource-card-${resource._id}`}
      className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-200 transition duration-200 flex flex-col justify-between space-y-4 group"
    >
      <div className="space-y-3">
        {/* Top Badges: Branch, Category, Year, Semester */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${getBranchBadgeStyle(
                resource.branch
              )}`}
            >
              {resource.branch || 'CSE'}
            </span>
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-md border ${getCategoryStyle(
                resource.category
              )}`}
            >
              {resource.category}
            </span>
            {resource.year && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-slate-50 text-slate-600 border border-slate-200">
                {resource.year}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-1">
            {resource.subjectCode && (
              <span className="text-[10px] font-mono font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                {resource.subjectCode}
              </span>
            )}
            <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
              Sem {resource.semester}
            </span>
          </div>
        </div>

        {/* Title & Resource Type */}
        <div>
          <h3 className="text-base font-semibold text-slate-900 leading-snug line-clamp-2 group-hover:text-indigo-600 transition-colors">
            {resource.title}
          </h3>
          {resource.courseType && (
            <p className="text-[11px] text-slate-500 mt-1 font-medium">
              {resource.courseType}
            </p>
          )}
        </div>

        {/* Uploader & Metadata */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <div className="flex items-center space-x-1.5 truncate">
            <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-slate-600">
              {uploader?.role === 'admin' ? (
                <ShieldCheck className="w-3 h-3 text-indigo-600" />
              ) : (
                <GraduationCap className="w-3 h-3 text-slate-600" />
              )}
            </div>
            <span className="font-medium text-slate-700 truncate">
              {uploader ? uploader.name : 'Verified Student'}
            </span>
          </div>

          {resource.createdAt && (
            <span className="text-[11px] text-slate-400 shrink-0">
              {new Date(resource.createdAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between gap-2">
          {/* View & Download Links */}
          <div className="flex items-center gap-1.5">
            <a
              id={`view-resource-${resource._id}`}
              href={viewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50/80 hover:bg-indigo-100 transition"
              title="Open and read document in browser"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Open</span>
              <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
            </a>

            <a
              id={`download-resource-${resource._id}`}
              href={downloadUrl}
              download
              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition border border-slate-200"
              title="Download document file"
            >
              <Download className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="flex items-center space-x-1.5">
            {/* Copy Link Button */}
            <button
              onClick={handleCopyLink}
              title="Copy resource URL"
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Bookmark className="w-3.5 h-3.5" />
              )}
            </button>

            {/* Upvote Button */}
            <button
              id={`upvote-btn-${resource._id}`}
              onClick={handleUpvoteClick}
              disabled={upvoting}
              className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition border ${
                localUpvotes > 0
                  ? 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
              title="Upvote resource"
            >
              <ThumbsUp
                className={`w-3.5 h-3.5 ${
                  upvoting ? 'animate-bounce' : ''
                } ${localUpvotes > 0 ? 'fill-amber-600 text-amber-600' : ''}`}
              />
              <span>{localUpvotes}</span>
            </button>
          </div>
        </div>

        {/* Ask AI Contextual Shortcut */}
        {onAskAi && (
          <button
            onClick={() => onAskAi(resource)}
            className="w-full flex items-center justify-center space-x-1.5 py-1.5 px-2.5 rounded-lg text-[11px] font-medium text-slate-600 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 transition border border-dashed border-slate-200 hover:border-indigo-200"
          >
            <Sparkles className="w-3 h-3 text-indigo-500" />
            <span>Ask AI to explain or solve questions from this</span>
          </button>
        )}
      </div>
    </div>
  );
};
