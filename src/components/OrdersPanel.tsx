import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Sliders, Clock, Check, 
  Link as LinkIcon, FileCheck, Plus, 
  Send, Phone, Mail, FileText, Trash2, Activity, ShieldCheck, HelpCircle, Eye,
  User, Hash, MessageSquare, AlertCircle, CheckCircle2, X, ChevronDown, Download, Orbit
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
  const [selectedMessageTemplate, setSelectedMessageTemplate] = useState<'completed100' | 'paymentReminder'>('completed100');
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
  const [customServices, setCustomServices] = useState<{ id: string; name: string; price: number }[]>([
    { id: '1', name: '', price: 0 }
  ]);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [newPaymentStatus, setNewPaymentStatus] = useState<'paid' | 'pending' | 'refunded'>('pending');
  const [newOrderStatus, setNewOrderStatus] = useState<'new' | 'processing' | 'completed' | 'cancelled'>('new');
  const [isPendingPreset, setIsPendingPreset] = useState(false);
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

  // Automated price calculations for custom services
  const originalServicesSum = useMemo(() => {
    return customServices.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
  }, [customServices]);

  // Pre-populate project title and description from custom services
  useEffect(() => {
    const valid = customServices.filter(s => s.name.trim() !== '');
    if (valid.length > 0) {
      const titles = valid.map(s => s.name).join(' + ');
      setNewProjectTitle(titles);
      
      const descs = valid.map(s => s.name + ` (${s.price} ريال)`).join(' - ');
      setNewProjectDesc(isAr ? `تتضمن خدمات: ${descs}` : `Includes: ${titles}`);
    }
  }, [customServices, isAr]);

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
      clientEmail: newClientEmail || `${typedId}@madar-client.com`,
      titleArabic: newProjectTitle || (isAr ? 'طلب برمجيات نظام مدار المخصصة' : 'Madar Custom Development Work'),
      titleEnglish: newProjectTitle || 'Madar Custom Development Work',
      descriptionArabic: newProjectDesc || (isAr ? 'تفاصيل الطلب والتحليلات الخاصة بنظام مدار' : 'Scope and details of Madar order'),
      descriptionEnglish: newProjectDesc || 'Madar custom system requirements',
      date: new Date().toISOString(),
      price: finalCalculatedPrice,
      originalPrice: originalServicesSum,
      discount: discountPercent,
      progress: newOrderStatus === 'completed' ? 100 : 0,
      paymentStatus: newPaymentStatus,
      invoiceStatus: newPaymentStatus === 'paid' ? 'generated' : 'draft',
      orderStatus: newOrderStatus,
      attachments: [],
      services: customServices.filter(s => s.name.trim() !== '').map((s, index) => ({
        id: 'cust-srv-' + s.id,
        titleArabic: s.name,
        titleEnglish: s.name,
        descriptionArabic: s.name,
        descriptionEnglish: s.name,
        price: Number(s.price) || 0
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
    const cmpText = `عملينا المميز ${order.clientName}! نود تهنئتك بإكمال طلبك رقم (${order.id}) لمشروع (${order.titleArabic}) بالكامل وجهوزيته للتسليم! نسعد بخدمتك دائماً ونراك في مشاريع قادمة ✨`;
    const payText = `مرحباً ${order.clientName}، نود تذكيرك بلطف لاستكمال دفعة طلبك رقم (${order.id}) لمشروع (${order.titleArabic}) لمتابعة التجهيز والتسليم بشكل نهائي. شكراً لتفهمك وتجاوبك ✨`;

    if (templateType === 'completed100') return cmpText;
    return payText;
  };

  // Toggle messaging options pane
  const handleOpenMessaging = (order: Order) => {
    setActiveMessagingOrderId(order.id);
    setSelectedMessageTemplate('completed100');
    setCustomMessageText(populateWhatsAppPreviewText(order, 'completed100'));
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
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 py-3" id="active-panel-heading">
          <div>
            <h2 className="text-lg font-serif font-bold text-sage-800 flex items-center gap-2">
              <Orbit className="w-5.5 h-5.5 text-emerald-600 animate-spin" style={{ animationDuration: '8s' }} />
              {isAr ? 'إدارة الطلبات الجارية والمشاريع' : 'Active Client Orders Desk'}
            </h2>
            <p className="text-xs text-slate-800 font-bold mt-0.5">
              {isAr 
                ? 'متابعة مراحل التنفيذ، الدفعات، ورفع تسليمات العملاء للطلبات الجارية حالياً' 
                : 'Follow current deliverables status, update progress values, index invoices and print PDFs'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5 items-center">
            {/* Button 1: Create General Order */}
            <button
              id="new-order-create-btn"
              onClick={() => {
                setIsPendingPreset(false);
                const orNumbers = orders
                  .map(o => {
                    const match = o.id.match(/^OR-0*(\d+)$/i);
                    return match ? parseInt(match[1], 10) : 0;
                  })
                  .filter(n => n > 0);
                const nextNum = orNumbers.length > 0 ? Math.max(...orNumbers) + 1 : 1;
                const formattedId = `OR-${String(nextNum).padStart(4, '0')}`;
                setNewOrderIdInput(formattedId);
                setNewClientName('');
                setNewClientPhone('');
                setNewClientEmail('');
                setNewProjectTitle('');
                setNewProjectDesc('');
                setCustomServices([{ id: '1', name: '', price: 0 }]);
                setDiscountPercent(0);
                setNewPaymentStatus('pending');
                setNewOrderStatus('new');
                setIsPendingPreset(false);
                setIsCreateOpen(true);
              }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/15 cursor-pointer transform hover:scale-[1.01]"
            >
              <Plus className="w-4 h-4" />
              <span>{isAr ? 'إنشاء طلب جديد' : 'Register New Order'}</span>
            </button>

            {/* Button 2: Create Explicit Pending Order */}
            <button
              id="pending-order-create-btn"
              onClick={() => {
                setIsPendingPreset(true);
                const orNumbers = orders
                  .map(o => {
                    const match = o.id.match(/^OR-0*(\d+)$/i);
                    return match ? parseInt(match[1], 10) : 0;
                  })
                  .filter(n => n > 0);
                const nextNum = orNumbers.length > 0 ? Math.max(...orNumbers) + 1 : 1;
                const formattedId = `OR-${String(nextNum).padStart(4, '0')}`;
                setNewOrderIdInput(formattedId);
                setNewClientName('');
                setNewClientPhone('');
                setNewClientEmail('');
                setNewProjectTitle('');
                setNewProjectDesc('');
                setCustomServices([{ id: '1', name: '', price: 0 }]);
                setDiscountPercent(0);
                setNewPaymentStatus('pending');
                setNewOrderStatus('new');
                setIsCreateOpen(true);
              }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-amber-500/15 cursor-pointer transform hover:scale-[1.01]"
            >
              <Clock className="w-4 h-4" />
              <span>{isAr ? 'إنشاء طلب معلق' : 'Create Pending Order'}</span>
            </button>
          </div>
        </div>
      )}

      {tab === 'completed_orders' && (
        <div className="py-3 border-b border-cream-150 dark:border-sage-900" id="completed-panel-heading">
          <h2 className="text-lg font-serif font-bold text-emerald-600">
            {isAr ? 'سجل الطلبات المكتملة المنتهية' : 'Completed Projects Registry (100%)'}
          </h2>
          <p className="text-xs text-slate-800 font-bold mt-0.5">
            {isAr 
               ? 'الأرشيف المعتمد لكافة المشاريع التي تم تسليمها للعملاء وإنجازها بالكامل' 
               : 'Indexed database of successfully finalized applications and visually perfect drafts'}
          </p>
        </div>
      )}

      {tab === 'search' && (
        <div className="flex flex-col items-center justify-center py-12 px-4 max-w-xl mx-auto space-y-6" id="centralized-search-depart">
          <div className="text-center space-y-1">
            <h2 className="text-xl font-serif font-bold text-slate-850 dark:text-slate-300">
              {isAr ? 'البحث عن طلبات ومشاريع' : 'Madar Central Search'}
            </h2>
            <p className="text-xs text-slate-800 font-bold">
              {isAr 
                ? 'أدخل رقم الطلب أو اسم مشروع العميل في الخانة بالأسفل للمطابقة السريعة' 
                : 'Lookup unified client profile database by entering order ID or project names'}
            </p>
          </div>

          <div className="w-full relative" id="centered-search-box">
            <Search className={`absolute inset-y-0 ${isAr ? 'right-4' : 'left-4'} m-auto w-5 h-5 text-slate-800`} />
            <input
              type="text"
              value={localSearchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value)}
              placeholder={isAr ? 'البحث...' : 'Search...'}
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
          <AlertCircle className="w-10 h-10 text-emerald-600 mx-auto animate-bounce" />
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wi">
            {tab === 'search' 
              ? (localSearchQuery ? (isAr ? 'لم يتم العثور على أي نتائج مطابقة للبحث' : 'No records match search') : (isAr ? 'الرجاء إدخال كلمات البحث بالجهة العلوية لعرض النتائج' : 'Please provide search keywords to find items'))
              : (isAr ? 'لا توجد طلبات مسجلة in هذا القسم حالياً' : 'No orders found inside this ledger')}
          </h3>
          <p className="text-[11px] text-slate-800 font-bold max-w-sm mx-auto leading-relaxed">
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
                      <span className="text-[10px] font-mono font-extrabold bg-emerald-100 dark:bg-emerald-950 px-2.5 py-0.5 rounded-full text-emerald-900 dark:text-emerald-300 tracking-wider">
                        #{order.id}
                      </span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                        order.paymentStatus === 'paid' 
                          ? 'bg-emerald-600/10 text-emerald-700' 
                          : order.paymentStatus === 'pending'
                            ? 'bg-amber-500/15 text-amber-905 font-black'
                            : 'bg-slate-200 text-slate-900 font-extrabold'
                      }`}>
                        {order.paymentStatus === 'paid' ? (isAr ? 'تم سداد الدفعة' : 'Paid') : (isAr ? 'بانتظار السداد' : 'Pending')}
                      </span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                        order.orderStatus === 'completed' 
                          ? 'bg-emerald-600/10 text-emerald-700'
                          : order.orderStatus === 'processing'
                            ? 'bg-blue-600/10 text-blue-800'
                            : order.orderStatus === 'cancelled'
                              ? 'bg-rose-500/15 text-rose-900 font-black'
                              : 'bg-zinc-200 text-zinc-900 font-extrabold'
                      }`}>
                        {order.orderStatus === 'completed' ? (isAr ? 'مكتمل' : 'Completed') :
                         order.orderStatus === 'processing' ? (isAr ? 'قيد التنفيذ' : 'Processing') :
                         order.orderStatus === 'cancelled' ? (isAr ? 'ملغي' : 'Cancelled') :
                         (isAr ? 'طلب جديد' : 'New')}
                      </span>
                    </div>

                    <h3 className="font-serif font-black text-sm text-slate-900 dark:text-white pt-1">
                      {isAr ? order.titleArabic : order.titleEnglish}
                    </h3>

                    <div className="flex items-center gap-2.5 text-xs text-slate-800 font-bold pt-0.5 animate-fadeIn">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-800" />
                        <strong>{order.clientName}</strong>
                      </span>
                      <span>•</span>
                      <span className="text-slate-800 font-bold">{new Date(order.date).toLocaleDateString(isAr ? 'ar-SA' : 'en-US')}</span>
                    </div>
                  </div>

                  {/* Right: Net Price & Expansion chevron */}
                  <div className="flex items-center gap-4 self-end md:self-center">
                    <div className="text-right leading-tight">
                      <span className="text-[10px] text-slate-805 font-black block uppercase tracking-wider">{isAr ? 'تكلفة الطلب الصافية' : 'Net due billing'}</span>
                      <strong className="text-base font-black text-slate-900 dark:text-sage-350">
                        {order.price.toLocaleString()} {isAr ? 'ريال' : 'SAR'}
                      </strong>
                    </div>

                    <div className={`p-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-350 dark:border-slate-850 text-slate-800 transition-transform ${
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
                            <p className="text-xs text-slate-805 font-bold italic">
                              {isAr ? order.descriptionArabic : order.descriptionEnglish}
                            </p>
                          )}
                        </div>

                        {/* Order Controllers (payments, invoice) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id={`order-actions-grid-${order.id}`}>

                          {/* Col 2: Administrative adjustments */}
                          <div className={`p-4 rounded-xl border space-y-4 ${
                            theme === 'dark' ? 'bg-sage-950/30 border-sage-850' : 'bg-white border-cream-205'
                          }`}>
                            <h5 className="font-extrabold text-slate-900 dark:text-slate-200 flex items-center gap-1.5 text-xs border-b pb-1.5 border-cream-200 dark:border-sage-900">
                              <Sliders className="w-4 h-4 text-emerald-650" />
                              <span>{isAr ? 'تعديل الحالة والدفع' : 'Administrative Matrix'}</span>
                            </h5>

                            <div className="grid grid-cols-1 gap-3 text-xs">
                              {/* Payment status selector */}
                              <div className="space-y-1">
                                <label className="text-[10px] text-slate-805 font-black block">{isAr ? 'حالة سداد الفاتورة:' : 'Payment billing status:'}</label>
                                <select
                                  id={`payment-status-select-${order.id}`}
                                  value={order.paymentStatus}
                                  onChange={(e) => handlePaymentStatusChange(order, e.target.value as any)}
                                  className={`w-full p-2 text-xs font-bold rounded-lg border outline-none ${
                                    theme === 'dark' ? 'bg-sage-950 border-sage-850 text-white' : 'bg-white border-cream-220 text-cream-950'
                                  }`}
                                >
                                  <option value="pending">{isAr ? 'معلق (Pending)' : 'Pending'}</option>
                                  <option value="paid">{isAr ? 'تم السداد بالكامل (Paid)' : 'Paid'}</option>
                                  <option value="refunded">{isAr ? 'مسترجع (Refunded)' : 'Refunded'}</option>
                                </select>
                              </div>

                              {/* Order process status selector */}
                              <div className="space-y-1">
                                <label className="text-[10px] text-slate-805 font-black block">{isAr ? 'حالة الطلب الإدارية:' : 'Order technical lifecycle:'}</label>
                                <select
                                  id={`order-status-select-${order.id}`}
                                  value={order.orderStatus}
                                  onChange={(e) => handleOrderStatusChange(order, e.target.value as any)}
                                  className={`w-full p-2 text-xs font-bold rounded-lg border outline-none ${
                                    theme === 'dark' ? 'bg-sage-950 border-sage-850 text-white' : 'bg-white border-cream-220 text-cream-950'
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
                            theme === 'dark' ? 'bg-sage-950/30 border-sage-850' : 'bg-white border-cream-205'
                          }`}>
                            <div>
                              <h5 className="font-extrabold text-slate-900 dark:text-slate-205 flex items-center gap-1.5 text-xs border-b pb-1.5 border-cream-200 dark:border-sage-900">
                                <FileText className="w-4 h-4 text-emerald-650" />
                                <span>{isAr ? 'فاتورة الطلب والخيارات' : 'Official Project Invoice'}</span>
                              </h5>
                              <p className="text-[10px] text-slate-805 font-bold leading-relaxed mt-2.5">
                                {isAr 
                                  ? 'عرض فاتورة الطلب المعتمدة وتفاصيل الدفعات والخصومات المطبقة لتسليم العمل.'
                                  : 'View the authorized project billing invoice, applied discounts and transaction details.'}
                              </p>
                            </div>

                             <div className="flex gap-2 text-xs">
                              <button
                                id={`view-invoice-btn-${order.id}`}
                                onClick={() => onViewInvoice(order)}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors cursor-pointer"
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

                        {/* Customer Direct WhatsApp messaging triggers */}
                        <div className="space-y-4" id={`client-whatsapp-out-${order.id}`}>
                          <div className="border-b pb-1.5 border-cream-200 dark:border-sage-900 flex justify-between items-center">
                            <h5 className="font-extrabold text-slate-900 dark:text-slate-200 flex items-center gap-1.5 text-xs">
                              <MessageSquare className="w-4.5 h-4.5 text-emerald-600" />
                              <span>{isAr ? 'إرسال تحديثات وإشعارات للعميل (واتساب مباشر)' : 'Broadcast Live WhatsApp Progress Dispatch'}</span>
                            </h5>
                            <button
                              id={`open-messaging-${order.id}`}
                              onClick={() => handleOpenMessaging(order)}
                              className="text-xs font-black text-emerald-600 hover:underline flex items-center gap-1 cursor-pointer"
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
                                <label className="text-xs text-slate-900 block font-black">{isAr ? 'اختر قالب الإشعار الجاهز لتجهيز الرسالة:' : 'Choose pre-defined formatted template:'}</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  <button
                                    id={`tpl-completed-${order.id}`}
                                    type="button"
                                    onClick={() => handleTemplateChange(order, 'completed100')}
                                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                                      selectedMessageTemplate === 'completed100'
                                        ? 'bg-emerald-600 border-emerald-650 text-white'
                                        : 'hover:bg-slate-100 dark:hover:bg-slate-900 border-cream-300 dark:border-sage-850 text-slate-800'
                                    }`}
                                  >
                                    <div className="text-xs font-black">{isAr ? 'إشعار بإكمال الطلب' : 'Completion Alert'}</div>
                                  </button>

                                  <button
                                    id={`tpl-payment-${order.id}`}
                                    type="button"
                                    onClick={() => handleTemplateChange(order, 'paymentReminder')}
                                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                                      selectedMessageTemplate === 'paymentReminder'
                                        ? 'bg-emerald-600 border-emerald-650 text-white'
                                        : 'hover:bg-slate-100 dark:hover:bg-slate-900 border-cream-300 dark:border-sage-850 text-slate-800'
                                    }`}
                                  >
                                    <div className="text-xs font-black">{isAr ? 'تذكير بحالة الدفع' : 'Payment Reminder'}</div>
                                  </button>
                                </div>
                              </div>

                              <div className="space-y-1.5 text-xs">
                                <label className="text-slate-900 block font-black">{isAr ? 'معاينة نص الرسالة الجاهزة (يمكنك التعديل عليه):' : 'Interactive text editor (feel free to modify text):'}</label>
                                <textarea
                                  rows={4}
                                  value={customMessageText}
                                  onChange={(e) => setCustomMessageText(e.target.value)}
                                  className={`w-full p-3 rounded-xl border outline-none resize-none leading-relaxed font-sans font-bold ${
                                    theme === 'dark' ? 'bg-sage-950 border-sage-850 text-white' : 'bg-slate-100 border-cream-220 text-cream-950'
                                  }`}
                                />
                              </div>

                              <div className="flex justify-between items-center gap-4 text-xs">
                                <span className="text-[10px] text-slate-900 font-extrabold bg-slate-100 px-2 py-1 rounded-md">
                                  {isAr ? `سيتم التوجيه لهاتف العميل: ${order.clientPhone}` : `Redirect to client WhatsApp cell: ${order.clientPhone}`}
                                </span>
                                <div className="flex gap-2">
                                  <button
                                    id={`cancel-msg-${order.id}`}
                                    type="button"
                                    onClick={() => setActiveMessagingOrderId(null)}
                                    className="px-4 py-2 border border-cream-350 text-slate-805 rounded-lg font-black hover:bg-slate-100 transition-colors cursor-pointer"
                                  >
                                    {isAr ? 'إلغاء' : 'Cancel'}
                                  </button>
                                  <button
                                    id={`send-msg-btn-${order.id}`}
                                    type="button"
                                    onClick={() => handleSendWhatsAppSubmit(order)}
                                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
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
                theme === 'dark' ? 'bg-sage-950 border-sage-800 text-white' : 'bg-white border-cream-205 text-cream-900'
              }`}
            >
              
              {/* Header */}
              <div className="flex items-center justify-between border-b pb-4 border-cream-200 dark:border-sage-855 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-lg ${isPendingPreset ? 'bg-amber-500/15 text-amber-600' : 'bg-emerald-600/15 text-emerald-600'}`}>
                    {isPendingPreset ? <Clock className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-serif font-black text-sm text-slate-900 dark:text-slate-300">
                      {isAr 
                        ? (isPendingPreset ? 'نموذج إنشاء طلب معلّق' : 'نموذج إنشاء طلب جديد (مدار)')
                        : (isPendingPreset ? 'Register New Pending Order' : 'Madar New Project Registration')
                      }
                    </h3>
                    <p className="text-[10px] text-slate-900 font-extrabold mt-0.5">
                      {isAr 
                        ? (isPendingPreset ? 'يتم حفظ الطلب فوراً كطلب معلق في النظام لانتظار تأكيد الدفعة من العميل' : 'سجل مشاريع العملاء، حدد الأسعار تلقائياً في خانات العمل حرّة')
                        : 'Configure metadata characteristics & apply custom percentage deductions'
                      }
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="p-1 px-2 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-900 hover:text-slate-600 font-black rounded-md text-xs cursor-pointer"
                  id="close-create-modal"
                >
                  ✕
                </button>
              </div>

              {/* Form Content Scrolling Frame */}
              <form onSubmit={handleCreateOrderSubmit} className="flex-1 overflow-y-auto py-5 space-y-5 pr-1 pl-1 text-xs" id="creation-form">
                
                {/* 1. Project identity / identification */}
                <div className="space-y-3.5">
                  <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest block border-b pb-1 border-dotted border-cream-220 dark:border-sage-900">
                    {isAr ? 'بيانات ومعرف الطلب' : 'Order Identification Details'}
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-black text-slate-900 block">{isAr ? 'رقم الطلب:' : 'Authorized Order Number:'} *</label>
                      <input
                        type="text"
                        required
                        value={newOrderIdInput}
                        onChange={(e) => setNewOrderIdInput(e.target.value)}
                        placeholder=""
                        className={`w-full p-2.5 text-xs rounded-xl border outline-none font-bold font-mono focus:border-emerald-600 transition-colors ${
                          theme === 'dark' ? 'bg-sage-950 border-sage-850 text-white' : 'bg-slate-100 border-cream-220 text-cream-950'
                        }`}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-black text-slate-900 block">{isAr ? 'اسم العميل بالكامل:' : 'Client Full Name:'} *</label>
                      <input
                        type="text"
                        required
                        value={newClientName}
                        onChange={(e) => setNewClientName(e.target.value)}
                        placeholder=""
                        className={`w-full p-2.5 text-xs rounded-xl border outline-none font-bold focus:border-emerald-600 transition-colors ${
                          theme === 'dark' ? 'bg-sage-950 border-sage-850 text-white' : 'bg-slate-100 border-cream-220 text-cream-950'
                        }`}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-black text-slate-900 block">{isAr ? 'رقم جوال العميل:' : 'WhatsApp Mobile Number:'}</label>
                      <input
                        type="tel"
                        value={newClientPhone}
                        onChange={(e) => setNewClientPhone(e.target.value)}
                        placeholder=""
                        className={`w-full p-2.5 text-xs rounded-xl border outline-none font-bold font-mono focus:border-emerald-600 transition-colors ${
                          theme === 'dark' ? 'bg-sage-950 border-sage-850 text-white' : 'bg-slate-100 border-cream-220 text-cream-950'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-1">
                    <label className="text-[11px] font-black text-slate-900 block">{isAr ? 'البريد الإلكتروني للعميل:' : 'Client Email:'}</label>
                    <input
                      type="email"
                      value={newClientEmail}
                      onChange={(e) => setNewClientEmail(e.target.value)}
                      placeholder=""
                      className={`w-full p-2.5 text-xs rounded-xl border outline-none font-bold focus:border-emerald-650 transition-colors ${
                        theme === 'dark' ? 'bg-sage-950 border-sage-850 text-white' : 'bg-slate-100 border-cream-220 text-cream-950'
                      }`}
                    />
                  </div>
                </div>

                {/* 2. Custom Services list with manageable names and prices */}
                <div className="space-y-3.5">
                  <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest block border-b pb-1 border-dotted border-cream-205 dark:border-sage-900">
                    {isAr ? 'تحديد الخدمات والمنتجات والتحكم بالأسعار' : 'Configure Custom Services & Manage Pricing'}
                  </span>

                  <div className="space-y-2.5 max-h-[220px] overflow-y-auto p-3 border border-dashed border-cream-250 dark:border-sage-900 rounded-xl bg-slate-50/50 dark:bg-sage-950/10" id="custom-services-rows">
                    {customServices.map((srv, index) => (
                      <div key={srv.id} className="flex gap-2 items-center" id={`srv-row-${srv.id}`}>
                        {/* Service Item Index Badge */}
                        <span className="w-5 h-5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-600 font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                          {index + 1}
                        </span>

                        {/* Name Input */}
                        <div className="flex-1 min-w-0">
                          <input
                            type="text"
                            required
                            placeholder={isAr ? 'اسم الخدمة أو المنتج...' : 'Service or product name...'}
                            value={srv.name}
                            onChange={(e) => {
                              const value = e.target.value;
                              setCustomServices(prev => prev.map(s => s.id === srv.id ? { ...s, name: value } : s));
                            }}
                            className={`w-full p-2 text-xs rounded-lg border outline-none font-semibold ${
                              theme === 'dark' ? 'bg-sage-950 border-sage-850 text-white focus:border-emerald-600' : 'bg-white border-cream-200 text-cream-900 focus:border-emerald-600'
                            }`}
                          />
                        </div>

                        {/* Price Input */}
                        <div className="w-24 shrink-0">
                          <input
                            type="number"
                            required
                            min={0}
                            placeholder={isAr ? 'السعر' : 'Price'}
                            value={srv.price || ''}
                            onChange={(e) => {
                              const value = Math.max(0, parseFloat(e.target.value) || 0);
                              setCustomServices(prev => prev.map(s => s.id === srv.id ? { ...s, price: value } : s));
                            }}
                            className={`w-full p-2 text-xs rounded-lg border outline-none font-bold font-mono ${
                              theme === 'dark' ? 'bg-sage-950 border-sage-850 text-white focus:border-emerald-600' : 'bg-white border-cream-200 text-cream-900 focus:border-emerald-600'
                            }`}
                          />
                        </div>

                        {/* Delete Service Row button */}
                        {customServices.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              setCustomServices(prev => prev.filter(s => s.id !== srv.id));
                            }}
                            className="p-1 px-2 border border-rose-200 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                            title={isAr ? 'حذف هذه الخدمة' : 'Delete service'}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Add Service Row trigger button */}
                  <button
                    type="button"
                    onClick={() => {
                      setCustomServices(prev => [...prev, { id: Date.now().toString() + Math.random().toString().slice(-3), name: '', price: 0 }]);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-emerald-300 text-emerald-600 hover:bg-emerald-50 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isAr ? 'إضافة خدمة أو منتج جديد' : 'Add custom service / product'}</span>
                  </button>
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
                        placeholder=""
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
                        placeholder=""
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
                        <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400 text-sm tracking-tight">{finalCalculatedPrice.toLocaleString()} ريال</span>
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
