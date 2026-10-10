import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  BookOpen,
  Copy,
  Check,
  RotateCcw,
  Zap,
  HelpCircle,
  FileQuestion,
  Lightbulb,
  ExternalLink,
  ThumbsUp,
  FileText,
  AlertCircle,
  Trash2,
  Compass,
  Download,
} from 'lucide-react';
import Markdown from 'react-markdown';
import { askGeminiStudyHelper, upvoteResource, getResourceFileUrl } from '../services/api.js';
import { ResourceDoc } from '../types.js';

interface AiStudyHelperProps {
  initialResource?: ResourceDoc | null;
  onClearContext?: () => void;
  onUpvote?: (id: string) => Promise<void> | void;
}

type AssistantMode = 'explain' | 'pyq_predictor' | 'quick_revision';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
  mode?: AssistantMode;
  matchingResources?: ResourceDoc[];
  suggestedFollowUps?: string[];
  model?: string;
}

const PRESET_TOPICS = [
  {
    label: 'LRU Page Replacement',
    query: 'Explain LRU vs FIFO page replacement algorithm with frame allocation and page fault calculation.',
  },
  {
    label: 'Master Theorem',
    query: 'Explain Master Theorem for divide-and-conquer recurrences with 3 solved exam examples.',
  },
  {
    label: 'ACID in DBMS',
    query: 'Explain ACID properties in Database Management Systems with transaction concurrency examples.',
  },
  {
    label: 'Dijkstra Algorithm',
    query: 'Explain Dijkstra shortest path algorithm with dry run and time complexity using adjacency list.',
  },
  {
    label: 'Paging vs Segmentation',
    query: 'Compare Paging vs Segmentation in Operating Systems with address translation steps.',
  },
  {
    label: 'TCP vs UDP',
    query: 'Explain TCP 3-way handshake and compare TCP vs UDP header structure and reliability.',
  },
];

