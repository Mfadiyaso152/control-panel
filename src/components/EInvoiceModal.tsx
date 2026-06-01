import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { FileText, Printer, CheckCircle, X, Receipt, Shield, Building2, User, Download } from 'lucide-react';
import { Order, Language } from '../types';
import { DICTIONARY } from '../data';

interface EInvoiceModalProps {
  order: Order;
  language: Language;
  onClose: () => void;
  autoPrint?: boolean;
}

export default function EInvoiceModal({ order, language, onClose, autoPrint = false }: EInvoiceModalProps) {
  const t = DICTIONARY[language];
  
  const originalPriceToUse = order.originalPrice || order.price;
  const discountPercent = order.discount || 0;
  const totalAmount = order.price;

  // Format date elegantly
  const invoiceDate = new Date(order.date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const handlePrint = () => {
    window.print();
  };

  // Auto trigger system print/download if requested
  useEffect(() => {
    if (autoPrint) {
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [autoPrint]);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/60 backdrop-blur-sm cursor-pointer select-none" 
      id="invoice-modal-backdrop"
      onClick={onClose}
    >
      <motion.div
        id="invoice-modal-content"
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the invoice
        className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden text-slate-800 font-sans print:shadow-none print:p-0 cursor-default scale-90 sm:scale-95 md:scale-100 origin-center"
      >
        {/* Top Control Bar - Compact & Hidden on Print */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 bg-slate-50 print:hidden" id="invoice-controls">
          <div className="flex items-center gap-1">
            <Receipt className="w-3.5 h-3.5 text-sage-600" />
            <span className="font-bold text-[10px] text-slate-700">
              {language === 'ar' ? 'معاينة الفاتورة' : 'Official Project Invoice'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              id="print-btn"
              onClick={handlePrint}
              className="flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold text-white transition-colors bg-sage-600 rounded-md cursor-pointer hover:bg-sage-700 shadow-sm shadow-sage-600/10"
            >
              <Download className="w-2.5 h-2.5" />
              <span>{language === 'ar' ? 'تحميل (PDF)' : 'Download (PDF)'}</span>
            </button>
            <button
              id="close-invoice-btn"
              onClick={onClose}
              className="p-1 transition-colors rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 flex items-center gap-0.5 text-[9px]"
              title={language === 'ar' ? 'إغلاق' : 'Close'}
            >
              <span className="font-bold">{language === 'ar' ? 'إغلاق' : 'Close'}</span>
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* COMPACT Printable Area starts here */}
        <div className="p-3 md:p-4 space-y-3 print:p-0" id="invoice-print-area">
          {/* Invoice Header - Highly Compact */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-2 border-b border-slate-100 pb-2">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1">
                <div className="w-6 h-6 bg-sage-600 rounded-md flex items-center justify-center text-white font-bold text-xs shadow-md shadow-sage-600/15 select-none text-center">
                  س
                </div>
                <div className="leading-none">
                  <h1 className="text-xs font-serif font-black tracking-tight text-slate-900">SAUDI CORE</h1>
                  <span className="text-[7px] uppercase tracking-wider text-sage-600 font-bold block leading-none">Creative Software Studio</span>
                </div>
              </div>
              <p className="text-[8px] text-slate-400 font-sans leading-tight">
                Saudi Core Advanced Software Platforms.<br />
                Kingdom of Saudi Arabia, Riyadh City.
              </p>
            </div>

            {/* Right side Metadata */}
            <div className="text-left sm:text-right space-y-0.5 leading-none">
              <span className="inline-flex items-center px-1 py-0.2 rounded-full text-[7px] font-bold bg-sage-50 text-sage-700 uppercase border border-sage-100">
                Verified System Bill
              </span>
              <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-tight block mt-0.5">{language === 'ar' ? 'فاتورة حساب مشروع' : 'PROJECT INVOICE'}</h2>
              <p className="text-[9px]">
                <span className="text-slate-400">{language === 'ar' ? 'رقم الفاتورة:' : 'Invoice ID:'}</span> <strong className="font-bold text-slate-700">INV-{order.id}</strong>
              </p>
              <p className="text-[9px]">
                <span className="text-slate-400">{language === 'ar' ? 'التاريخ:' : 'Date:'}</span> <span className="font-medium text-slate-600">{invoiceDate}</span>
              </p>
              <p className="text-[9px]">
                <span className="text-slate-400">{language === 'ar' ? 'حالة السداد:' : 'Status:'}</span> <span className="font-bold text-emerald-600">{order.paymentStatus.toUpperCase()}</span>
              </p>
            </div>
          </div>

          {/* Client & Contractor Details - Tight Margins */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-cream-100/60 p-2.5 rounded-xl border border-cream-200">
            <div>
              <span className="text-[8px] font-bold uppercase tracking-wider text-sage-600 block mb-0.5 font-sans flex items-center gap-0.5 leading-none">
                <Building2 className="w-2.5 h-2.5 text-sage-500" /> Seller / Issuer
              </span>
              <h4 className="font-bold text-slate-800 text-[9px]">Saudi Core Operations Agency</h4>
              <p className="text-[8px] text-slate-400 leading-tight mt-0.5">
                Riyadh Governorate, King Fahd Rd<br />
                operations@saudicore.sa
              </p>
            </div>
            <div>
              <span className="text-[8px] font-bold uppercase tracking-wider text-sage-600 block mb-0.5 font-sans flex items-center gap-0.5 leading-none">
                <User className="w-2.5 h-2.5 text-sage-500" /> Purchaser / Client
              </span>
              <h4 className="font-bold text-slate-800 text-[9px]">{order.clientName}</h4>
              <p className="text-[8px] text-slate-400 leading-tight mt-0.5 font-sans">
                Client Phone: <strong className="font-semibold text-slate-600">{order.clientPhone}</strong><br />
                <span className="text-slate-500 truncate block max-w-[120px]">{order.clientEmail}</span>
              </p>
            </div>
          </div>

          {/* Line Items Table - Ultra Simple */}
          <div className="overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[8px] font-bold text-slate-450 uppercase tracking-wider">
                  <th className="py-1 pl-1">{language === 'ar' ? 'الخدمة ونطاق العمل' : 'Service & Scope Description'}</th>
                  <th className="py-1 text-right w-10">{language === 'ar' ? 'الكمية' : 'Qty'}</th>
                  <th className="py-1 text-right w-16">{language === 'ar' ? 'السعر' : 'Price'}</th>
                  <th className="py-1 text-right w-20 pr-1">{language === 'ar' ? 'المجموع' : 'Total'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[9px]">
                <tr className="text-slate-800 font-sans">
                  <td className="py-2 pl-1 alignment-baseline">
                    <div className="font-bold text-slate-900 text-[10px] leading-tight">{order.titleEnglish}</div>
                    <div className="text-[8px] text-slate-400 mt-0.5 leading-snug truncate max-w-[170px]">{order.descriptionEnglish}</div>
                    <div className="text-[9px] text-sage-600 font-arabic mt-0.5 font-medium" dir="rtl">
                      {order.titleArabic}: {order.descriptionArabic}
                    </div>
                  </td>
                  <td className="py-2 text-right font-medium text-slate-500">1</td>
                  <td className="py-2 text-right font-medium text-slate-500">{originalPriceToUse.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  <td className="py-2 text-right pr-1 font-bold text-slate-800">
                    {originalPriceToUse.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Financial Totals & Compact QR Block */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 border-t border-slate-100 pt-2.5">
            {/* Project Secure QR Block */}
            <div className="flex items-center gap-2 border border-slate-100 p-1.5 rounded-lg bg-slate-50/50">
              {/* QR Code SVG */}
              <div className="w-10 h-10 bg-white border border-slate-200 rounded p-0.5 flex items-center justify-center relative shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full text-slate-800">
                  <rect x="5" y="5" width="20" height="20" fill="currentColor" />
                  <rect x="8" y="8" width="14" height="14" fill="white" />
                  <rect x="11" y="11" width="8" height="8" fill="currentColor" />

                  <rect x="75" y="5" width="20" height="20" fill="currentColor" />
                  <rect x="78" y="8" width="14" height="14" fill="white" />
                  <rect x="81" y="11" width="8" height="8" fill="currentColor" />

                  <rect x="5" y="75" width="20" height="20" fill="currentColor" />
                  <rect x="8" y="78" width="14" height="14" fill="white" />
                  <rect x="11" y="81" width="8" height="8" fill="currentColor" />

                  <rect x="35" y="10" width="6" height="6" fill="currentColor" />
                  <rect x="50" y="15" width="10" height="6" fill="currentColor" />
                  <rect x="65" y="8" width="6" height="12" fill="currentColor" />
                  
                  <rect x="10" y="35" width="12" height="6" fill="currentColor" />
                  <rect x="30" y="30" width="8" height="8" fill="currentColor" />
                  <rect x="45" y="35" width="14" height="6" fill="currentColor" />
                  <rect x="65" y="30" width="8" height="14" fill="currentColor" />

                  <rect x="30" y="50" width="14" height="8" fill="currentColor" />
                  <rect x="55" y="55" width="8" height="12" fill="currentColor" />
                  <rect x="75" y="50" width="12" height="6" fill="currentColor" />
                  <rect x="15" y="60" width="8" height="6" fill="currentColor" />

                  <rect x="35" y="75" width="10" height="10" fill="currentColor" />
                  <rect x="55" y="80" width="14" height="6" fill="currentColor" />
                  <rect x="75" y="75" width="6" height="12" fill="currentColor" />
                </svg>
                <span className="absolute inset-0 m-auto w-2.5 h-2.5 bg-sage-600 rounded-xs flex items-center justify-center text-[4px] font-black text-white font-serif">S</span>
              </div>
              <div className="space-y-0.5 leading-snug">
                <span className="text-[7px] uppercase font-bold text-sage-600 block">{language === 'ar' ? 'هوية العقد الإلكتروني' : 'Contract Integrity'}</span>
                <p className="text-[8px] text-slate-400 max-w-[130px] leading-tight">
                  {language === 'ar' 
                    ? 'رمز استجابة للتحقق.'
                    : 'System-generated project code.'}
                </p>
              </div>
            </div>

            {/* Calculations column */}
            <div className="w-full sm:w-36 space-y-0.5 text-right leading-none">
              <div className="flex justify-between text-[9px]">
                <span className="text-slate-450">{language === 'ar' ? 'المجموع الأساسي:' : 'Subtotal:'}</span>
                <span className="font-semibold text-slate-700">{originalPriceToUse.toLocaleString('en-US', { minimumFractionDigits: 2 })} SAR</span>
              </div>

              {discountPercent > 0 && (
                <div className="flex justify-between text-[9px] text-rose-500 font-bold">
                  <span>{language === 'ar' ? `خصم (${discountPercent}%):` : `Discount (${discountPercent}%):`}</span>
                  <span>- {((originalPriceToUse * discountPercent) / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })} SAR</span>
                </div>
              )}
              
              <div className="border-t border-slate-100 my-0.5 pt-1 flex justify-between text-[10px]">
                <span className="font-bold text-slate-800">{language === 'ar' ? 'المبلغ المستحق:' : 'Total net amount:'}</span>
                <span className="font-bold text-sage-700 text-xs">{totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} SAR</span>
              </div>
            </div>
          </div>

          {/* Footer of invoice - compact */}
          <div className="border-t border-slate-100 pt-2 text-center text-[8px] text-slate-400 font-sans space-y-0.5 leading-tight">
            <p className="font-bold text-slate-500">Thank you for partnering with Saudi Core Development Platform.</p>
          </div>

          {/* Explicit Exit Action Block at the bottom - Hidden on Print */}
          <div className="flex justify-center pt-1 print:hidden">
            <button
              id="bottom-invoice-exit-btn"
              onClick={onClose}
              className="px-3 py-1 border border-slate-100 hover:bg-slate-50 text-slate-400 font-bold rounded-lg text-[9px] transition-colors cursor-pointer"
            >
              {language === 'ar' ? 'إغلاق المعاينة والرجوع' : 'Close and Return'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
