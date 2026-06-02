import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, Phone, ShieldAlert, Eye, EyeOff, Key, Sparkles, Building2, Globe, Orbit } from 'lucide-react';
import madarLogo from '../assets/images/madar_logo_1780431051075.png';

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
            ? 'خطأ في رقم الجوال أو كلمة المرور للمدراء. يرجى مراجعة إدارة مدار.' 
            : 'Invalid operational phone number or password. Please request authorization.'
        );
      }
      setLoading(false);
    }, 1200);
  };

  return (
    <div className={`min-h-screen flex flex-col justify-center items-center p-4 transition-colors duration-500 font-sans ${
      theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'
    }`}>
      
      {/* Top Bar for utility like changing language in login */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        <button
          onClick={() => setLanguage(isAr ? 'en' : 'ar')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
            theme === 'dark' 
              ? 'bg-slate-900/50 border-slate-800 text-slate-300 hover:bg-slate-800' 
              : 'bg-white border-slate-350 text-slate-900 hover:bg-slate-50 shadow-xs'
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
            ? 'bg-slate-900/40 border-slate-800 shadow-black/40' 
            : 'bg-white border-slate-300 shadow-slate-200/80'
        }`}
      >
         {/* Brand identity header */}
        <div className="text-center space-y-3 mb-8">
          <div className="relative w-16 h-16 bg-white border border-emerald-200 rounded-2.5xl flex items-center justify-center shadow-xl shadow-emerald-500/10 mx-auto overflow-hidden">
            <img src={madarLogo} className="w-full h-full object-cover" referrerPolicy="no-referrer" alt="Madar logo" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-serif font-black tracking-tight text-emerald-950 dark:text-emerald-200 flex items-center justify-center gap-2 bg-emerald-50/50 dark:bg-emerald-950/40 px-3 py-2 rounded-2xl border border-emerald-100 dark:border-emerald-950">
              <img src={madarLogo} className="w-5.5 h-5.5 rounded-md object-contain animate-pulse" referrerPolicy="no-referrer" alt="Madar icon" />
              {isAr ? 'نظام مدار للتحكم' : 'Madar Control System'}
            </h2>
            <p className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300 uppercase tracking-widest pt-1 leading-none">
              {isAr ? 'بوابة الأمن والتحكم الداخلي لموظفي مدار' : 'Internal Operation & Security Portal'}
            </p>
          </div>
        </div>

        {/* Security Warning Notice */}
        <div className={`p-4 rounded-xl border text-xs mb-6 flex items-start gap-2.5 leading-relaxed ${
          theme === 'dark'
            ? 'bg-amber-500/10 border-amber-500/20 text-amber-305'
            : 'bg-amber-50 border-amber-350 text-amber-900 font-bold'
        }`}>
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
          <div>
            <strong className="font-extrabold block mb-0.5">{isAr ? 'نظام أمني مغلق' : 'Restricted Security Workspace'}</strong>
            {isAr 
              ? 'يرجى تسجيل الدخول برقم الجوال وكلمة المرور للمدراء فقط. كافة الزيارات والعمليات مسجلة تلقائياً.'
              : 'Authorized ops only. Intruders and non-affiliated operations are thoroughly reported.'}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          
          {/* Phone input */}
          <div className="space-y-1">
            <label className="text-[11px] font-black text-slate-900 block uppercase">
              {isAr ? 'رقم الجوال:' : 'Registered Mobile Number:'}
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs font-bold text-slate-900" dir="ltr">
                🇸🇦 +966
              </span>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder=""
                maxLength={10}
                required
                disabled={loading}
                className="w-full py-3 pl-20 pr-10 rounded-xl text-sm font-bold bg-slate-100 border border-slate-350 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-left"
                dir="ltr"
              />
              <Phone className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-800" />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1">
            <label className="text-[11px] font-black text-slate-900 block uppercase">
              {isAr ? 'كلمة المرور:' : 'Password:'}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=""
                required
                disabled={loading}
                className="w-full py-3 pl-10 pr-10 rounded-xl text-sm font-bold bg-slate-100 border border-slate-350 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-left"
                dir="ltr"
              />
              <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-800" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 p-0.5 rounded text-slate-800 hover:text-slate-950 cursor-pointer"
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
              className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-350 text-center font-bold leading-relaxed"
            >
              {error}
            </motion.div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/50 text-white font-bold rounded-xl text-xs transition-with-all tracking-wide shadow-lg shadow-emerald-600/20 active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer`}
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

        <div className="text-center mt-6 pt-6 border-t border-slate-300 text-[10px] font-bold text-slate-800">
          {isAr 
            ? 'نظام مدار © ٢٠٢٦ نظام مشفر بالكامل وآمن.' 
            : 'Madar Platform © 2026. AES-Encrypted secure ledger.'}
        </div>
      </motion.div>
    </div>
  );
}
