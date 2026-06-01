export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: 'file' | 'link';
  createdAt: string;
}

export interface ServiceItem {
  id: string;
  titleArabic: string;
  titleEnglish: string;
  descriptionArabic: string;
  descriptionEnglish: string;
  price: number;
}

export interface Order {
  id: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  titleArabic: string;
  titleEnglish: string;
  descriptionArabic: string;
  descriptionEnglish: string;
  date: string;
  price: number; // in Saudi Riyal (SAR)
  progress: number; // 0 to 100
  paymentStatus: 'paid' | 'pending' | 'refunded';
  invoiceStatus: 'generated' | 'draft';
  orderStatus: 'new' | 'processing' | 'completed' | 'cancelled';
  attachments: Attachment[];
  services?: ServiceItem[];
  discount?: number; // percentage discount (e.g., 5, 10, 15...)
  originalPrice?: number; // pre-discount price
}

export interface ExternalRevenue {
  id: string;
  amount: number;
  descriptionArabic: string;
  descriptionEnglish: string;
  date: string;
  categoryArabic: string;
  categoryEnglish: string;
}

export interface ProfitSplits {
  operationalPercent: number; // e.g. 40%
  partnersPercent: number;    // e.g. 40%
  savingsPercent: number;     // e.g. 20%
}

export interface NotificationLog {
  id: string;
  orderId: string;
  clientPhone: string;
  messageArabic: string;
  messageEnglish: string;
  timestamp: string;
}

export type Theme = 'light' | 'dark';
export type Language = 'ar' | 'en';
