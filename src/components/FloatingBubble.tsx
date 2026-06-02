import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, Sliders, Globe, Moon, Sun, Monitor, DollarSign, ListTodo, X, Search, CheckCircle, Orbit } from 'lucide-react';
import { Language, Theme } from '../types';
import { DICTIONARY } from '../data';

interface FloatingBubbleProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  activeTab: 'search' | 'finance' | 'active_orders' | 'completed_orders';
  setActiveTab: (tab: 'search' | 'finance' | 'active_orders' | 'completed_orders') => void;
}

export default function FloatingBubble({
  language,
  setLanguage,
  theme,
  setTheme,
  activeTab,
  setActiveTab
}: FloatingBubbleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const t = DICTIONARY[language];

  // Floating bubble morphing & bounce variants
  const bubbleVariants = {
    animate: {
      scale: [1, 1.05, 0.98, 1.02, 1],
      borderRadius: ["50%", "45% 55% 50% 50%", "52% 48% 46% 54%", "50%"],
      y: [0, -6, 2, -4, 0],
      transition: {
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    hover: {
      scale: 1.15,
      boxShadow: theme === 'dark' 
        ? "0 0 25px rgba(138, 154, 91, 0.6)" 
        : "0 0 20px rgba(138, 154, 91, 0.4)",
      transition: { duration: 0.3 }
    },
    tap: { scale: 0.9 }
  };

  return (
    <>
      {/* Background Overlay when the sidebar is open */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-cream-950/40 backdrop-blur-sm z-40 transition-opacity"
            id="overlay-bg"
          />
        )}
      </AnimatePresence>

      {/* Floating Bubble Control - Bottom Right */}
      <div className="fixed right-6 bottom-6 z-50" id="floating-bubble-container">
        <motion.button
          id="bubble-toggle-btn"
          variants={bubbleVariants}
          animate="animate"
          whileHover="hover"
          whileTap="tap"
          onClick={() => setIsOpen(!isOpen)}
          className={`relative w-14 h-14 rounded-full flex flex-col items-center justify-center gap-1 cursor-pointer 
            border-2 transition-colors duration-300 shadow-xl
            ${theme === 'dark' 
              ? 'bg-sage-900 border-sage-500 text-white' 
              : 'bg-white border-sage-600 text-sage-600'
            }`}
          title={t.floatingBubbleTooltip}
        >
          {/* Wave Ripple effect */}
          <span className="absolute inset-0 rounded-full animate-ping bg-sage-600/20 opacity-75 pointer-events-none" />
          
          {/* Three Dots Representation Stacked Vertically */}
          <div className="flex flex-col gap-1 items-center justify-center" id="three-dots-wrapper">
            <span className={`w-1.5 h-1.5 rounded-full ${theme === 'dark' ? 'bg-white' : 'bg-sage-600'} animate-pulse`} />
            <span className={`w-1.5 h-1.5 rounded-full ${theme === 'dark' ? 'bg-white' : 'bg-sage-600'} animate-pulse delay-100`} />
            <span className={`w-1.5 h-1.5 rounded-full ${theme === 'dark' ? 'bg-white' : 'bg-sage-600'} animate-pulse delay-200`} />
          </div>
        </motion.button>
      </div>

      {/* Sidebar Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="sidebar-panel"
            initial={{ x: language === 'ar' ? '-100%' : '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: language === 'ar' ? '-100%' : '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 180 }}
            className={`fixed top-0 bottom-0 left-0 w-80 max-w-full z-50 shadow-2xl overflow-y-auto flex flex-col
              ${theme === 'dark' 
                ? 'bg-sage-950/95 text-white border-r border-sage-900 backdrop-blur-md' 
                : 'bg-white/95 text-cream-800 border-r border-cream-200 backdrop-blur-md'
              }
              ${language === 'ar' ? 'rtl font-sans' : 'ltr font-sans'}
            `}
          >
            {/* Sidebar Header */}
            <div className={`p-6 border-b flex items-center justify-between ${theme === 'dark' ? 'border-sage-900' : 'border-cream-150'}`} id="sidebar-header">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center relative ${theme === 'dark' ? 'bg-purple-950 text-purple-300' : 'bg-[#F3E8FF] text-purple-700 font-serif font-bold text-xl'}`}>
                  <Orbit className="absolute -top-1 -right-1 w-4 h-4 text-purple-500 animate-spin" style={{ animationDuration: '6s' }} />
                  <span>M</span>
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-slate-700 dark:text-slate-350 tracking-tight flex items-center gap-1.5">{t.settingsTitle}</h3>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Madar Platform v2.2.0</p>
                </div>
              </div>
              <button 
                id="close-sidebar-btn"
                onClick={() => setIsOpen(false)}
                className={`p-2 rounded-lg hover:bg-opacity-20 transition-all ${theme === 'dark' ? 'hover:bg-sage-900' : 'hover:bg-cream-150'}`}
              >
                <X className="w-5 h-5 text-sage-600" />
              </button>
            </div>

            {/* Sidebar Content */}
            <div className="p-6 flex-1 flex flex-col gap-8" id="sidebar-body">
              {/* Quick Navigation Panel */}
              <div className="flex flex-col gap-2">
                <span className={`text-xs uppercase font-extrabold tracking-wider ${theme === 'dark' ? 'text-sage-400' : 'text-sage-600'}`}>
                  {language === 'ar' ? 'التنقل السريع' : 'Quick Navigation'}
                </span>
                
                {/* 1. Search Tab */}
                <button
                  id="nav-search-btn"
                  onClick={() => {
                    setActiveTab('search');
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all
                    ${activeTab === 'search'
                      ? theme === 'dark'
                        ? 'bg-sage-900 border border-sage-500/30 text-sage-200 font-medium'
                        : 'bg-cream-150 border border-cream-200 text-sage-800 font-medium'
                      : theme === 'dark'
                        ? 'hover:bg-sage-900 text-sage-400 border border-transparent'
                        : 'hover:bg-cream-100 text-cream-800 border border-transparent'
                    }
                  `}
                >
                  <Search className="w-4.5 h-4.5 text-sage-600" />
                  <span>{language === 'ar' ? 'قسم البحث' : 'Search Department'}</span>
                </button>

                {/* 2. Finance Tab */}
                <button
                  id="nav-finance-btn"
                  onClick={() => {
                    setActiveTab('finance');
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all
                    ${activeTab === 'finance'
                      ? theme === 'dark'
                        ? 'bg-sage-900 border border-sage-500/30 text-sage-200 font-medium'
                        : 'bg-cream-150 border border-cream-200 text-sage-800 font-medium'
                      : theme === 'dark'
                        ? 'hover:bg-sage-900 text-sage-400 border border-transparent'
                        : 'hover:bg-cream-100 text-cream-800 border border-transparent'
                    }
                  `}
                >
                  <DollarSign className="w-5 h-5 text-sage-600" />
                  <span>{language === 'ar' ? 'قسم الأرباح' : 'Earnings Department'}</span>
                </button>

                {/* 3. Active Orders Tab */}
                <button
                  id="nav-active-orders-btn"
                  onClick={() => {
                    setActiveTab('active_orders');
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all
                    ${activeTab === 'active_orders'
                      ? theme === 'dark'
                        ? 'bg-sage-900 border border-sage-500/30 text-sage-200 font-medium'
                        : 'bg-cream-150 border border-cream-200 text-sage-800 font-medium'
                      : theme === 'dark'
                        ? 'hover:bg-sage-900 text-sage-400 border border-transparent'
                        : 'hover:bg-cream-100 text-cream-800 border border-transparent'
                    }
                  `}
                >
                  <ListTodo className="w-5 h-5 text-sage-600" />
                  <span>{language === 'ar' ? 'إدارة الطلبات الجارية' : 'Active Orders Desk'}</span>
                </button>

                {/* 4. Completed Orders Tab */}
                <button
                  id="nav-completed-orders-btn"
                  onClick={() => {
                    setActiveTab('completed_orders');
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all
                    ${activeTab === 'completed_orders'
                      ? theme === 'dark'
                        ? 'bg-sage-900 border border-sage-500/30 text-sage-200 font-medium'
                        : 'bg-cream-150 border border-cream-200 text-sage-800 font-medium'
                      : theme === 'dark'
                        ? 'hover:bg-sage-900 text-sage-400 border border-transparent'
                        : 'hover:bg-cream-100 text-cream-800 border border-transparent'
                    }
                  `}
                >
                  <CheckCircle className="w-4.5 h-4.5 text-sage-600" />
                  <span>{language === 'ar' ? 'الطلبات المكتملة' : 'Completed Orders Registry'}</span>
                </button>
              </div>

              {/* Language Settings Panel */}
              <div className="flex flex-col gap-3">
                <span className={`text-xs uppercase font-extrabold tracking-wider ${theme === 'dark' ? 'text-sage-400' : 'text-sage-600'}`}>
                  {t.languageLabel}
                </span>

                <div className="flex gap-2" id="language-toggles">
                  <button
                    id="lang-ar-btn"
                    onClick={() => setLanguage('ar')}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all cursor-pointer
                      ${language === 'ar'
                        ? theme === 'dark'
                          ? 'bg-sage-900 border-sage-500 text-sage-200'
                          : 'bg-sage-600 border-sage-600 text-white shadow-xs'
                        : theme === 'dark'
                          ? 'border-sage-900 text-sage-400 hover:bg-sage-900/40'
                          : 'border-cream-200 text-cream-800/60 hover:bg-cream-150'
                      }
                    `}
                  >
                    العربية
                  </button>

                  <button
                    id="lang-en-btn"
                    onClick={() => setLanguage('en')}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all cursor-pointer
                      ${language === 'en'
                        ? theme === 'dark'
                          ? 'bg-sage-900 border-sage-500 text-sage-200'
                          : 'bg-sage-600 border-sage-600 text-white shadow-xs'
                        : theme === 'dark'
                          ? 'border-sage-900 text-sage-400 hover:bg-sage-900/40'
                          : 'border-cream-200 text-cream-800/60 hover:bg-cream-150'
                      }
                    `}
                  >
                    English
                  </button>
                </div>
              </div>
            </div>

            {/* Sidebar Footer */}
            <div className={`p-6 border-t text-center ${theme === 'dark' ? 'border-zinc-800' : 'border-slate-100'}`} id="sidebar-footer">
              <span className="text-[10px] opacity-40 uppercase tracking-widest font-mono">
                {language === 'ar' ? 'تمت البرمجة لـ منصة مدار ✨' : 'Engineered for Madar ✨'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
