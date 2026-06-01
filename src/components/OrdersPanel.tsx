import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Sliders, Clock, Check, 
  Link as LinkIcon, FileCheck, Plus, 
  Send, Phone, Mail, FileText, Trash2, Activity, ShieldCheck, HelpCircle, Eye,
  User, Hash, MessageSquare, AlertCircle, CheckCircle2, X, ChevronDown, Download
} from 'lucide-react';
import { Order, Attachment, Language, Theme, ServiceItem } from '../types';
import { DICTIONARY } from '../data';

// User defined Saudi Core Services & Pricing Catalog
export const SAUDICORE_SERVICES = [
  { id: "srv-1", titleArabic: "تصميم شعار", titleEnglish: "Logo Design", price: 50 },
  { id: "srv-2", titleArabic: "تصميم بروفايل", titleEnglish: "Profile Design", price: 100 },
  { id: "srv-3", titleArabic: "تصميم دعوات", titleEnglish: "Invitations Design", price: 25 },
  { id: "srv-4", titleArabic: "تصميم كرت", titleEnglish: "Business Card Design", price: 25 },
  { id: "srv-5", titleArabic: "تصميم صفحات سوشل ميديا", titleEnglish: "Social Media Posts", price: 50 },
  { id: "srv-6", titleArabic: "برمجة موقع للعرض فقط", titleEnglish: "Showcase Website (View only)", price: 200 },
  { id: "srv-7", titleArabic: "برمجة موقع مع سيرفر", titleEnglish: "Dynamic Custom Web System", price: 500 },
  { id: "srv-8", titleArabic: "نشر موقع على قوقل بلاي", titleEnglish: "Deploy to Google Play", price: 150 },
  { id: "srv-9", titleArabic: "نشر موقع على الويب", titleEnglish: "Deploy to Web Host", price: 100 },
  { id: "srv-10", titleArabic: "نشر موقع ببحث قوقل", titleEnglish: "Index Site on Google", price: 100 },
  { id: "srv-11", titleArabic: "اضافة دومين مخصص", titleEnglish: "Custom Domain Connection", price: 50 },
  { id: "srv-12", titleArabic: "برمجة لعبه للايفون", titleEnglish: "iOS Game Development", price: 250 },
  { id: "srv-13", titleArabic: "برمجة لعبه للاندرويد", titleEnglish: "Android Game Development", price: 200 },
  { id: "srv-14", titleArabic: "برمجة لعبه اونلاين", titleEnglish: "Online Multiplayer Game", price: 550 },
  { id: "srv-15", titleArabic: "ربط الموقع بسيرفر", titleEnglish: "API & DB Server Integration", price: 400 },
  { id: "srv-16", titleArabic: "نشر موقع على ابل ستور", titleEnglish: "Index to Apple App Store", price: 600 },
  { id: "srv-17", titleArabic: "باقة الشركات", titleEnglish: "Corporate Starter Package", price: 300 },
  { id: "srv-18", titleArabic: "باقة ٢", titleEnglish: "Special Creator Pack 2", price: 200 },
  { id: "srv-19", titleArabic: "باقة موقع و بروفايل", titleEnglish: "Showcase Web & Profiles Combo", price: 250 },
  { id: "srv-20", titleArabic: "باقة بريميوم", titleEnglish: "Ultra Premium Fullsite Package", price: 550 }
];

interface OrdersPanelProps {
  orders: Order[];
  updateOrder: (updated: Order) => void;
  addOrder: (newOrder: Order) => void;
  deleteOrder: (id: string) => void;
  language: Language;
  theme: Theme;
  tab: 'search' | 'active_orders' | 'completed_orders';
  onViewInvoice: (order: Order, autoDownload?: boolean) => void;
}