export const AiStudyHelper: React.FC<AiStudyHelperProps> = ({
  initialResource,
  onClearContext,
  onUpvote,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      text: `### Welcome to your Smart AI Concierge! 👋
Ask me any academic doubt, derivation, or topic you are preparing for exams. 

**What I do for you in one step:**
1. Provide a crisp, high-scoring university explanation with step-by-step points and exam tips.
2. **Instantly query our portal database** for matching Past Year Questions (PYQs), lecture notes, or lab manuals.
3. Attach direct, 1-click resource cards right here in the chat so you can start practicing immediately!`,
      timestamp: new Date(),
      suggestedFollowUps: [
        'Explain LRU page replacement with dry run',
        'Master Theorem solved recurrence examples',
        'ACID properties in DBMS transactions',
        'Dijkstra shortest path algorithm trace',
      ],
      matchingResources: [
        {
          _id: 'res-seed-1',
          title: 'Operating Systems End-Sem Solved PYQ 2024 (Paging, LRU, Deadlocks & Synchronization)',
          branch: 'CSE',
          semester: 5,
          category: 'PYQ',
          courseType: 'Core Theory',
          year: 2024,
          fileUrl: 'https://drive.google.com/file/d/1OS-EndSem-2024-Solved-PYQ/view',
          uploadedBy: 'Dr. Aris Thorne',
          upvotes: 42,
          createdAt: new Date().toISOString(),
        },
        {
          _id: 'res-seed-2',
          title: 'Master Theorem, Recurrence Relations & Asymptotic Complexity Cheat-Sheet',
          branch: 'CSE',
          semester: 3,
          category: 'Lecture Notes',
          courseType: 'Core Theory',
          year: 2024,
          fileUrl: 'https://drive.google.com/file/d/1Master-Theorem-Algorithms-Notes/view',
          uploadedBy: 'Rohan Sharma',
          upvotes: 38,
          createdAt: new Date().toISOString(),
        },
      ],
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [mode, setMode] = useState<AssistantMode>('explain');
  const [branchFilter, setBranchFilter] = useState<string>('');
  const [semesterFilter, setSemesterFilter] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeResource, setActiveResource] = useState<ResourceDoc | null>(initialResource || null);
  const [upvotingIds, setUpvotingIds] = useState<Set<string>>(new Set());

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Sync initial context resource if passed from another view
  useEffect(() => {
    if (initialResource) {
      setActiveResource(initialResource);
      const queryText = `Please provide a high-scoring exam revision guide and likely 10-mark PYQs for "${initialResource.title}" (Semester ${initialResource.semester}).`;
      sendMessage(queryText, initialResource);
    }
  }, [initialResource]);

  const sendMessage = async (textToSend: string, contextRes?: ResourceDoc | null) => {
    const trimmed = textToSend.trim();
    if (!trimmed || loading) return;

    setError(null);
    const userMsgId = `user-${Date.now()}`;
    const targetResource = contextRes || activeResource;

    const userMessage: ChatMessage = {
      id: userMsgId,
      role: 'user',
      text: trimmed,
      timestamp: new Date(),
      mode,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputQuery('');
    setLoading(true);

    try {
      const response = await askGeminiStudyHelper({
        question: trimmed,
        branch: (branchFilter as any) || (targetResource ? targetResource.branch : undefined),
        semester: semesterFilter || (targetResource ? targetResource.semester : undefined),
        mode,
      });

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        text: response.answer,
        timestamp: new Date(),
        mode,
        matchingResources: response.matchingResources || [],
        suggestedFollowUps: response.suggestedFollowUps || [],
        model: response.model,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      setError(err.message || 'Failed to generate academic response. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputQuery);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputQuery);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        text: 'Chat cleared. Ask me any doubt or exam topic to instantly fetch explanations and matching PYQs!',
        timestamp: new Date(),
        suggestedFollowUps: [
          'Dijkstra algorithm dry run',
          'Operating Systems Paging vs Segmentation',
          'DBMS 3NF vs BCNF Normalization',
        ],
      },
    ]);
  };

  const handleResourceUpvote = async (resId: string) => {
    if (upvotingIds.has(resId)) return;
    setUpvotingIds((prev) => new Set(prev).add(resId));

    try {
      if (onUpvote) {
        await onUpvote(resId);
      } else {
        await upvoteResource(resId);
      }

      // Locally update upvote counts across all chat messages
      setMessages((prevMessages) =>
        prevMessages.map((msg) => {
          if (!msg.matchingResources) return msg;
          const updated = msg.matchingResources.map((item) =>
            item._id === resId ? { ...item, upvotes: (item.upvotes || 0) + 1 } : item
          );
          return { ...msg, matchingResources: updated };
        })
      );
    } catch (err) {
      console.error('Failed to upvote resource:', err);
    } finally {
      setUpvotingIds((prev) => {
        const next = new Set(prev);
        next.delete(resId);
        return next;
      });
    }
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'PYQ':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Lecture Notes':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Lab Manual':
        return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'Syllabus':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Concierge Header Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                Smart AI Academic Concierge
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold text-[11px] border border-indigo-100">
                Direct Resource Fetcher
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Ask doubts & topics — answers come with direct 1-click PYQs and study files from the database.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Clear Chat */}
          <button
            id="clear-ai-chat-btn"
            type="button"
            onClick={handleClearChat}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition"
            title="Reset Chat Session"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Linked Resource Context Indicator (if navigated with context) */}
      {activeResource && (
        <div className="p-3.5 bg-indigo-50/80 border border-indigo-200/80 rounded-2xl flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2 truncate">
            <BookOpen className="w-4 h-4 text-indigo-600 shrink-0" />
            <span className="text-slate-600 font-medium">Context Active:</span>
            <span className="font-bold text-indigo-900 truncate">
              {activeResource.title} (Semester {activeResource.semester})
            </span>
          </div>
          <button
            onClick={() => {
              setActiveResource(null);
              if (onClearContext) onClearContext();
            }}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 shrink-0"
          >
            Clear Context
          </button>
        </div>
      )}

      {/* Chat Messages Log Area */}
      <div className="bg-slate-50/60 rounded-3xl p-4 sm:p-6 border border-slate-200/80 min-h-[460px] max-h-[640px] overflow-y-auto space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            {/* Message Bubble Container */}
            <div
              className={`max-w-[92%] sm:max-w-[85%] rounded-2xl ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white p-4 sm:p-5 rounded-br-xs shadow-xs'
                  : 'bg-white text-slate-900 p-5 sm:p-6 rounded-bl-xs border border-slate-200/90 shadow-xs'
              }`}
            >
              {/* Header inside assistant message */}
              {msg.role === 'assistant' && (
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center">
                      <Sparkles className="w-3 h-3" />
                    </div>
                    <span className="text-xs font-bold text-slate-800">
                      Academic Guide & Resource Matcher
                    </span>
                    {msg.model && (
                      <span className="text-[10px] text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                        {msg.model}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleCopy(msg.id, msg.text)}
                    className="flex items-center space-x-1 text-[11px] font-semibold text-slate-500 hover:text-indigo-600 transition"
                    title="Copy Answer"
                  >
                    {copiedId === msg.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Text Body */}
              <div
                className={`text-xs sm:text-sm leading-relaxed font-sans ${
                  msg.role === 'user'
                    ? 'text-white whitespace-pre-wrap font-medium'
                    : 'text-slate-800 prose prose-slate max-w-none'
                }`}
              >
                {msg.role === 'user' ? (
                  msg.text
                ) : (
                  <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-800 leading-relaxed font-sans">
                    <Markdown>{msg.text}</Markdown>
                  </div>
                )}
              </div>

              {/* DIRECT CLICKABLE RESOURCE CARDS (Requirement 1 & 2) */}
              {msg.role === 'assistant' &&
                msg.matchingResources &&
                msg.matchingResources.length > 0 && (
                  <div className="mt-5 pt-4 border-t border-slate-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5 text-xs font-bold text-indigo-950">
                        <BookOpen className="w-4 h-4 text-indigo-600" />
                        <span>Matching Portal Resources & PYQs ({msg.matchingResources.length})</span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium">
                        Click to access in 1 step
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-2.5">
                      {msg.matchingResources.map((res) => (
                        <div
                          key={res._id}
                          className="bg-slate-50/90 hover:bg-indigo-50/40 border border-slate-200/80 hover:border-indigo-200 rounded-xl p-3 sm:p-3.5 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                        >
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getCategoryBadgeClass(
                                  res.category
                                )}`}
                              >
                                {res.category}
                              </span>
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-200/70 text-slate-700">
                                Sem {res.semester}
                              </span>
                              {res.year && (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-200/70 text-slate-700">
                                  {res.year} Exam
                                </span>
                              )}
                              {res.courseType && (
                                <span className="text-[10px] text-slate-500 hidden md:inline">
                                  • {res.courseType}
                                </span>
                              )}
                            </div>

                            <h4 className="text-xs sm:text-sm font-semibold text-slate-900 group-hover:text-indigo-900 line-clamp-2 leading-snug">
                              {res.title}
                            </h4>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                            {/* Upvote Button inside Card */}
                            <button
                              type="button"
                              onClick={() => handleResourceUpvote(res._id)}
                              disabled={upvotingIds.has(res._id)}
                              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 shadow-2xs transition disabled:opacity-50"
                              title="Upvote this resource"
                            >
                              <ThumbsUp className="w-3.5 h-3.5 text-indigo-600" />
                              <span>{res.upvotes || 0}</span>
                            </button>

                            {/* Direct Open & Download Resource Buttons */}
                            <a
                              href={getResourceFileUrl(res, 'view')}
                              target="_blank"
                              rel="noreferrer noopener"
                              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition"
                              title="Open and read document in browser"
                            >
                              <span>Open</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>

                            <a
                              href={getResourceFileUrl(res, 'download')}
                              download
                              className="p-1.5 bg-white hover:bg-slate-100 text-slate-700 hover:text-indigo-600 rounded-lg text-xs font-semibold border border-slate-200 shadow-2xs transition"
                              title="Download document file"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Follow-Up Suggestions */}
              {msg.role === 'assistant' &&
                msg.suggestedFollowUps &&
                msg.suggestedFollowUps.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
                    <span className="text-[11px] font-semibold text-slate-500">
                      Explore Follow-Up Questions:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.suggestedFollowUps.map((promptText, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => sendMessage(promptText)}
                          className="px-2.5 py-1 rounded-lg bg-indigo-50/70 hover:bg-indigo-100 text-indigo-800 text-[11px] font-medium border border-indigo-200/60 transition text-left"
                        >
                          {promptText} →
                        </button>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </div>
        ))}

        {/* Loading Bubble */}
        {loading && (
          <div className="flex flex-col items-start space-y-2">
            <div className="bg-white text-slate-900 p-5 rounded-2xl rounded-bl-xs border border-slate-200 shadow-xs max-w-[85%] space-y-3">
              <div className="flex items-center space-x-2 text-xs font-bold text-indigo-600">
                <Sparkles className="w-4 h-4 animate-spin text-indigo-600" />
                <span>AI Concierge is analyzing concepts & fetching university resources...</span>
              </div>
              <div className="space-y-2 animate-pulse">
                <div className="h-3 bg-slate-200 rounded w-3/4"></div>
                <div className="h-3 bg-slate-200 rounded w-full"></div>
                <div className="h-3 bg-slate-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error notification if any */}
      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-center space-x-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Suggested Topic Chips (Zero Friction Discovery) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 px-1">
          <div className="flex items-center space-x-1">
            <Compass className="w-3.5 h-3.5 text-indigo-600" />
            <span>One-Click Exam Topics & PYQ Queries:</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {PRESET_TOPICS.map((topicItem, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => sendMessage(topicItem.query)}
              disabled={loading}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-xs font-medium border border-slate-200 shadow-2xs whitespace-nowrap transition disabled:opacity-50 shrink-0"
            >
              {topicItem.label}
            </button>
          ))}
        </div>
      </div>

      {/* Prompt Composer Box */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs space-y-3">
        {/* Controls Bar (Mode Selection & Semester Filter) */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-500 mr-1">Mode:</span>
            <button
              type="button"
              onClick={() => setMode('explain')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition border ${
                mode === 'explain'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Explain & Find PYQs
            </button>

            <button
              type="button"
              onClick={() => setMode('pyq_predictor')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition border ${
                mode === 'pyq_predictor'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Predict 10-Mark Question
            </button>

            <button
              type="button"
              onClick={() => setMode('quick_revision')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition border ${
                mode === 'quick_revision'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              5-Min Revision
            </button>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <label className="text-[11px] font-semibold text-slate-500">Branch:</label>
              <select
                id="ai-branch-filter"
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
              >
                <option value="">All Branches</option>
                <option value="CSE">CSE</option>
                <option value="DSAI">DSAI</option>
                <option value="ECE">ECE</option>
                <option value="General">General</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <label className="text-[11px] font-semibold text-slate-500">Filter Sem:</label>
              <select
                value={semesterFilter}
                onChange={(e) => setSemesterFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
              >
                <option value="">All Semesters</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                  <option key={sem} value={sem}>
                    Sem {sem}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleFormSubmit} className="relative">
          <textarea
            ref={textareaRef}
            id="ai-concierge-chat-input"
            rows={2}
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your exam doubt or topic (e.g. 'Dijkstra algorithm', 'Deadlocks in OS', 'ACID properties')..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 pr-24 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition resize-none"
          />

          <div className="absolute right-2.5 bottom-3">
            <button
              id="ai-concierge-send-btn"
              type="submit"
              disabled={loading || !inputQuery.trim()}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>{loading ? 'Searching...' : 'Send'}</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

        <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
          <span>Press Enter to send (Shift+Enter for new line)</span>
          <span>Instantly connects doubts to database resources</span>
        </div>
      </div>
    </div>
  );
};
