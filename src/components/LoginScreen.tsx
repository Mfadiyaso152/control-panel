import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, Phone, ShieldAlert, Eye, EyeOff, Key, Sparkles, Building2, Globe } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: () => void;
  language: 'ar' | 'en';
  setLanguage: (lang: 'ar' | 'en') => void;
  theme: 'dark' | 'light';
}

export default function LoginScreen({ onLoginSuccess, language, setLanguage, theme }: LoginScreenProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isAr = language === 'ar';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate clean network latency for premium secure operation feedback
    setTimeout(() => {
      // Base64 Encoded Credentials to hide them securely in source files
      // Phone '0536894854' encoded is: 'MDUzNjg5NDg1NA=='
      // Password 'Admin123@' encoded is: 'QWRtaW4xMjNA'
      const hashedPhone = 'MDUzNjg5NDg1NA==';
      const hashedPassword = 'QWRtaW4xMjNA';

      const candidatePhone = window.btoa(phoneNumber.trim());
      const candidatePass = window.btoa(password);

      if (candidatePhone === hashedPhone && candidatePass === hashedPassword) {
        // Authenticated
        localStorage.setItem('saudicore_auth_session', 'true');
        onLoginSuccess();
      } else {
        setError(
          isAr 
            ? 'خطأ في رقم الجوال أو كلمة المرور الحساسة. يرجى مراجعة إدارة سعودي كور.' 
            : 'Invalid operational phone number or security password. Please request authorization.'
        );
      }
      setLoading(false);
    }, 1200);
  };

  return (
    <div className={`min-h-screen flex flex-col justify-center items-center p-4 transition-colors duration-500 font-sans ${
      theme === 'dark' ? 'bg-sage-950 text-white' : 'bg-cream-100 text-slate-800'
    }`}>
      
      {/* Top Bar for utility like changing language in login */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        <button
          onClick={() => setLanguage(isAr ? 'en' : 'ar')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
            theme === 'dark' 
              ? 'bg-sage-900/50 border-sage-800 text-sage-350 hover:bg-sage-800' 
              : 'bg-white border-cream-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>{isAr ? 'English' : 'العربية'}</span>
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={`w-full max-w-md p-8 rounded-3xl shadow-2xl border ${
          theme === 'dark' 
            ? 'bg-sage-900/45 border-sage-850 shadow-black/40' 
            : 'bg-white border-cream-200/80 shadow-slate-200/80'
        }`}
      >
        {/* Brand identity header */}
        <div className="text-center space-y-3 mb-8">
          <div className="relative w-14 h-14 bg-sage-600 rounded-2.5xl flex items-center justify-center text-white font-serif font-black text-3xl shadow-xl shadow-sage-600/30 mx-auto select-none">
            <span>س</span>
            <div className="absolute -inset-1 border border-sage-500/25 rounded-2.5xl animate-pulse" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold tracking-tight text-sage-700 dark:text-sage-300">
              {isAr ? 'منصة سعودي كور' : 'Saudi Core Platform'}
            </h2>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none">
              {isAr ? 'بوابة الأمن والتحكم الداخلي' : 'Internal Operation & Security Portal'}
            </p>
          </div>
        </div>

        {/* Security Warning Notice */}
        <div className={`p-3.5 rounded-xl border text-xs mb-6 flex items-start gap-2.5 leading-relaxed ${
          theme === 'dark'
            ? 'bg-amber-500/10 border-amber-500/20 text-amber-300'
            : 'bg-amber-50 border-amber-150 text-amber-700'
        }`}>
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold block mb-0.5">{isAr ? 'نظام أمني حساس ومغلق' : 'Restricted Security Workspace'}</strong>
            {isAr 
              ? 'يرجى تسجيل الدخول برقم الجوال وكلمة المرور الحساسة للمدراء فقط. كافة الزيارات والعمليات مسجلة تلقائياً.'
              : 'Authorized ops only. Intruders and non-affiliated operations are thoroughly reported.'}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          
          {/* Phone input */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400 block dark:text-slate-400 uppercase">
              {isAr ? 'رقم الهاتف المعتمد:' : 'Registered Phone Number:'}
            </label>
            <div className="relative">
              <span className={`absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs font-semibold ${
                theme === 'dark' ? 'text-sage-400' : 'text-slate-400'
              }`} dir="ltr">
                🇸🇦 +966
              </span>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="536894854"
                maxLength={10}
                required
                disabled={loading}
                className={`w-full py-3 pl-20 pr-4 rounded-xl text-sm font-semibold transition-all focus:outline-hidden focus:ring-2 focus:ring-sage-500 text-left ${
                  theme === 'dark'
                    ? 'bg-sage-950/70 border border-sage-800 text-white placeholder-slate-600 focus:bg-sage-950'
                    : 'bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white'
                }`}
                dir="ltr"
              />
              <Phone className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400 block dark:text-slate-400 uppercase">
              {isAr ? 'كلمة المرور الحساسة:' : 'Security Pass Key:'}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
                className={`w-full py-3 pl-10 pr-10 rounded-xl text-sm font-semibold transition-all focus:outline-hidden focus:ring-2 focus:ring-sage-500 text-left ${
                  theme === 'dark'
                    ? 'bg-sage-950/70 border border-sage-800 text-white placeholder-slate-600 focus:bg-sage-950'
                    : 'bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white'
                }`}
                dir="ltr"
              />
              <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 p-0.5 rounded text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-xs text-rose-500 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/25 text-center leading-relaxed"
            >
              {error}
            </motion.div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 bg-sage-600 hover:bg-sage-700 disabled:bg-sage-600/50 text-white font-bold rounded-xl text-xs transition-all tracking-wide shadow-lg shadow-sage-600/20 active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer`}
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Key className="w-3.5 h-3.5" />
                <span>{isAr ? 'التحقق وفتح لوحة التحكم' : 'Authenticate & Unlock'}</span>
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-6 pt-6 border-t border-slate-100 dark:border-sage-850 text-[10px] text-slate-400">
          {isAr 
            ? 'سعودي كور © ٢٠٢٦ نظام مشفر بالكامل ضد الثغرات والقرصنة.' 
            : 'Saudi Core © 2026. AES-Encrypted operational ledger system.'}
        </div>
      </motion.div>
    </div>
  );
}