export default function OrdersPanel({
  orders,
  updateOrder,
  addOrder,
  deleteOrder,
  language,
  theme,
  tab,
  onViewInvoice
}: OrdersPanelProps) {
  const t = DICTIONARY[language];
  const isAr = language === 'ar';

  // Toggle accordion card details
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Search department state
  const [localSearchQuery, setLocalSearchQuery] = useState('');

  // Floating messages drawer inside order card
  const [activeMessagingOrderId, setActiveMessagingOrderId] = useState<string | null>(null);
  const [selectedMessageTemplate, setSelectedMessageTemplate] = useState<'progress50' | 'completed100' | 'paymentReminder'>('progress50');
  const [customMessageText, setCustomMessageText] = useState('');

  // Deliverables local upload states
  const [attachName, setAttachName] = useState('');
  const [attachUrl, setAttachUrl] = useState('');
  const [attachType, setAttachType] = useState<'file' | 'link'>('file');
  const [isUploading, setIsUploading] = useState(false);

  // New Order Overlay modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newOrderIdInput, setNewOrderIdInput] = useState('');
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [selectedServices, setSelectedServices] = useState<typeof SAUDICORE_SERVICES>([]);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [newPaymentStatus, setNewPaymentStatus] = useState<'paid' | 'pending' | 'refunded'>('pending');
  const [newOrderStatus, setNewOrderStatus] = useState<'new' | 'processing' | 'completed' | 'cancelled'>('new');
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);

  // Format phone number to clean digits for WhatsApp links
  const formatSaudiPhoneForWhatsApp = (phoneStr: string) => {
    let digits = phoneStr.replace(/\D/g, '');
    if (digits.startsWith('00966')) {
      digits = '966' + digits.slice(5);
    } else if (digits.startsWith('05')) {
      digits = '966' + digits.slice(1);
    } else if (digits.length === 9 && digits.startsWith('5')) {
      digits = '966' + digits;
    }
    return digits.startsWith('966') ? digits : '966' + digits;
  };

  // Automated price calculations for Checked services in Creation form
  const originalServicesSum = useMemo(() => {
    return selectedServices.reduce((sum, item) => sum + item.price, 0);
  }, [selectedServices]);

  // Adjust pre-filled states when standard service is checked/toggled
  const handleToggleService = (srv: typeof SAUDICORE_SERVICES[0]) => {
    const exists = selectedServices.find(s => s.id === srv.id);
    if (exists) {
      setSelectedServices(prev => prev.filter(s => s.id !== srv.id));
    } else {
      setSelectedServices(prev => [...prev, srv]);
    }
  };

  // Pre-populate project title and description from checked services
  useEffect(() => {
    if (selectedServices.length > 0) {
      const titlesAr = selectedServices.map(s => s.titleArabic).join(' + ');
      const titlesEn = selectedServices.map(s => s.titleEnglish).join(' + ');
      setNewProjectTitle(isAr ? titlesAr : titlesEn);
      
      const descsAr = selectedServices.map(s => s.titleArabic + ` (${s.price} ريال)`).join(' - ');
      setNewProjectDesc(isAr ? `تتضمن خدمات: ${descsAr}` : `Includes: ${titlesEn}`);
    }
  }, [selectedServices, isAr]);

  const finalCalculatedPrice = useMemo(() => {
    const discountMultiplier = (100 - discountPercent) / 100;
    return Math.max(0, Math.round(originalServicesSum * discountMultiplier));
  }, [originalServicesSum, discountPercent]);

  // Handle Order Submit and save securely
  const handleCreateOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrderIdInput.trim()) {
      alert(isAr ? 'برجاء تزويد رقم طلب معتمد للتسجيل!' : 'Please supply an authorized Order Number!');
      return;
    }
    if (!newClientName.trim()) {
      alert(isAr ? 'برجاء تزويد اسم عميل لتأكيد التسجيل!' : 'Please supply client name!');
      return;
    }

    const typedId = newOrderIdInput.trim().toUpperCase();
    // Validate duplicates
    const isDuplicate = orders.some(o => o.id === typedId);
    if (isDuplicate) {
      alert(isAr ? 'عذراً، رقم الطلب هذا موجود مسبقاً بالنظام!' : 'Sorry, this Order Number is already registered!');
      return;
    }

    const orderObj: Order = {
      id: typedId,
      clientName: newClientName,
      clientPhone: newClientPhone || '+966500000000',
      clientEmail: newClientEmail || `${typedId}@saudicore-client.com`,
      titleArabic: newProjectTitle || (isAr ? 'طلب برمجيات سعودي كور المخصصة' : 'Saudi Core Custom Development Work'),
      titleEnglish: newProjectTitle || 'Saudi Core Custom Development Work',
      descriptionArabic: newProjectDesc || (isAr ? 'تفاصيل الطلب والتحليلات الخاصة بسعودي كور' : 'Scope and details of Saudi Core order'),
      descriptionEnglish: newProjectDesc || 'Saudi Core custom system requirements',
      date: new Date().toISOString(),
      price: finalCalculatedPrice,
      originalPrice: originalServicesSum,
      discount: discountPercent,
      progress: newOrderStatus === 'completed' ? 100 : 0,
      paymentStatus: newPaymentStatus,
      invoiceStatus: newPaymentStatus === 'paid' ? 'generated' : 'draft',
      orderStatus: newOrderStatus,
      attachments: [],
      services: selectedServices.map(s => ({
        id: s.id,
        titleArabic: s.titleArabic,
        titleEnglish: s.titleEnglish,
        descriptionArabic: s.titleArabic,
        descriptionEnglish: s.titleEnglish,
        price: s.price
      }))
    };

    addOrder(orderObj);

    // Reset Creation form fields
    setNewOrderIdInput('');
    setNewClientName('');
    setNewClientPhone('');
    setNewClientEmail('');
    setNewProjectTitle('');
    setNewProjectDesc('');
    setSelectedServices([]);
    setDiscountPercent(0);
    setNewPaymentStatus('pending');
    setNewOrderStatus('new');
    setIsCreateOpen(false);
  };

  // Filter orders based on active tab requirements
  const displayOrders = useMemo(() => {
    if (tab === 'active_orders') {
      // In progress orders (progress < 100%)
      return orders.filter(o => o.progress < 100 && o.orderStatus !== 'completed');
    } else if (tab === 'completed_orders') {
      // Completed orders (progress === 100%)
      return orders.filter(o => o.progress === 100 || o.orderStatus === 'completed');
    } else {
      // Search view
      const query = localSearchQuery.trim().toLowerCase();
      if (!query) return []; // Only display search results when there is input
      return orders.filter(o => 
        o.id.toLowerCase().includes(query) || 
        o.clientName.toLowerCase().includes(query) ||
        o.titleArabic.toLowerCase().includes(query) ||
        o.titleEnglish.toLowerCase().includes(query)
      );
    }
  }, [orders, tab, localSearchQuery]);

  // Handle interactive slider or quick progression shortcuts
  const handleProgressChange = (order: Order, val: number) => {
    const updated = { ...order, progress: val };
    if (val === 100) {
      updated.orderStatus = 'completed';
    } else if (val < 100 && order.orderStatus === 'completed') {
      updated.orderStatus = 'processing';
    }
    updateOrder(updated);
  };

  const handlePaymentStatusChange = (order: Order, status: 'paid' | 'pending' | 'refunded') => {
    updateOrder({ ...order, paymentStatus: status, invoiceStatus: status === 'paid' ? 'generated' : 'draft' });
  };

  const handleOrderStatusChange = (order: Order, status: 'new' | 'processing' | 'completed' | 'cancelled') => {
    const updated = { ...order, orderStatus: status };
    if (status === 'completed') {
      updated.progress = 100;
    }
    updateOrder(updated);
  };

  // Handle adding deliverables files & URLs
  const handleLoadAttachmentSubmit = (order: Order, e: React.FormEvent) => {
    e.preventDefault();
    if (!attachName.trim()) return;

    setIsUploading(true);
    setTimeout(() => {
      const newAtt: Attachment = {
        id: 'att-' + Date.now().toString().slice(-4),
        name: attachName.trim(),
        url: attachUrl.trim() || `https://saudicore.vercel.app/deliveries/${Date.now()}`,
        type: attachType,
        createdAt: new Date().toISOString()
      };

      const revisedAttachments = [...(order.attachments || []), newAtt];
      updateOrder({
        ...order,
        attachments: revisedAttachments
      });

      setAttachName('');
      setAttachUrl('');
      setIsUploading(false);
    }, 850);
  };

  const handleDeleteAttachment = (order: Order, attachId: string) => {
    const updated = (order.attachments || []).filter(a => a.id !== attachId);
    updateOrder({ ...order, attachments: updated });
  };

  // Synchronize WhatsApp template text
  const populateWhatsAppPreviewText = (order: Order, templateType: typeof selectedMessageTemplate) => {
    const prgText = `مرحباً ${order.clientName}! نود إبلاغك بأنه تم إنجاز ٥٠٪ من طلبك رقم (${order.id}) لمشروع (${order.titleArabic}) بنجاح. نحن نعمل بجد للتسليم بأبهى حلة. شكراً لثقتك بسعودي كور ✨`;
    const cmpText = `عملينا المميز ${order.clientName}! نود تهنئتك بإكمال طلبك رقم (${order.id}) لمشروع (${order.titleArabic}) بنسبة ١٠٠٪ تماماً! نسعد بخدمتك دائماً ونراك في مشاريع قادمة ✨`;
    const payText = `مرحباً ${order.clientName}، نود تذكيرك بلطف لاستكمال دفعة طلبك رقم (${order.id}) لمشروع (${order.titleArabic}) لمتابعة التجهيز والتسليم بشكل نهائي. شكراً لتفهمك وتجاوبك ✨`;

    if (templateType === 'progress50') return prgText;
    if (templateType === 'completed100') return cmpText;
    return payText;
  };

  // Toggle messaging options pane
  const handleOpenMessaging = (order: Order) => {
    setActiveMessagingOrderId(order.id);
    setSelectedMessageTemplate('progress50');
    setCustomMessageText(populateWhatsAppPreviewText(order, 'progress50'));
  };

  const handleTemplateChange = (order: Order, type: typeof selectedMessageTemplate) => {
    setSelectedMessageTemplate(type);
    setCustomMessageText(populateWhatsAppPreviewText(order, type));
  };

  const handleSendWhatsAppSubmit = (order: Order) => {
    const formattedNum = formatSaudiPhoneForWhatsApp(order.clientPhone);
    const apiTarget = `https://api.whatsapp.com/send?phone=${formattedNum}&text=${encodeURIComponent(customMessageText)}`;
    window.open(apiTarget, '_blank');
    setActiveMessagingOrderId(null);
  };

  return (
    <div className="space-y-6" id="saudicore-orders-desk">
      
      {/* 1. Header/Toolbar context depending on selected Tab */}
      {tab === 'active_orders' && (
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 py-3" id="active-panel-heading">
          <div>
            <h2 className="text-lg font-serif font-bold text-sage-800 dark:text-sage-300">
              {isAr ? 'إدارة الطلبات الجارية والمشاريع' : 'Active Client Orders Desk'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isAr 
                ? 'متابعة مراحل التنفيذ، الدفعات، ورفع تسليمات العملاء للطلبات الجارية حالياً' 
                : 'Follow current deliverables status, update progress values, index invoices and print PDFs'}
            </p>
          </div>
          <button
            id="new-order-create-btn"
            onClick={() => {
              setSelectedServices([]);
              setNewOrderIdInput(`SC-${Math.floor(100 + Math.random() * 900)}`);
              setNewClientName('');
              setNewClientPhone('');
              setNewClientEmail('');
              setNewProjectTitle('');
              setNewProjectDesc('');
              setDiscountPercent(0);
              setIsCreateOpen(true);
            }}
            className="flex items-center gap-1.5 px-6 py-3 bg-sage-600 hover:bg-sage-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-sage-600/15 cursor-pointer transform hover:scale-[1.01]"
          >
            <Plus className="w-4 h-4" />
            <span>{isAr ? 'إنشاء طلب جديد' : 'Register New Order'}</span>
          </button>
        </div>
      )}

      {tab === 'completed_orders' && (
        <div className="py-3 border-b border-cream-150 dark:border-sage-900" id="completed-panel-heading">
          <h2 className="text-lg font-serif font-bold text-emerald-600">
            {isAr ? 'سجل الطلبات المكتملة المنتهية' : 'Completed Projects Registry (100%)'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isAr 
              ? 'الأرشيف المعتمد لكافة المشاريع التي تم تسليمها للعملاء وإنجازها بالكامل' 
              : 'Indexed database of successfully finalized applications and visually perfect drafts'}
          </p>
        </div>
      )}

      {tab === 'search' && (
        <div className="flex flex-col items-center justify-center py-12 px-4 max-w-xl mx-auto space-y-6" id="centralized-search-depart">
          <div className="text-center space-y-1">
            <h2 className="text-xl font-serif font-bold text-sage-800 dark:text-sage-350">
              {isAr ? 'البحث عن طلبات ومشاريع' : 'Saudi Core Central Search'}
            </h2>
            <p className="text-xs text-slate-500">
              {isAr 
                ? 'أدخل رقم الطلب أو اسم مشروع العميل في الخانة بالأسفل للمطابقة السريعة' 
                : 'Lookup unified client profile database by entering order ID or project names'}
            </p>
          </div>

          <div className="w-full relative" id="centered-search-box">
            <Search className={`absolute inset-y-0 ${isAr ? 'right-4' : 'left-4'} m-auto w-5 h-5 text-slate-400`} />
            <input
              type="text"
              value={localSearchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value)}
              placeholder={isAr ? 'مثال: SC-405 أو اسم العميل...' : 'e.g. SC-102 or client name...'}
              className={`w-full p-4 ${isAr ? 'pr-12 pl-4' : 'pl-12 pr-4'} text-sm font-semibold rounded-2xl border outline-none shadow-md transition-all duration-300
                ${theme === 'dark' 
                  ? 'bg-sage-900/60 border-sage-850 text-white focus:border-sage-600 focus:bg-sage-900/40' 
                  : 'bg-white border-cream-220 text-cream-900 focus:border-sage-500 focus:shadow-lg'
                }`}
            />
          </div>
        </div>
      )}

      {/* 2. Unified Orders list representation */}
      {displayOrders.length === 0 ? (
        <div className={`p-10 rounded-2xl border text-center space-y-3 ${
          theme === 'dark' ? 'bg-sage-900/10 border-sage-900/30' : 'bg-white border-cream-200'
        }`} id="orders-empty-state">
          <AlertCircle className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto animate-bounce" />
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wi">
            {tab === 'search' 
              ? (localSearchQuery ? (isAr ? 'لم يتم العثور على أي نتائج مطابقة للبحث' : 'No records match search') : (isAr ? 'الرجاء إدخال كلمات البحث بالجهة العلوية لعرض النتائج' : 'Please provide search keywords to find items'))
              : (isAr ? 'لا توجد طلبات مسجلة في هذا القسم حالياً' : 'No orders found inside this ledger')}
          </h3>
          <p className="text-[11px] text-slate-400 max-w-sm mx-auto leading-relaxed">
            {tab === 'active_orders' && (isAr ? 'يمكنك الضغط على زر "إنشاء طلب جديد" لتسجيل معاملة عميل وتحديد خدماته.' : 'Get started by creating a client metadata request.')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6" id="orders-cards-stack">
          {displayOrders.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            return (
              <div
                key={order.id}
                id={`card-${order.id}`}
                className={`rounded-2xl border overflow-hidden transition-all duration-300 ${
                  isExpanded 
                    ? theme === 'dark'
                      ? 'bg-sage-900/40 border-sage-700 shadow-xl shadow-black/30'
                      : 'bg-white border-sage-400 shadow-lg shadow-sage-600/10'
                    : theme === 'dark'
                      ? 'bg-sage-900/15 border-sage-900 hover:border-sage-800 text-white'
                      : 'bg-white border-cream-180 hover:border-cream-300 text-cream-850 shadow-xs'
                }`}
              >
                
                {/* Expandable Header block */}
                <div
                  onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                  className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer select-none"
                  id={`card-header-${order.id}`}
                >
                  
                  {/* Left: ID & Title & client */}
                  <div className="space-y-1 leading-normal flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono font-bold bg-sage-100 dark:bg-sage-900 px-2.5 py-0.5 rounded-full text-sage-700 dark:text-sage-350 tracking-wider">
                        #{order.id}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        order.paymentStatus === 'paid' 
                          ? 'bg-emerald-500/10 text-emerald-600' 
                          : order.paymentStatus === 'pending'
                            ? 'bg-amber-500/10 text-amber-500'
                            : 'bg-slate-300/30 text-slate-500'
                      }`}>
                        {order.paymentStatus === 'paid' ? (isAr ? 'تم سداد الدفعة' : 'Paid') : (isAr ? 'بانتظار السداد' : 'Pending')}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md bg-sage-500/10 text-sage-600`}>
                        {order.progress}% {isAr ? 'إنجاز' : 'Done'}
                      </span>
                    </div>

                    <h3 className="font-serif font-black text-sm text-slate-800 dark:text-white pt-1">
                      {isAr ? order.titleArabic : order.titleEnglish}
                    </h3>

                    <div className="flex items-center gap-2.5 text-xs text-slate-400 pt-0.5">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <strong>{order.clientName}</strong>
                      </span>
                      <span>•</span>
                      <span>{new Date(order.date).toLocaleDateString(isAr ? 'ar-SA' : 'en-US')}</span>
                    </div>
                  </div>

                  {/* Right: Net Price & Expansion chevron */}
                  <div className="flex items-center gap-4 self-end md:self-center">
                    <div className="text-right leading-tight">
                      <span className="text-[10px] text-slate-400 block uppercase tracking-wider">{isAr ? 'تكلفة الطلب الصافية' : 'Net due billing'}</span>
                      <strong className="text-base font-bold text-sage-700 dark:text-sage-350">
                        {order.price.toLocaleString()} {isAr ? 'ريال' : 'SAR'}
                      </strong>
                    </div>

                    <div className={`p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 text-slate-400 transition-transform ${
                      isExpanded ? 'rotate-180' : ''
                    }`}>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>

                </div>

                {/* Expanded Details body */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className={`border-t transition-all ${theme === 'dark' ? 'border-sage-900 bg-sage-950/20' : 'border-cream-150 bg-cream-100/30'}`}
                    >
                      <div className="p-6 space-y-8 text-sm">
                        
                        {/* Scope details & checked services */}
                        <div className="space-y-3" id={`order-services-list-${order.id}`}>
                          <h4 className="text-xs font-bold text-sage-600 uppercase tracking-wider border-b pb-1 border-dotted border-cream-205 dark:border-sage-850">
                            {isAr ? 'تفاصيل نطاق العمل والخدمات المختارة' : 'Selected Services & Requirements'}
                          </h4>

                          {order.services && order.services.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {order.services.map((srv, index) => (
                                <div key={srv.id || index} className={`p-3 rounded-xl border ${
                                  theme === 'dark' ? 'bg-sage-950/60 border-sage-900 text-white' : 'bg-white border-cream-200 text-cream-800'
                                }`}>
                                  <div className="flex justify-between items-center">
                                    <strong className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                      {isAr ? srv.titleArabic : srv.titleEnglish}
                                    </strong>
                                    <span className="text-[10px] font-mono bg-sage-100 dark:bg-sage-900 text-sage-600 px-2 py-0.5 rounded font-bold">
                                      {srv.price} {isAr ? 'ريال' : 'SAR'}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-slate-400 italic">
                              {isAr ? order.descriptionArabic : order.descriptionEnglish}
                            </p>
                          )}
                        </div>

                        {/* Order Controllers (slider, payments, invoice) */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id={`order-actions-grid-${order.id}`}>
                          
                          {/* Col 1: Progress Tracker slider */}
                          <div className={`p-4 rounded-xl border space-y-4 ${
                            theme === 'dark' ? 'bg-sage-950/30 border-sage-850' : 'bg-white border-cream-200'
                          }`}>
                            <div className="flex items-center justify-between border-b pb-1.5 border-cream-150 dark:border-sage-900">
                              <h5 className="font-bold text-slate-700 dark:text-slate-400 flex items-center gap-1.5 text-xs">
                                <Activity className="w-4 h-4 text-sage-600" />
                                <span>{isAr ? 'رصد نسبة تقدم العمل' : 'Project Completion Progress'}</span>
                              </h5>
                              <span className="text-xs font-bold text-sage-600 font-mono">{order.progress}%</span>
                            </div>

                            <div className="space-y-4 pt-1">
                              <input
                                type="range"
                                min="0"
                                max="100"
                                step="10"
                                value={order.progress}
                                onChange={(e) => handleProgressChange(order, parseInt(e.target.value))}
                                className="w-full accent-sage-600 cursor-pointer h-1.5 rounded-lg bg-cream-200 dark:bg-sage-900"
                              />

                              <div className="grid grid-cols-4 gap-1.5 pt-1">
                                {[25, 50, 75, 100].map(pct => (
                                  <button
                                    id={`shortcut-pct-${order.id}-${pct}`}
                                    key={pct}
                                    onClick={() => handleProgressChange(order, pct)}
                                    className={`py-1 text-[10px] font-mono font-extrabold rounded-md border text-center transition-colors cursor-pointer ${
                                      order.progress === pct
                                        ? 'bg-sage-600 border-sage-600 text-white'
                                        : 'hover:bg-slate-100 dark:hover:bg-slate-900 border-cream-205 dark:border-sage-850 text-slate-400'
                                    }`}
                                  >
                                    {pct}%
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Col 2: Administrative adjustments */}
                          <div className={`p-4 rounded-xl border space-y-4 ${
                            theme === 'dark' ? 'bg-sage-950/30 border-sage-850' : 'bg-white border-cream-200'
                          }`}>
                            <h5 className="font-bold text-slate-700 dark:text-slate-400 flex items-center gap-1.5 text-xs border-b pb-1.5 border-cream-150 dark:border-sage-900">
                              <Sliders className="w-4 h-4 text-sage-600" />
                              <span>{isAr ? 'تعديل الحالة والدفع' : 'Administrative Matrix'}</span>
                            </h5>

                            <div className="grid grid-cols-1 gap-3 text-xs">
                              {/* Payment status selector */}
                              <div className="space-y-1">
                                <label className="text-[10px] text-slate-400 block">{isAr ? 'حالة سداد الفاتورة:' : 'Payment billing status:'}</label>
                                <select
                                  id={`payment-status-select-${order.id}`}
                                  value={order.paymentStatus}
                                  onChange={(e) => handlePaymentStatusChange(order, e.target.value as any)}
                                  className={`w-full p-1.5 text-xs rounded-lg border outline-none ${
                                    theme === 'dark' ? 'bg-sage-950 border-sage-850 text-white' : 'bg-white border-cream-200 text-cream-800'
                                  }`}
                                >
                                  <option value="pending">{isAr ? 'معلق (Pending)' : 'Pending'}</option>
                                  <option value="paid">{isAr ? 'تم السداد بالكامل (Paid)' : 'Paid'}</option>
                                  <option value="refunded">{isAr ? 'مسترجع (Refunded)' : 'Refunded'}</option>
                                </select>
                              </div>

                              {/* Order process status selector */}
                              <div className="space-y-1">
                                <label className="text-[10px] text-slate-400 block">{isAr ? 'حالة الطلب الإدارية:' : 'Order technical lifecycle:'}</label>
                                <select
                                  id={`order-status-select-${order.id}`}
                                  value={order.orderStatus}
                                  onChange={(e) => handleOrderStatusChange(order, e.target.value as any)}
                                  className={`w-full p-1.5 text-xs rounded-lg border outline-none ${
                                    theme === 'dark' ? 'bg-sage-950 border-sage-850 text-white' : 'bg-white border-cream-200 text-cream-800'
                                  }`}
                                >
                                  <option value="new">{isAr ? 'طلب جديد (New)' : 'New'}</option>
                                  <option value="processing">{isAr ? 'قيد التنفيذ (Processing)' : 'Processing'}</option>
                                  <option value="completed">{isAr ? 'مكتمل (Completed)' : 'Completed'}</option>
                                  <option value="cancelled">{isAr ? 'ملغي (Cancelled)' : 'Cancelled'}</option>
                                </select>
                              </div>
                            </div>
                          </div>

                          {/* Col 3: Government E-Invoice & print PDF view */}
                          <div className={`p-4 rounded-xl border flex flex-col justify-between space-y-4 ${
                            theme === 'dark' ? 'bg-sage-950/30 border-sage-850' : 'bg-white border-cream-200'
                          }`}>
                            <div>
                              <h5 className="font-bold text-slate-700 dark:text-slate-400 flex items-center gap-1.5 text-xs border-b pb-1.5 border-cream-150 dark:border-sage-900">
                                <FileText className="w-4 h-4 text-sage-600" />
                                <span>{isAr ? 'الفاتورة المالية والخيارات' : 'Official Project Invoice'}</span>
                              </h5>
                              <p className="text-[10px] text-slate-400 leading-relaxed mt-2.5">
                                {isAr 
                                  ? 'عرض الفاتورة المالية المعتمدة للطلب وتفاصيل الدفعات والخصومات المطبقة لتسليم العمل.'
                                  : 'View the authorized project billing invoice, applied discounts and transaction details.'}
                              </p>
                            </div>

                             <div className="flex gap-2 text-xs">
                              <button
                                id={`view-invoice-btn-${order.id}`}
                                onClick={() => onViewInvoice(order)}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-sage-600 hover:bg-sage-700 text-white font-bold rounded-lg transition-colors cursor-pointer"
                              >
                                <Eye className="w-4 h-4" />
                                <span>{isAr ? 'عرض الفاتورة' : 'View invoice'}</span>
                              </button>
                              <button
                                id={`download-invoice-btn-${order.id}`}
                                onClick={() => onViewInvoice(order, true)}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-colors cursor-pointer"
                                title={isAr ? 'تحميل الفاتورة PDF' : 'Download Invoice PDF'}
                              >
                                <Download className="w-4 h-4" />
                                <span>{isAr ? 'تحميل' : 'Download'}</span>
                              </button>
                              <button
                                id={`delete-order-btn-${order.id}`}
                                onClick={() => setDeletingOrderId(order.id)}
                                className="p-2 border border-rose-300 hover:bg-rose-500/10 text-rose-500 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                                title={isAr ? 'حذف الطلب نهائياً' : 'Delete order'}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                        </div>

                        {/* Deliverables upload / attachments section (الملفات والروابط والملخصات) */}
                        <div className="space-y-4" id={`order-attachments-section-${order.id}`}>
                          <div className="flex justify-between items-center border-b pb-1.5 border-cream-150 dark:border-sage-900">
                            <h5 className="font-bold text-slate-700 dark:text-slate-400 flex items-center gap-1.5 text-xs">
                              <FileCheck className="w-4.5 h-4.5 text-sage-600" />
                              <span>{isAr ? 'قسم الملفات الي اشتغلت فيها و الروابط الي انجزتها' : 'Delivered Visual Files & Completed Production Links'}</span>
                            </h5>
                            <span className="text-[11px] font-mono bg-sage-600/10 text-sage-600 px-2 rounded-full font-bold">
                              {order.attachments?.length || 0}
                            </span>
                          </div>

                          {order.attachments && order.attachments.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {order.attachments.map(att => (
                                <div key={att.id} className={`p-3 rounded-xl border flex justify-between items-center ${
                                  theme === 'dark' ? 'bg-sage-950 border-sage-900' : 'bg-white border-cream-200'
                                }`}>
                                  <div className="flex items-center gap-3">
                                    <div className="p-2 bg-sage-500/10 text-sage-650 rounded-lg shrink-0">
                                      {att.type === 'file' ? <FileText className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
                                    </div>
                                    <div className="min-w-0">
                                      <a href={att.url} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-slate-700 dark:text-slate-350 hover:underline block truncate hover:text-sage-600">
                                        {att.name}
                                      </a>
                                      <span className="text-[9px] text-slate-400 block font-mono">
                                        {att.type === 'file' ? (isAr ? 'ملف مرفوع' : 'Uploaded File') : (isAr ? 'رابط تسليم خارجي' : 'External Deliveries Link')}
                                      </span>
                                    </div>
                                  </div>
                                  <button
                                    id={`remove-att-${order.id}-${att.id}`}
                                    onClick={() => handleDeleteAttachment(order, att.id)}
                                    className="p-1 text-slate-400 hover:text-rose-500 rounded hover:bg-rose-500/5 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-slate-400 italic">
                              {isAr ? 'لا توجد أي روابط أو ملفات تسليمات مسجلة حالياً لهذا المشروع.' : 'No uploads visual artifacts indexed yet.'}
                            </p>
                          )}

                          {/* Quick upload attachments and link form */}
                          <form onSubmit={(e) => handleLoadAttachmentSubmit(order, e)} className={`p-4 rounded-xl border border-dashed text-xs space-y-3 ${
                            theme === 'dark' ? 'bg-slate-900/40 border-sage-850' : 'bg-slate-50 border-cream-220'
                          }`}>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div className="space-y-1">
                                <label className="text-[10px] text-slate-400 block">{isAr ? 'اسم الملف أو رابط الإنجاز:' : 'Asset Identifier:'} *</label>
                                <input
                                  type="text"
                                  required
                                  value={attachName}
                                  onChange={(e) => setAttachName(e.target.value)}
                                  placeholder={isAr ? 'شعار فيجما مفرغ، رابط قيادة سلة...' : 'e.g. Salla CSS Layout script'}
                                  className={`w-full p-2 text-xs rounded-lg border outline-none ${
                                    theme === 'dark' ? 'bg-sage-950 border-sage-850 text-white' : 'bg-white border-cream-200 text-cream-900'
                                  }`}
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] text-slate-400 block">{isAr ? 'عنوان URL المباشر:' : 'Target Hyperlink URL:'}</label>
                                <input
                                  type="url"
                                  value={attachUrl}
                                  onChange={(e) => setAttachUrl(e.target.value)}
                                  placeholder="https://drive.google.com/..."
                                  className={`w-full p-2 text-xs rounded-lg border outline-none ${
                                    theme === 'dark' ? 'bg-sage-950 border-sage-850 text-white' : 'bg-white border-cream-200 text-cream-900'
                                  }`}
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] text-slate-400 block">{isAr ? 'نوع المرفق:' : 'Resource Category:'}</label>
                                <div className="flex gap-2">
                                  <select
                                    value={attachType}
                                    onChange={(e) => setAttachType(e.target.value as 'file' | 'link')}
                                    className={`flex-1 p-2 text-xs rounded-lg border outline-none ${
                                      theme === 'dark' ? 'bg-sage-950 border-sage-850 text-white' : 'bg-white border-cream-200 text-cream-800'
                                    }`}
                                  >
                                    <option value="file">{isAr ? 'ملف (File)' : 'File'}</option>
                                    <option value="link">{isAr ? 'رابط (Link)' : 'Link'}</option>
                                  </select>
                                  <button
                                    id={`submit-attach-${order.id}`}
                                    type="submit"
                                    disabled={isUploading}
                                    className="px-4 py-2 bg-sage-600 hover:bg-sage-700 disabled:bg-slate-300 text-white font-bold rounded-lg transition-colors cursor-pointer"
                                  >
                                    {isUploading ? '...' : (isAr ? 'إدراج' : 'Add')}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </form>
                        </div>

                        {/* Customer Direct WhatsApp messaging triggers */}
                        <div className="space-y-4" id={`client-whatsapp-out-${order.id}`}>
                          <div className="border-b pb-1.5 border-cream-150 dark:border-sage-900 flex justify-between items-center">
                            <h5 className="font-bold text-slate-700 dark:text-slate-400 flex items-center gap-1.5 text-xs">
                              <MessageSquare className="w-4.5 h-4.5 text-sage-600" />
                              <span>{isAr ? 'إرسال تحديثات وإشعارات للعميل (واتساب مباشر)' : 'Broadcast Live WhatsApp Progress Dispatch'}</span>
                            </h5>
                            <button
                              id={`open-messaging-${order.id}`}
                              onClick={() => handleOpenMessaging(order)}
                              className="text-xs font-bold text-sage-600 hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <span>{isAr ? 'تجهيز الرسالة التلقائية' : 'Configure pre-set templates'}</span>
                            </button>
                          </div>

                          {activeMessagingOrderId === order.id && (
                            <motion.div
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={`p-5 rounded-xl border space-y-4 ${
                                theme === 'dark' ? 'bg-sage-950/60 border-sage-850' : 'bg-white border-cream-220 shadow-xs'
                              }`}
                              id={`messaging-panel-${order.id}`}
                            >
                              <div className="space-y-2">
                                <label className="text-xs text-slate-400 block font-bold">{isAr ? 'اختر قالب الإشعار الجاهز لتجهيز الرسالة:' : 'Choose pre-defined formatted template:'}</label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                  <button
                                    id={`tpl-progress-${order.id}`}
                                    type="button"
                                    onClick={() => handleTemplateChange(order, 'progress50')}
                                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                                      selectedMessageTemplate === 'progress50'
                                        ? 'bg-sage-600 border-sage-600 text-white'
                                        : 'hover:bg-slate-100 dark:hover:bg-slate-900 border-cream-205 dark:border-sage-850 text-slate-400'
                                    }`}
                                  >
                                    <div className="text-xs font-bold">{isAr ? 'إشعار إنجاز ٥٠٪' : '50% Progress Alert'}</div>
                                  </button>

                                  <button
                                    id={`tpl-completed-${order.id}`}
                                    type="button"
                                    onClick={() => handleTemplateChange(order, 'completed100')}
                                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                                      selectedMessageTemplate === 'completed100'
                                        ? 'bg-sage-600 border-sage-600 text-white'
                                        : 'hover:bg-slate-100 dark:hover:bg-slate-900 border-cream-205 dark:border-sage-850 text-slate-400'
                                    }`}
                                  >
                                    <div className="text-xs font-bold">{isAr ? 'إشعار بإكمال الطلب' : '100% Completion Alert'}</div>
                                  </button>

                                  <button
                                    id={`tpl-payment-${order.id}`}
                                    type="button"
                                    onClick={() => handleTemplateChange(order, 'paymentReminder')}
                                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                                      selectedMessageTemplate === 'paymentReminder'
                                        ? 'bg-sage-600 border-sage-600 text-white'
                                        : 'hover:bg-slate-100 dark:hover:bg-slate-900 border-cream-205 dark:border-sage-850 text-slate-400'
                                    }`}
                                  >
                                    <div className="text-xs font-bold">{isAr ? 'تذكير بحالة الدفع' : 'Payment Reminder'}</div>
                                  </button>
                                </div>
                              </div>

                              <div className="space-y-1.5 text-xs">
                                <label className="text-slate-400 block font-semibold">{isAr ? 'معاينة نص الرسالة الجاهزة (يمكنك التعديل عليه):' : 'Interactive text editor (feel free to modify text):'}</label>
                                <textarea
                                  rows={4}
                                  value={customMessageText}
                                  onChange={(e) => setCustomMessageText(e.target.value)}
                                  className={`w-full p-3 rounded-xl border outline-none resize-none leading-relaxed font-sans ${
                                    theme === 'dark' ? 'bg-sage-950 border-sage-850 text-white' : 'bg-slate-50 border-cream-205 text-cream-800'
                                  }`}
                                />
                              </div>

                              <div className="flex justify-between items-center gap-4 text-xs">
                                <span className="text-[10px] text-slate-400">
                                  {isAr ? `سيتم التوجيه لهاتف العميل: ${order.clientPhone}` : `Redirect to client WhatsApp cell: ${order.clientPhone}`}
                                </span>
                                <div className="flex gap-2">
                                  <button
                                    id={`cancel-msg-${order.id}`}
                                    type="button"
                                    onClick={() => setActiveMessagingOrderId(null)}
                                    className="px-4 py-2 border border-cream-300 text-slate-500 rounded-lg font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                                  >
                                    {isAr ? 'إلغاء' : 'Cancel'}
                                  </button>
                                  <button
                                    id={`send-msg-btn-${order.id}`}
                                    type="button"
                                    onClick={() => handleSendWhatsAppSubmit(order)}
                                    className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                                  >
                                    <Phone className="w-3.5 h-3.5" />
                                    <span>{isAr ? 'إرسال وتوجيه للواتساب' : 'Open WhatsApp Chat'}</span>
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </div>

                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            );
          })}
        </div>
      )}

      {/* Elegant New Order Overlay Modal Box */}
      <AnimatePresence>
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm" id="create-order-overlay-backdrop">
            <motion.div
              id="create-order-overlay-box"
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className={`p-6 md:p-8 rounded-2xl w-full max-w-2xl shadow-2xl border flex flex-col max-h-[90vh] overflow-hidden ${
                theme === 'dark' ? 'bg-sage-950 border-sage-800 text-white' : 'bg-white border-cream-200 text-cream-900'
              }`}
            >
              
              {/* Header */}
              <div className="flex items-center justify-between border-b pb-4 border-cream-150 dark:border-sage-850 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-sage-600/15 text-sage-600 rounded-lg">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-black text-sm text-sage-800 dark:text-sage-300">
                      {isAr ? 'نموذج إنشاء طلب جديد (سعودي كور)' : 'Saudi Core New Project Registration'}
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {isAr ? 'سجل مشاريع العملاء، حدد الخصومات، والأسعار تلقائياً بناءً على قائمة الخدمات الحصرية المضمّنة' : 'Configure metadata characteristics & apply custom percentage deductions'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="p-1 px-2 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-400 hover:text-slate-600 font-extrabold rounded-md text-xs cursor-pointer"
                  id="close-create-modal"
                >
                  ✕
                </button>
              </div>

              {/* Form Content Scrolling Frame */}
              <form onSubmit={handleCreateOrderSubmit} className="flex-1 overflow-y-auto py-5 space-y-5 pr-1 pl-1 text-xs" id="creation-form">
                
                {/* 1. Project identity / identification */}
                <div className="space-y-3.5">
                  <span className="text-[10px] font-bold text-sage-600 uppercase tracking-widest block border-b pb-1 border-dotted border-cream-205 dark:border-sage-900">
                    {isAr ? 'بيانات ومعرف الطلب المالي' : 'Order Identification Details'}
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-500 block">{isAr ? 'رقم الطلب:' : 'Authorized Order Number:'} *</label>
                      <input
                        type="text"
                        required
                        value={newOrderIdInput}
                        onChange={(e) => setNewOrderIdInput(e.target.value)}
                        placeholder="e.g. SC-104"
                        className={`w-full p-2.5 text-xs rounded-xl border outline-none font-bold font-mono focus:border-sage-600 transition-colors ${
                          theme === 'dark' ? 'bg-sage-950 border-sage-850 text-white' : 'bg-cream-100 border-cream-200 text-cream-900'
                        }`}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-500 block">{isAr ? 'اسم العميل بالكامل:' : 'Client Full Name:'} *</label>
                      <input
                        type="text"
                        required
                        value={newClientName}
                        onChange={(e) => setNewClientName(e.target.value)}
                        placeholder={isAr ? 'عبدالله القحطاني' : 'Abdullah Al-Qahtani'}
                        className={`w-full p-2.5 text-xs rounded-xl border outline-none focus:border-sage-600 transition-colors ${
                          theme === 'dark' ? 'bg-sage-950 border-sage-850 text-white' : 'bg-cream-100 border-cream-200 text-cream-900'
                        }`}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-500 block">{isAr ? 'رقم جوال العميل:' : 'WhatsApp Mobile Number:'}</label>
                      <input
                        type="tel"
                        value={newClientPhone}
                        onChange={(e) => setNewClientPhone(e.target.value)}
                        placeholder="+9665XXXXXXXX"
                        className={`w-full p-2.5 text-xs rounded-xl border outline-none font-mono focus:border-sage-600 transition-colors ${
                          theme === 'dark' ? 'bg-sage-950 border-sage-850 text-white' : 'bg-cream-100 border-cream-200 text-cream-900'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-1">
                    <label className="text-[11px] font-bold text-slate-500 block">{isAr ? 'البريد الإلكتروني للعميل:' : 'Client Email:'}</label>
                    <input
                      type="email"
                      value={newClientEmail}
                      onChange={(e) => setNewClientEmail(e.target.value)}
                      placeholder="client@saudicore.com"
                      className={`w-full p-2.5 text-xs rounded-xl border outline-none focus:border-sage-600 transition-colors ${
                        theme === 'dark' ? 'bg-sage-950 border-sage-850 text-white' : 'bg-cream-100 border-cream-200 text-cream-900'
                      }`}
                    />
                  </div>
                </div>

                {/* 2. Checklist of Saudi Core precise Services (المبلغ يتحدد تلقائياً) */}
                <div className="space-y-3.5">
                  <span className="text-[10px] font-bold text-sage-600 uppercase tracking-widest block border-b pb-1 border-dotted border-cream-205 dark:border-sage-900">
                    {isAr ? 'اختر باقات وخدمات المتجر المطلوبة (المبلغ يتحدد تلقائياً)' : 'Services Catalog Selector (Pricing Autosums)'}
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-[160px] overflow-y-auto p-3 border border-dashed border-cream-250 dark:border-sage-900 rounded-xl bg-slate-50/50 dark:bg-sage-950/10">
                    {SAUDICORE_SERVICES.map(srv => {
                      const isChecked = !!selectedServices.find(s => s.id === srv.id);
                      return (
                        <div
                          key={srv.id}
                          onClick={() => handleToggleService(srv)}
                          className={`p-2.5 rounded-xl border text-right cursor-pointer select-none transition-all duration-200 flex items-center gap-2.5 ${
                            isChecked
                              ? theme === 'dark'
                                ? 'bg-sage-900/80 border-sage-500 text-white shadow shadow-sage-950'
                                : 'bg-sage-100/50 border-sage-400 text-sage-850 font-bold'
                              : theme === 'dark'
                                ? 'bg-sage-950/20 border-sage-900 hover:border-sage-800 text-slate-350'
                                : 'bg-white border-cream-200 hover:border-cream-300 text-cream-800'
                          }`}
                        >
                          <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                            isChecked ? 'bg-sage-600 border-sage-600 text-white' : 'border-slate-300 bg-transparent'
                          }`}>
                            {isChecked && <Check className="w-3 h-3" />}
                          </span>
                          <div className="flex-1 min-w-0">
                            <span className="block font-bold text-[11px] truncate">{isAr ? srv.titleArabic : srv.titleEnglish}</span>
                            <span className="block text-[10px] text-sage-600 dark:text-sage-400 font-mono mt-0.5">{srv.price} ريال</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Project details preview summaries */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-500 block">{isAr ? 'اسم المشروع المعتمد:' : 'Project Display Title:'}</label>
                      <input
                        type="text"
                        value={newProjectTitle}
                        onChange={(e) => setNewProjectTitle(e.target.value)}
                        placeholder={isAr ? 'باقة موقع متكامل + كروت الشركات...' : 'Project service title'}
                        className={`w-full p-2.5 text-xs rounded-xl border outline-none focus:border-sage-600 transition-colors ${
                          theme === 'dark' ? 'bg-sage-950 border-sage-850 text-white' : 'bg-cream-100 border-cream-200 text-cream-900'
                        }`}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-500 block">{isAr ? 'تفاصيل نطاق المشروع للمعاينة والتوصيف الأول برمجياً:' : 'Scope & Description:'}</label>
                      <textarea
                        rows={2}
                        value={newProjectDesc}
                        onChange={(e) => setNewProjectDesc(e.target.value)}
                        placeholder="..."
                        className={`w-full p-2.5 text-xs rounded-xl border outline-none resize-none focus:border-sage-600 transition-colors ${
                          theme === 'dark' ? 'bg-sage-950 border-sage-850 text-white' : 'bg-cream-100 border-cream-200 text-cream-900'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Automated billing matrix and custom percentage discounts */}
                <div className="space-y-3.5">
                  <span className="text-[10px] font-bold text-sage-600 uppercase tracking-widest block border-b pb-1 border-dotted border-cream-205 dark:border-sage-900">
                    {isAr ? 'التسعير التلقائي ونسبة الخصم' : 'Auto Billing Matrix & Premium Deductions'}
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-cream-100/50 dark:bg-sage-950/20 p-4 rounded-2xl border border-cream-180 dark:border-sage-900 leading-normal">
                    
                    {/* Discount option selector: starts from 5% */}
                    <div className="space-y-1.5 justify-center flex flex-col">
                      <label className="text-[11px] font-bold text-slate-500 block">{isAr ? 'نسبة الخصم المئوية (يبدأ من 5%):' : 'Deduction discount percentage:'}</label>
                      <select
                        value={discountPercent}
                        onChange={(e) => setDiscountPercent(parseInt(e.target.value))}
                        className={`w-full p-2.5 text-xs rounded-xl border outline-none cursor-pointer focus:border-sage-600 transition-colors ${
                          theme === 'dark' ? 'bg-sage-950 border-sage-850 text-white' : 'bg-white border-cream-200 text-cream-800'
                        }`}
                      >
                        <option value="0">{isAr ? 'بدون أي خصم (0%)' : 'No Discount'}</option>
                        <option value="5">خصم 5%</option>
                        <option value="10">خصم 10%</option>
                        <option value="15">خصم 15%</option>
                        <option value="20">خصم 20%</option>
                        <option value="25">خصم 25%</option>
                        <option value="30">خصم 30%</option>
                        <option value="40">خصم 40%</option>
                        <option value="50">خصم 50%</option>
                        <option value="75">خصم 75%</option>
                      </select>
                    </div>

                    {/* Auto Pricing calculation presentation */}
                    <div className="space-y-1 pt-1.5 text-right font-sans">
                      <div className="flex justify-between text-[11px] text-slate-500">
                        <span>{isAr ? 'المجموع المستحق قبل الخصم:' : 'Initial catalog amount:'}</span>
                        <span className="font-bold font-mono">{originalServicesSum.toLocaleString()} ريال</span>
                      </div>
                      <div className="flex justify-between text-[11px] text-rose-500">
                        <span>{isAr ? `قيمة الخصم المطبق (خصم ${discountPercent}%):` : `Deduction count (${discountPercent}%):`}</span>
                        <span className="font-bold font-mono">- {((originalServicesSum * discountPercent) / 100).toLocaleString()} ريال</span>
                      </div>
                      <div className="flex justify-between border-t border-cream-220 dark:border-sage-850 pt-1.5 mt-1.5 text-xs">
                        <span className="font-bold text-slate-800 dark:text-slate-350">{isAr ? 'صافي التكلفة النهائية المحسوبة:' : 'Net final order price:'}</span>
                        <span className="font-bold font-mono text-sage-650 text-sm tracking-tight">{finalCalculatedPrice.toLocaleString()} ريال</span>
                      </div>
                    </div>

                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-500 block">{isAr ? 'حالة السداد للمشروع:' : 'Bill state:'}</label>
                      <select
                        value={newPaymentStatus}
                        onChange={(e) => setNewPaymentStatus(e.target.value as any)}
                        className={`w-full p-2.5 text-xs rounded-xl border outline-none ${
                          theme === 'dark' ? 'bg-sage-950 border-sage-850 text-white' : 'bg-cream-100 border-cream-200 text-cream-800'
                        }`}
                      >
                        <option value="pending">{isAr ? 'قيد الانتظار (Pending)' : 'Pending'}</option>
                        <option value="paid">{isAr ? 'مسدد بالكامل (Paid)' : 'Paid'}</option>
                        <option value="refunded">{isAr ? 'مسترجع (Refunded)' : 'Refunded'}</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-500 block">{isAr ? 'حالة الطلب المبدئية والتقدم العملي:' : 'Application execution state:'}</label>
                      <select
                        value={newOrderStatus}
                        onChange={(e) => setNewOrderStatus(e.target.value as any)}
                        className={`w-full p-2.5 text-xs rounded-xl border outline-none ${
                          theme === 'dark' ? 'bg-sage-950 border-sage-850 text-white' : 'bg-cream-100 border-cream-200 text-cream-800'
                        }`}
                      >
                        <option value="new">{isAr ? 'طلب جديد (New)' : 'New'}</option>
                        <option value="processing">{isAr ? 'قيد التنفيذ (Processing)' : 'Processing'}</option>
                        <option value="completed">{isAr ? 'مكتمل ومسَلّم (Completed)' : 'Completed'}</option>
                        <option value="cancelled">{isAr ? 'ملغي ومسترجع (Cancelled)' : 'Cancelled'}</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Actions Bottom validation buttons */}
                <div className="pt-4 flex items-center justify-end gap-3 border-t border-cream-150 dark:border-sage-850 shrink-0 text-xs">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="px-5 py-2.5 border border-cream-300 text-slate-500 font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer text-xs"
                  >
                    {isAr ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-sage-600 hover:bg-sage-700 text-white font-bold rounded-xl transition-colors shadow-md shadow-sage-600/15 cursor-pointer text-xs"
                  >
                    {isAr ? 'تأكيد وحفظ الطلب' : 'Register project'}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Custom Modal */}
      <AnimatePresence>
        {deletingOrderId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-md p-6 rounded-2xl shadow-2xl border text-center ${
                theme === 'dark' ? 'bg-sage-950 border-sage-850 text-white' : 'bg-white border-cream-200 text-slate-800'
              }`}
            >
              <div className="w-12 h-12 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-500">
                <Trash2 className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold font-serif mb-1">
                {isAr ? 'تأكيد حذف الطلب نهائياً' : 'Confirm Permanent Deletion'}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                {isAr 
                  ? `هل أنت متأكد من رغبتك في حذف الطلب رقم (#${deletingOrderId}) نهائياً من النظام؟ هذا الإجراء فوري وسيتسبب في مسح كافة الملفات والتسليمات التابعة له، ولا يمكن التراجع عنه.` 
                  : `Are you sure you want to permanently delete support order #${deletingOrderId}? This action is immediate, irreversible, and deletes all corresponding files.`}
              </p>
              <div className="flex gap-3 justify-center text-xs">
                <button
                  type="button"
                  onClick={() => setDeletingOrderId(null)}
                  className={`px-5 py-2.5 font-bold rounded-xl border transition-colors cursor-pointer flex-1 ${
                    theme === 'dark' ? 'bg-sage-900 border-sage-800 text-slate-350 hover:bg-sage-850' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {isAr ? 'إلغاء الإجراء' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    deleteOrder(deletingOrderId);
                    setDeletingOrderId(null);
                  }}
                  className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition-colors shadow-md shadow-rose-600/15 cursor-pointer flex-1"
                >
                  {isAr ? 'نعم، احذف الطلب' : 'Yes, Delete Order'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
