import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { DollarSign, ShieldCheck, CreditCard, Activity, Briefcase } from 'lucide-react';
import { Order, Language, Theme } from '../types';

interface FinancePanelProps {
  orders: Order[];
  language: Language;
  theme: Theme;
}

export default function FinancePanel({
  orders,
  language,
  theme
}: FinancePanelProps) {
  const isAr = language === 'ar';

  // Calculate sum of all orders
  const totalProfits = useMemo(() => {
    return orders.reduce((sum, order) => sum + (order.price || 0), 0);
  }, [orders]);

  // Breakdown metrics
  const paidOrdersCount = useMemo(() => orders.filter(o => o.paymentStatus === 'paid').length, [orders]);
  const completedOrdersCount = useMemo(() => orders.filter(o => o.progress === 100 || o.orderStatus === 'completed').length, [orders]);

  return (
    <div className="space-y-6" id="simplified-finance-panel">
      
      {/* Saudi Core Theme styled Profit Center banner */}
      <div className="text-center md:text-right py-4" id="finance-headline">
        <h2 className="text-xl font-serif font-bold tracking-tight text-sage-800 dark:text-sage-350">
          {isAr ? 'التقارير المالية والتحليلات' : 'Financial Reports & Earnings'}
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          {isAr 
            ? 'مراقبة أرباح وإيرادات سعودي كور المباشرة بناءً على الطلبات المستلمة' 
            : 'Operational monitoring of Saudi Core platform incomes and general margins'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="finance-contents-grid">
        {/* Main Profits card: TAKES CENTER STAGE with gorgeous sizing */}
        <div className={`md:col-span-2 p-8 rounded-2xl border flex flex-col justify-between relative overflow-hidden transition-all duration-300 ${
          theme === 'dark' 
            ? 'bg-sage-900/40 border-sage-800 text-white' 
            : 'bg-gradient-to-tr from-sage-50 to-cream-100 border-cream-200 shadow-sm text-slate-800'
        }`} id="earnings-main-card">
          
          <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-sage-600 to-sage-500" />
          
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold text-sage-700 dark:text-sage-400 block uppercase tracking-wider">
                  {isAr ? 'أرباح المركز والمشاريع' : 'Net Integrated Platform Profit'}
                </span>
                <span className="text-4xl md:text-5xl font-serif font-black tracking-tight mt-3 block text-sage-800 dark:text-sage-200">
                  {totalProfits.toLocaleString()} <span className="text-xl md:text-2xl font-medium">{isAr ? 'ريال' : 'SAR'}</span>
                </span>
              </div>
              <div className="p-4 bg-sage-500/10 text-sage-600 rounded-2xl">
                <DollarSign className="w-8 h-8 animate-pulse text-sage-600" />
              </div>
            </div>

            <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed max-w-lg">
              {isAr 
                ? 'قيمة الإيرادات والأرباح الإجمالية لكافة الطلبات المقدمة للعملاء والمسجلة في لوحة التحكم بشكل تراكمي شامل.'
                : 'Aggrapated financial margin representing the gross balance of all registered systems requests.'}
            </p>
          </div>

          <div className="flex items-center gap-2 mt-6 pt-6 border-t border-cream-200 dark:border-sage-850 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 select-none" />
            <span>{isAr ? 'نظام المحاسبة متوافق مع معايير الأمان المالي والمحاسبة الذكية بسعودي كور.' : 'Security-compliant smart operational ledger interface.'}</span>
          </div>
        </div>

        {/* Supporting stats block */}
        <div className="space-y-4" id="supporting-stats-sidebar">
          
          {/* Stat 1: Total Orders Count */}
          <div className={`p-5 rounded-2xl border flex items-center justify-between ${
            theme === 'dark' ? 'bg-sage-900/20 border-sage-850' : 'bg-white border-cream-200'
          }`}>
            <div className="space-y-1">
              <span className="text-xs text-slate-400 block">{isAr ? 'إجمالي الطلبات' : 'Total Orders Registered'}</span>
              <span className="text-xl font-bold font-serif text-slate-800 dark:text-white">
                {orders.length} <span className="text-xs font-medium text-slate-500">{isAr ? 'طلب' : 'Requests'}</span>
              </span>
            </div>
            <div className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl">
              <Briefcase className="w-5 h-5 text-sage-600" />
            </div>
          </div>

          {/* Stat 2: Paid Orders */}
          <div className={`p-5 rounded-2xl border flex items-center justify-between ${
            theme === 'dark' ? 'bg-sage-900/20 border-sage-850' : 'bg-white border-cream-200'
          }`}>
            <div className="space-y-1">
              <span className="text-xs text-slate-400 block">{isAr ? 'الطلبات المدفوعة' : 'Paid Orders'}</span>
              <span className="text-xl font-bold font-serif text-slate-800 dark:text-white">
                {paidOrdersCount} <span className="text-xs font-medium text-slate-500">{isAr ? 'طلب' : 'Paid'}</span>
              </span>
            </div>
            <div className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl">
              <CreditCard className="w-5 h-5 text-emerald-500" />
            </div>
          </div>

          {/* Stat 3: Completed Orders */}
          <div className={`p-5 rounded-2xl border flex items-center justify-between ${
            theme === 'dark' ? 'bg-sage-900/20 border-sage-850' : 'bg-white border-cream-200'
          }`}>
            <div className="space-y-1">
              <span className="text-xs text-slate-400 block">{isAr ? 'الطلبات المنتهية ١٠٠٪' : 'Completed (100%)'}</span>
              <span className="text-xl font-bold font-serif text-slate-800 dark:text-white">
                {completedOrdersCount} <span className="text-xs font-medium text-slate-500">{isAr ? 'طلب' : 'Completed'}</span>
              </span>
            </div>
            <div className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl">
              <Activity className="w-5 h-5 text-indigo-500 shadow-xs" />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
