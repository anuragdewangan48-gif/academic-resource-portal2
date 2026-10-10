import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  ShieldCheck,
  Key,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  X,
  Sparkles,
  Cpu,
  BrainCircuit,
  Radio,
  Lock,
  ChevronRight,
  CheckCircle2,
  BookOpen,
  FileCheck,
  Shield,
  HelpCircle,
} from 'lucide-react';
import { verifyAdminKey, DEFAULT_ADMIN_KEY } from '../services/api.js';

interface RoleSelectionModalProps {
  isOpen: boolean;
  canDismiss?: boolean;
  onClose?: () => void;
  onSelectStudent: () => void;
  onAdminAuthenticated: (key: string) => void;
  initialView?: 'select' | 'admin-login';
}

export const RoleSelectionModal: React.FC<RoleSelectionModalProps> = ({
  isOpen,
  canDismiss = false,
  onClose,
  onSelectStudent,
  onAdminAuthenticated,
  initialView = 'select',
}) => {
  const [view, setView] = useState<'select' | 'admin-login'>(initialView);
  const [adminKeyInput, setAdminKeyInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Sync view when initialView or isOpen changes
  useEffect(() => {
    setView(initialView);
    setAuthError(null);
  }, [initialView, isOpen]);

  // Handle escape key to close if dismissible
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && canDismiss && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canDismiss, onClose]);

  if (!isOpen) return null;

  const handleAdminVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const keyToTest = adminKeyInput.trim();
    if (!keyToTest) {
      setAuthError('Please enter the Admin Secret Key to proceed.');
      return;
    }

    setIsVerifying(true);
    setAuthError(null);

    try {
      await verifyAdminKey(keyToTest);
      // Validated against backend environment variable
      onAdminAuthenticated(keyToTest);
      setView('select');
      setAdminKeyInput('');
    } catch (err: any) {
      setAuthError(err.message || 'Invalid Admin Secret Key. Access denied.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleUseDefaultKey = () => {
    setAdminKeyInput(DEFAULT_ADMIN_KEY);
    setAuthError(null);
  };

  return (
    <div
      id="role-selection-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/75 backdrop-blur-md overflow-y-auto transition-all animate-in fade-in duration-300"
    >
      <div
        id="role-selection-card"
        className="relative bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full overflow-hidden my-8 transition-all transform animate-in zoom-in-95 duration-200"
      >
        {/* Top Header Decorative Banner */}
        <div className="relative bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 px-6 sm:px-8 pt-7 pb-6 text-white border-b border-indigo-900/40">
          {/* Subtle Ambient Glows */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-44 h-44 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-10 -mb-8 w-36 h-36 bg-purple-500/15 rounded-full blur-2xl pointer-events-none" />

          {/* Dismiss button if modal can be dismissed */}
          {canDismiss && onClose && (
            <button
              id="role-modal-close-btn"
              onClick={onClose}
              className="absolute top-5 right-5 text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-xl transition border border-white/10"
              title="Close and return"
              aria-label="Close role selection modal"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-[11px] font-semibold border border-indigo-400/20">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>AcademiaPYQ • University Resource Hub</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {view === 'select' ? 'Choose Your Portal Access' : 'Admin Security Verification'}
            </h2>

            <p className="text-xs sm:text-[13px] text-slate-300 leading-relaxed max-w-md">
              {view === 'select'
                ? 'Select your role to access semester examination question papers, lecture notes, or administrative management tools.'
                : 'Enter the server Admin Secret Key to access repository moderation, delete resources, and inspect system telemetry.'}
            </p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7 space-y-4">
          {view === 'select' ? (
            <div className="space-y-4">
              {/* Option 1: Student Role Card */}
              <div
                id="role-option-student"
                onClick={onSelectStudent}
                className="group relative cursor-pointer rounded-2xl border-2 border-slate-200 hover:border-indigo-600 bg-white hover:bg-indigo-50/30 p-5 transition-all duration-200 shadow-xs hover:shadow-md active:scale-[0.99]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start space-x-4">
                    {/* Student Icon Box */}
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200 shrink-0 group-hover:scale-105 transition">
                      <GraduationCap className="w-6 h-6" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-700 transition">
                          Student
                        </h3>
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Instant Passwordless Access</span>
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        Access course notes, syllabus, semester PYQs, and ask questions to the AI study assistant.
                      </p>

                      {/* Branch Tags Preview */}
                      <div className="pt-2 flex items-center gap-1.5 flex-wrap">
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-[11px] font-bold border border-blue-200">
                          <Cpu className="w-3 h-3 text-blue-600" />
                          <span>CSE</span>
                        </span>
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 text-[11px] font-bold border border-purple-200">
                          <BrainCircuit className="w-3 h-3 text-purple-600" />
                          <span>DSAI</span>
                        </span>
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
                          <Radio className="w-3 h-3 text-emerald-600" />
                          <span>ECE</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600 group-hover:text-indigo-700">
                  <span className="flex items-center space-x-1">
                    <span>Enter as Student</span>
                    <span className="text-[10px] font-normal text-slate-400">• Free & Open</span>
                  </span>
                  <div className="flex items-center space-x-1">
                    <span>Browse Branch Hub</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>

              {/* Option 2: Admin Role Card */}
              <div
                id="role-option-admin"
                onClick={() => setView('admin-login')}
                className="group relative cursor-pointer rounded-2xl border-2 border-slate-200 hover:border-purple-600 bg-white hover:bg-purple-50/30 p-5 transition-all duration-200 shadow-xs hover:shadow-md active:scale-[0.99]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start space-x-4">
                    {/* Admin Icon Box */}
                    <div className="w-12 h-12 rounded-2xl bg-purple-700 text-white flex items-center justify-center shadow-md shadow-purple-200 shrink-0 group-hover:scale-105 transition">
                      <ShieldCheck className="w-6 h-6" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <h3 className="text-base font-bold text-slate-900 group-hover:text-purple-700 transition">
                          Admin / Moderator
                        </h3>
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                          <Lock className="w-2.5 h-2.5 text-purple-600" />
                          <span>Key Protected</span>
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        Faculty & department administrators. Manage uploaded papers, delete obsolete files, restore seeds & view telemetry.
                      </p>

                      <div className="pt-2 flex items-center gap-2 text-[11px] text-slate-500">
                        <span className="inline-flex items-center space-x-1 text-purple-700 font-semibold">
                          <Shield className="w-3 h-3" />
                          <span>Full Moderation Controls</span>
                        </span>
                        <span>•</span>
                        <span>Resource Deletion</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-purple-700 group-hover:text-purple-800">
                  <span className="flex items-center space-x-1">
                    <span>Enter as Admin</span>
                    <span className="text-[10px] font-normal text-slate-400">• Secret Key Required</span>
                  </span>
                  <div className="flex items-center space-x-1">
                    <span>Unlock Admin Controls</span>
                    <Key className="w-3.5 h-3.5 group-hover:rotate-45 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Admin Verification Form */
            <form onSubmit={handleAdminVerify} className="space-y-4">
              <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                    <Key className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Admin Secret Key</h3>
                    <p className="text-[11px] text-slate-500">
                      Validated server-side against <code className="text-purple-700 font-mono font-semibold">ADMIN_SECRET_KEY</code>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  id="admin-login-back-btn"
                  onClick={() => {
                    setView('select');
                    setAuthError(null);
                  }}
                  className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                >
                  ← Back to Roles
                </button>
              </div>

              {authError && (
                <div
                  id="admin-auth-error-banner"
                  className="flex items-start space-x-2.5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs animate-in fade-in"
                >
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <p className="font-bold text-rose-900">Verification Failed</p>
                    <p>{authError}</p>
                  </div>
                </div>
              )}

              <div>
                <label
                  htmlFor="admin-secret-key-input"
                  className="block text-xs font-bold text-slate-800 mb-1.5"
                >
                  Enter Secret Key <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="admin-secret-key-input"
                    type={showKey ? 'text' : 'password'}
                    placeholder="Enter key (e.g. academia-admin-secret-2026)"
                    value={adminKeyInput}
                    onChange={(e) => {
                      setAdminKeyInput(e.target.value);
                      if (authError) setAuthError(null);
                    }}
                    autoFocus
                    className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-mono placeholder:font-sans focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition p-1"
                    title={showKey ? 'Hide key' : 'Show key'}
                    aria-label={showKey ? 'Hide key' : 'Show key'}
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Dev Helper Hint */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs">
                <div className="text-[11px] text-slate-600">
                  Default Dev Key: <code className="font-mono text-purple-700 font-bold ml-1">{DEFAULT_ADMIN_KEY}</code>
                </div>
                <button
                  type="button"
                  id="use-default-admin-key-btn"
                  onClick={handleUseDefaultKey}
                  className="text-[11px] font-bold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-2 py-1 rounded-md border border-purple-200 transition shrink-0 ml-2"
                >
                  Auto-fill Key
                </button>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setView('select');
                    setAuthError(null);
                  }}
                  className="w-1/3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  id="submit-admin-auth-btn"
                  type="submit"
                  disabled={isVerifying}
                  className="w-2/3 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 active:bg-purple-900 text-white text-xs font-bold shadow-md shadow-purple-200 transition flex items-center justify-center space-x-2 disabled:opacity-60"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying with Server...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Unlock Admin Controls</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer info banner */}
        <div className="bg-slate-50 px-6 sm:px-8 py-3.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Role-Based Access Control (RBAC)</span>
          </span>
          <span className="text-slate-400">Secure Session Storage</span>
        </div>
      </div>
    </div>
  );
};
