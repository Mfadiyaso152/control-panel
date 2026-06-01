import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Sliders, DollarSign, ListTodo, Sparkles, 
  HelpCircle, ChevronRight, Activity, TrendingUp, Compass, FileCheck
} from 'lucide-react';
import { Order, ExternalRevenue, ProfitSplits, Theme, Language } from './types';
import { SEED_ORDERS, SEED_REVENUES, DEFAULT_SPLITS, DICTIONARY } from './data';
import FloatingBubble from './components/FloatingBubble';
import OrdersPanel from './components/OrdersPanel';
import FinancePanel from './components/FinancePanel';
import EInvoiceModal from './components/EInvoiceModal';
import LoginScreen from './components/LoginScreen';
import {
  testConnection,
  fetchCloudOrders,
  saveCloudOrder,
  deleteCloudOrder,
  fetchCloudRevenues,
  saveCloudRevenue,
  deleteCloudRevenue,
  fetchCloudSplits,
  saveCloudSplits
} from './firebase';

export default function App() {
  // Authentication check state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('saudicore_auth_session') === 'true';
  });

  // Local states with LocalStorage persistence
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('saudicore_orders_v3');
    return saved ? JSON.parse(saved) : SEED_ORDERS;
  });

  const [externalRevenues, setExternalRevenues] = useState<ExternalRevenue[]>(() => {
    const saved = localStorage.getItem('saudicore_revenues_v3');
    return saved ? JSON.parse(saved) : SEED_REVENUES;
  });

  const [profitSplits, setProfitSplits] = useState<ProfitSplits>(() => {
    const saved = localStorage.getItem('saudicore_splits_v2');
    return saved ? JSON.parse(saved) : DEFAULT_SPLITS;
  });

  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('saudicore_theme_v2');
    return (saved as Theme) || 'light';
  });

  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('saudicore_lang_v2');
    return (saved as Language) || 'ar';
  });

  // Active view tab state: 'search' | 'finance' | 'active_orders' | 'completed_orders'
  const [activeTab, setActiveTab] = useState<'search' | 'finance' | 'active_orders' | 'completed_orders'>('search');

  // Search filter query string
  const [searchQuery, setSearchQuery] = useState('');

  // Active invoice popup state
  const [viewingInvoiceOrder, setViewingInvoiceOrder] = useState<Order | null>(null);
  const [invoiceAutoPrint, setInvoiceAutoPrint] = useState<boolean>(false);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('saudicore_orders_v3', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('saudicore_revenues_v3', JSON.stringify(externalRevenues));
  }, [externalRevenues]);

  useEffect(() => {
    localStorage.setItem('saudicore_splits_v2', JSON.stringify(profitSplits));
  }, [profitSplits]);

  useEffect(() => {
    localStorage.setItem('saudicore_theme_v2', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('saudicore_lang_v2', language);
  }, [language]);

  // Firebase Startup Cloud Sync Effect
  useEffect(() => {
    async function initCloudSync() {
      const isOnline = await testConnection();
      if (isOnline) {
        console.log("[Saudi Core] Initiated cloud sync with Firebase.");
        const cloudOrders = await fetchCloudOrders();
        if (cloudOrders && cloudOrders.length > 0) {
          setOrders(cloudOrders);
        }
        const cloudRevenues = await fetchCloudRevenues();
        if (cloudRevenues && cloudRevenues.length > 0) {
          setExternalRevenues(cloudRevenues);
        }
        const cloudSplits = await fetchCloudSplits();
        if (cloudSplits) {
          setProfitSplits(cloudSplits);
        }
      }
    }
    // Only fetch cloud database if user is authenticated
    if (isAuthenticated) {
      initCloudSync();
    }
  }, [isAuthenticated]);

  // Handle order update
  const handleUpdateOrder = (updatedOrder: Order) => {
    setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
    saveCloudOrder(updatedOrder);
  };

  const handleAddOrder = (newOrder: Order) => {
    setOrders(prev => [newOrder, ...prev]);
    saveCloudOrder(newOrder);
  };

  const handleDeleteOrder = (orderId: string) => {
    setOrders(prev => prev.filter(o => o.id !== orderId));
    deleteCloudOrder(orderId);
  };

  // Add auxiliary external revenue flow
  const handleAddExternalRevenue = (rev: {
    amount: number;
    descriptionArabic: string;
    descriptionEnglish: string;
    categoryArabic: string;
    categoryEnglish: string;
  }) => {
    const newRev: ExternalRevenue = {
      id: 'REV-' + Date.now().toString().slice(-4),
      amount: rev.amount,
      descriptionArabic: rev.descriptionArabic,
      descriptionEnglish: rev.descriptionEnglish,
      date: new Date().toISOString(),
      categoryArabic: rev.categoryArabic,
      categoryEnglish: rev.categoryEnglish
    };
    setExternalRevenues(prev => [newRev, ...prev]);
    saveCloudRevenue(newRev);
  };

  const handleDeleteExternalRevenue = (id: string) => {
    setExternalRevenues(prev => prev.filter(r => r.id !== id));
    deleteCloudRevenue(id);
  };

  const t = DICTIONARY[language];

  if (!isAuthenticated) {
    return (
      <LoginScreen
        onLoginSuccess={() => setIsAuthenticated(true)}
        language={language}
        setLanguage={setLanguage}
        theme={theme}
      />
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 flex flex-col font-sans
      ${theme === 'dark' ? 'bg-sage-950 text-sage-50' : 'bg-cream-100 text-cream-800'}
      ${language === 'ar' ? 'rtl font-sans' : 'ltr font-sans'}
    `} id="app-wrapper">
      
      {/* Floating Animated Bubble Controller - Top Left (Left 6 across languages) */}
      <FloatingBubble
        language={language}
        setLanguage={setLanguage}
        theme={theme}
        setTheme={setTheme}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 space-y-8" id="primary-shell">
        
        {/* Absolute High-End Premium Header with Subtle Particle Ring */}
        <header className="relative flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-cream-200 dark:border-sage-900" id="smart-header">
          {/* Brand Identity / Titles */}
          <div className="space-y-1.5" id="brand-info">
            <div className="flex items-center gap-3">
              <div className="relative w-11 h-11 bg-sage-600 rounded-2xl flex items-center justify-center text-white font-serif font-black text-2xl shadow-lg shadow-sage-600/25">
                <span>س</span>
              </div>
              <div className="leading-tight">
                <h1 className="text-xl md:text-2xl font-serif font-bold text-sage-700 dark:text-sage-350 tracking-tight">
                  {language === 'ar' ? 'سعودي كود (وحدة التحكم)' : 'Saudi Code (Control Unit)'}
                </h1>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                localStorage.removeItem('saudicore_auth_session');
                setIsAuthenticated(false);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                theme === 'dark'
                  ? 'bg-sage-900/50 border-sage-850 text-rose-450 hover:bg-rose-500/10 hover:border-rose-500/20'
                  : 'bg-white border-cream-200 text-rose-600 hover:bg-rose-50'
              }`}
            >
              <span>{language === 'ar' ? 'تسجيل الخروج' : 'Logout'}</span>
            </button>
          </div>
        </header>

        {/* Dynamic Dual view Navigation Tabs Bar - Calm & Quiet */}
        <div className="flex items-center justify-between border-b pb-1.5 border-cream-200 dark:border-sage-900" id="view-tabs-bar">
          <div className="flex flex-wrap gap-2 animate-fadeIn" id="tabs-toggle-wrapper">
            
            {/* Tab 1: Search */}
            <button
              id="tab-search-switch"
              onClick={() => setActiveTab('search')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold tracking-tight cursor-pointer transition-all flex items-center gap-2
                ${activeTab === 'search'
                  ? theme === 'dark'
                    ? 'bg-sage-900/60 text-sage-200 border border-sage-700/50 shadow-md shadow-sage-950/20'
                    : 'bg-white text-sage-850 border border-cream-200 shadow-xs'
                  : 'text-cream-800/50 hover:text-sage-700 hover:bg-cream-150 dark:text-sage-400 dark:hover:bg-sage-900/30'
                }`}
            >
              <Search className="w-4 h-4 text-sage-600" />
              <span>{language === 'ar' ? 'البحث بالوسط' : 'Centralized Search'}</span>
            </button>

            {/* Tab 2: Finance */}
            <button
              id="tab-finance-switch"
              onClick={() => setActiveTab('finance')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold tracking-tight cursor-pointer transition-all flex items-center gap-2
                ${activeTab === 'finance'
                  ? theme === 'dark'
                    ? 'bg-sage-900/60 text-sage-200 border border-sage-700/50 shadow-md shadow-sage-950/20'
                    : 'bg-white text-sage-850 border border-cream-200 shadow-xs'
                  : 'text-cream-800/50 hover:text-sage-700 hover:bg-cream-150 dark:text-sage-400 dark:hover:bg-sage-900/30'
                }`}
            >
              <DollarSign className="w-4 h-4 text-sage-600" />
              <span>{language === 'ar' ? 'المالية (الأرباح)' : 'Finance (Profits Only)'}</span>
            </button>

            {/* Tab 3: Active Orders */}
            <button
              id="tab-active-orders-switch"
              onClick={() => setActiveTab('active_orders')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold tracking-tight cursor-pointer transition-all flex items-center gap-2
                ${activeTab === 'active_orders'
                  ? theme === 'dark'
                    ? 'bg-sage-900/60 text-sage-200 border border-sage-700/50 shadow-md shadow-sage-950/20'
                    : 'bg-white text-sage-850 border border-cream-200 shadow-xs'
                  : 'text-cream-800/50 hover:text-sage-700 hover:bg-cream-150 dark:text-sage-400 dark:hover:bg-sage-900/30'
                }`}
            >
              <ListTodo className="w-4 h-4 text-sage-600" />
              <span>{language === 'ar' ? 'الطلبات الجارية' : 'In-Progress Requests'}</span>
            </button>

            {/* Tab 4: Completed Orders */}
            <button
              id="tab-completed-orders-switch"
              onClick={() => setActiveTab('completed_orders')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold tracking-tight cursor-pointer transition-all flex items-center gap-2
                ${activeTab === 'completed_orders'
                  ? theme === 'dark'
                    ? 'bg-sage-900/60 text-sage-200 border border-sage-700/50 shadow-md shadow-sage-950/20'
                    : 'bg-white text-sage-850 border border-cream-200 shadow-xs'
                  : 'text-cream-800/50 hover:text-sage-700 hover:bg-cream-150 dark:text-sage-400 dark:hover:bg-sage-900/30'
                }`}
            >
              <FileCheck className="w-4 h-4 text-sage-600" />
              <span>{language === 'ar' ? 'الطلبات المكتملة' : 'Completed Registry'}</span>
            </button>
          </div>
        </div>

        {/* Dashboard Active View Frame */}
        <div className="min-h-[400px]" id="dashboard-render-viewport">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'finance' ? (
                <FinancePanel
                  orders={orders}
                  language={language}
                  theme={theme}
                />
               ) : (
                <OrdersPanel
                  orders={orders}
                  updateOrder={handleUpdateOrder}
                  addOrder={handleAddOrder}
                  deleteOrder={handleDeleteOrder}
                  language={language}
                  theme={theme}
                  tab={activeTab as 'search' | 'active_orders' | 'completed_orders'}
                  onViewInvoice={(ord, autoDownload) => {
                    setViewingInvoiceOrder(ord);
                    setInvoiceAutoPrint(!!autoDownload);
                  }}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

      </main>

      {/* Primary Platform Footer */}
      <footer className="py-8 mt-12 border-t border-cream-200 dark:border-sage-900 text-center space-y-1.5" id="applet-footer">
        <p className="text-xs text-cream-800/60 dark:text-sage-400">
          {language === 'ar' 
            ? 'سعودي كور للخدمات الرقمية وحلول البرمجيات المتطورة © ٢٠٢٦' 
            : 'Saudi Core Advanced Services & Software Platform © 2026. All rights reserved.'}
        </p>
        <span className="text-[10px] text-cream-800/40 dark:text-sage-500 block font-mono">
          Saudi Core Operations Portal • Riyadh, Saudi Arabia
        </span>
      </footer>

      {/* Dynamic English e-bill Overlay Modal */}
      <AnimatePresence>
        {viewingInvoiceOrder && (
          <EInvoiceModal
            order={viewingInvoiceOrder}
            language={language}
            onClose={() => {
              setViewingInvoiceOrder(null);
              setInvoiceAutoPrint(false);
            }}
            autoPrint={invoiceAutoPrint}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
