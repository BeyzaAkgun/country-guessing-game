// AuthScreen.tsx - Login / Register screen
import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Globe3D } from "@/app/components/Globe3D";
import { Globe, User, Mail, Lock, Eye, EyeOff, AlertCircle, Loader2, ArrowLeft } from "lucide-react";

interface AuthScreenProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (username: string, email: string, password: string) => Promise<void>;
  loading: boolean;
  error: string | null;
  onBack?: () => void; // optional — if provided, shows "Continue as Guest" button
}

type Tab = "login" | "register";

export function AuthScreen({ onLogin, onRegister, loading, error, onBack }: AuthScreenProps) {
  const [tab, setTab]                   = useState<Tab>("login");
  const [username, setUsername]         = useState("");
  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [confirmPassword, setConfirm]   = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError]     = useState<string | null>(null);

  const displayError = localError ?? error;

  const handleSubmit = async () => {
    setLocalError(null);
    if (tab === "register") {
      if (!username.trim())             { setLocalError("Username is required"); return; }
      if (!email.trim())                { setLocalError("Email is required"); return; }
      if (!password.trim())             { setLocalError("Password is required"); return; }
      if (password.length < 8)          { setLocalError("Password must be at least 8 characters"); return; }
      if (password !== confirmPassword) { setLocalError("Passwords do not match"); return; }
      await onRegister(username.trim(), email.trim(), password);
    } else {
      if (!email.trim())    { setLocalError("Email is required"); return; }
      if (!password.trim()) { setLocalError("Password is required"); return; }
      await onLogin(email.trim(), password);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  const switchTab = (t: Tab) => {
    setTab(t);
    setLocalError(null);
    setUsername(""); setEmail(""); setPassword(""); setConfirm("");
  };

  return (
    <div className="w-screen h-screen fixed inset-0 overflow-hidden">
      {/* Globe background */}
      <div className="absolute inset-0 z-0">
        <Globe3D onTransitionToMap={() => {}} showButton={false} />
      </div>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60 z-10" />

      {/* Auth card */}
      <div className="relative z-20 w-full h-full flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 260 }}
          className="w-full max-w-md"
        >
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20">

            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-8 py-7 text-center relative">
              {/* Back arrow — only shown when guest can go back */}
              {onBack && (
                <button
                  onClick={onBack}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/15 hover:bg-white/25 rounded-xl transition-colors"
                  title="Back"
                >
                  <ArrowLeft className="w-4 h-4 text-white" />
                </button>
              )}
              <div className="flex justify-center mb-3">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Globe className="w-8 h-8 text-white" />
                </div>
              </div>
              <h1 className="text-2xl font-black text-white">Geography Master</h1>
              <p className="text-white/70 text-sm mt-1">
                {tab === "login" ? "Welcome back, explorer!" : "Join the adventure!"}
              </p>
            </div>

            {/* Tab switcher */}
            <div className="flex border-b border-slate-200 dark:border-slate-700">
              {(["login", "register"] as Tab[]).map(t => (
                <button
                  key={t}
                  onClick={() => switchTab(t)}
                  className={`flex-1 py-3.5 text-sm font-bold transition-all ${
                    tab === t
                      ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                      : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  }`}
                >
                  {t === "login" ? "Sign In" : "Create Account"}
                </button>
              ))}
            </div>

            {/* Form */}
            <div className="px-8 py-6 space-y-4">

              <AnimatePresence>
                {displayError && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                    className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl px-4 py-3"
                  >
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-600 dark:text-red-400">{displayError}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {tab === "register" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }} className="overflow-hidden"
                  >
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Username</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="text" value={username} onChange={e => setUsername(e.target.value)} onKeyDown={handleKeyDown}
                        placeholder="your_username" autoComplete="username"
                        className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 transition-all"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={handleKeyDown}
                    placeholder="you@example.com" autoComplete="email"
                    className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} onKeyDown={handleKeyDown}
                    placeholder="••••••••" autoComplete={tab === "login" ? "current-password" : "new-password"}
                    className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl py-3 pl-10 pr-11 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 transition-all"
                  />
                  <button type="button" onClick={() => setShowPassword(p => !p)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {tab === "register" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }} className="overflow-hidden"
                  >
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type={showPassword ? "text" : "password"} value={confirmPassword} onChange={e => setConfirm(e.target.value)} onKeyDown={handleKeyDown}
                        placeholder="••••••••" autoComplete="new-password"
                        className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 transition-all"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                onClick={handleSubmit} disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 mt-2"
              >
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Please wait...</>
                  : tab === "login" ? "Sign In" : "Create Account"
                }
              </button>

              <p className="text-center text-xs text-slate-400 pt-1">
                {tab === "login" ? "Don't have an account? " : "Already have an account? "}
                <button onClick={() => switchTab(tab === "login" ? "register" : "login")}
                  className="text-blue-500 hover:text-blue-600 font-semibold transition-colors"
                >
                  {tab === "login" ? "Sign up" : "Sign in"}
                </button>
              </p>

              {/* Continue as guest — only shown when navigating from inside the app */}
              {onBack && (
                <button
                  onClick={onBack}
                  className="w-full py-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-sm font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Continue as Guest
                </button>
              )}

            </div>
          </div>

          <p className="text-center text-white/40 text-xs mt-4">
            Geography Master · Explore the world 🌍
          </p>
        </motion.div>
      </div>
    </div>
  );
}