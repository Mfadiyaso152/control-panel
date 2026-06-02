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

  // Calculate sum of paid orders (totalProfits)
  const totalProfits = useMemo(() => {
    return orders
      .filter(order => order.paymentStatus === 'paid')
      .reduce((sum, order) => sum + (Number(order.price) || 0), 0);
  }, [orders]);

  const totalPaid = totalProfits;

  // Calculate sum of pending orders
  const totalPending = useMemo(() => {
    return orders
      .filter(order => order.paymentStatus === 'pending')
      .reduce((sum, order) => sum + (Number(order.price) || 0), 0);
  }, [orders]);

  // Calculate sum of all orders (Gross revenue)
  const totalGross = useMemo(() => {
    return orders.reduce((sum, order) => sum + (Number(order.price) || 0), 0);
  }, [orders]);

  // Breakdown metrics
  const paidOrdersCount = useMemo(() => orders.filter(o => o.paymentStatus === 'paid').length, [orders]);
  const completedOrdersCount = useMemo(() => orders.filter(o => o.progress === 100 || o.orderStatus === 'completed').length, [orders]);

  return (
    <div className="space-y-6" id="simplified-finance-panel">
      
      {/* Saudi Core Theme styled Profit Center banner */}
      <div className="text-center md:text-right py-4" id="finance-headline">
        <h2 className="text-xl font-serif font-black tracking-tight text-slate-900 dark:text-slate-100">
          {isAr ? 'تقارير الأرباح والتحليلات' : 'Earnings Reports & Analytics'}
        </h2>
        <p className="text-xs text-slate-800 font-bold mt-1">
          {isAr 
            ? 'مراقبة أرباح وإيرادات مدار المباشرة بناءً على الطلبات المستلمة' 
            : 'Operational monitoring of Madar platform incomes and general margins'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="finance-contents-grid">
        {/* Main Profits card: TAKES CENTER STAGE with gorgeous sizing */}
        <div className={`md:col-span-2 p-8 rounded-2xl border flex flex-col justify-between relative overflow-hidden transition-all duration-300 ${
          theme === 'dark' 
            ? 'bg-sage-900/40 border-sage-800 text-white' 
            : 'bg-gradient-to-tr from-sage-50 to-cream-100 border-cream-200 shadow-sm text-slate-900'
        }`} id="earnings-main-card">
          
          <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-emerald-600 to-emerald-500" />
          
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 block uppercase tracking-wider">
                  {isAr ? 'تقارير الأرباح والمبالغ الكلية للنظام' : 'Earning Metrics & Financial Breakdown'}
                </span>
              </div>
              <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-xl">
                <DollarSign className="w-6 h-6 animate-pulse text-emerald-600" />
              </div>
            </div>

            {/* Grid of amounts */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 border-t border-b border-slate-100 dark:border-sage-850 py-5">
              {/* Paid Profits */}
              <div className="space-y-1">
                <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 block uppercase tracking-wider">
                  {isAr ? '💸 أرباح مدفوعة ومحصّلة' : 'Paid & Settled Profits'}
                </span>
                <span className="text-2xl md:text-3xl font-serif font-black tracking-tight block text-emerald-600 dark:text-emerald-400">
                  {totalPaid.toLocaleString()} <span className="text-sm font-bold">{isAr ? 'ريال' : 'SAR'}</span>
                </span>
                <span className="text-[10px] text-slate-500 font-extrabold block">
                  {isAr ? 'قيمة الطلبات المسددة بالكامل' : 'Paid requests value count'}
                </span>
              </div>

              {/* Pending Profits */}
              <div className="space-y-1 sm:border-r sm:border-l border-slate-100 dark:border-sage-900 px-0 sm:px-4">
                <span className="text-[11px] font-black text-amber-600 dark:text-amber-400 block uppercase tracking-wider">
                  {isAr ? '⏳ مبالغ معلقة بانتظار السداد' : 'Pending Payments'}
                </span>
                <span className="text-2xl md:text-3xl font-serif font-black tracking-tight block text-amber-600 dark:text-amber-400">
                  {totalPending.toLocaleString()} <span className="text-sm font-bold">{isAr ? 'ريال' : 'SAR'}</span>
                </span>
                <span className="text-[10px] text-slate-500 font-extrabold block">
                  {isAr ? 'طلبات بانتظار السداد من العميل' : 'Orders waiting user settlement'}
                </span>
              </div>

              {/* Total Gross Profits */}
              <div className="space-y-1">
                <span className="text-[11px] font-black text-teal-600 dark:text-teal-400 block uppercase tracking-wider">
                  {isAr ? '📊 إجمالي القيمة الكلية للمشاريع' : 'Gross Total Value'}
                </span>
                <span className="text-2xl md:text-3xl font-serif font-black tracking-tight block text-teal-600 dark:text-teal-400">
                  {totalGross.toLocaleString()} <span className="text-sm font-bold">{isAr ? 'ريال' : 'SAR'}</span>
                </span>
                <span className="text-[10px] text-slate-500 font-extrabold block">
                  {isAr ? 'مجموع قيمة جميع طلبات النظام' : 'All created proposals added up'}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-700 font-bold leading-relaxed max-w-xl">
              {isAr 
                ? 'لوحة تحليل إيرادات منصة مدار الرقمية، لضمان تدفق مالي شفاف وموثوق وتتبع كافة المدفوعات المسددة والمعلقة.'
                : 'Ledger stream analyzing Madar Digital operations income flow, highlighting completed settlements and tracking outstanding pending cases.'}
            </p>
          </div>

          <div className="flex items-center gap-2 mt-6 pt-6 border-t border-slate-100 dark:border-sage-850 text-xs text-slate-700 font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 select-none" />
            <span>{isAr ? 'نظام الأرباح متوافق مع معايير الأمان والتحليلات لمدار.' : 'Security-compliant smart operational ledger interface.'}</span>
          </div>
        </div>

        {/* Supporting stats block */}
        <div className="space-y-4" id="supporting-stats-sidebar">
          
          {/* Stat 1: Total Orders Count */}
          <div className={`p-5 rounded-2xl border flex items-center justify-between ${
            theme === 'dark' ? 'bg-sage-900/20 border-sage-850' : 'bg-white border-cream-200'
          }`}>
            <div className="space-y-1">
              <span className="text-xs text-slate-800 font-bold block">{isAr ? 'إجمالي الطلبات' : 'Total Orders Registered'}</span>
              <span className="text-xl font-extrabold font-serif text-slate-900 dark:text-white">
                {orders.length} <span className="text-xs font-extrabold text-slate-800">{isAr ? 'طلب' : 'Requests'}</span>
              </span>
            </div>
            <div className="p-2.5 bg-slate-150 dark:bg-slate-800 text-slate-800 dark:text-slate-400 rounded-xl">
              <Briefcase className="w-5 h-5 text-emerald-600" />
            </div>
          </div>

          {/* Stat 2: Paid Orders */}
          <div className={`p-5 rounded-2xl border flex items-center justify-between ${
            theme === 'dark' ? 'bg-sage-900/20 border-sage-850' : 'bg-white border-cream-200'
          }`}>
            <div className="space-y-1">
              <span className="text-xs text-slate-800 font-bold block">{isAr ? 'الطلبات المدفوعة' : 'Paid Orders'}</span>
              <span className="text-xl font-extrabold font-serif text-slate-900 dark:text-white">
                {paidOrdersCount} <span className="text-xs font-extrabold text-slate-800">{isAr ? 'طلب' : 'Paid'}</span>
              </span>
            </div>
            <div className="p-2.5 bg-slate-150 dark:bg-slate-800 text-slate-800 dark:text-slate-400 rounded-xl">
              <CreditCard className="w-5 h-5 text-emerald-600" />
            </div>
          </div>

          {/* Stat 3: Completed Orders */}
          <div className={`p-5 rounded-2xl border flex items-center justify-between ${
            theme === 'dark' ? 'bg-sage-900/20 border-sage-850' : 'bg-white border-cream-200'
          }`}>
            <div className="space-y-1">
              <span className="text-xs text-slate-800 font-bold block">{isAr ? 'الطلبات المنتهية ١٠٠٪' : 'Completed (100%)'}</span>
              <span className="text-xl font-extrabold font-serif text-slate-900 dark:text-white">
                {completedOrdersCount} <span className="text-xs font-extrabold text-slate-800">{isAr ? 'طلب' : 'Completed'}</span>
              </span>
            </div>
            <div className="p-2.5 bg-slate-150 dark:bg-slate-800 text-slate-800 dark:text-slate-400 rounded-xl">
              <Activity className="w-5 h-5 text-emerald-600 shadow-xs" />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
