export interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // in DZD (DA)
  originalPrice?: number; // in DZD (DA) - before promotion
  imageUrl: string;
  category: string;
  stock: number;
  salesCount: number;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type PaymentMethod = 'edahabia' | 'baridimob' | 'delivery';

export interface Order {
  id: string;
  transactionId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerWilaya: string;
  items: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  totalAmount: number;
  discountAmount?: number;
  promoCodeApplied?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: 'pending' | 'verified' | 'failed';
  orderStatus: 'received' | 'processing' | 'shipped' | 'delivered' | 'returned';
  transactionDate: string;
  receiptScreenshot?: string; // Base64 or local representation of upload
  cardLastFour?: string;
  otpVerified: boolean;
  returnStatus?: 'none' | 'requested' | 'approved' | 'rejected';
  returnReason?: string;
  returnDate?: string;
  adminReturnNotes?: string;
  deliveryDate?: string;
  deliveryTimeSlot?: string;
}

export interface Wilaya {
  code: number;
  name: string;
  shippingFee: number;
}

export interface StoreSettings {
  storeName: string;
  logoUrl: string;
  sellerPhone: string;
  promoBannerActive?: boolean;
  promoBannerText?: string;
  promoCodeActive?: boolean;
  promoCode?: string;
  promoDiscountType?: 'percentage' | 'fixed';
  promoDiscountValue?: number;
  algeriaCupWinActive?: boolean;
  algeriaCupWinsCount?: number;
  googleMapsApiKey?: string;
}

export interface AICampaign {
  id: string;
  name: string;
  budget: number;
  ctr: number;
  conversions: number;
  cpa: number;
  roi: number;
  status: 'active' | 'paused';
}

export interface AIDecision {
  id: string;
  productId: string;
  productName: string;
  oldPrice: number;
  newPrice: number;
  reason: string;
  date: string;
  status: 'applied' | 'pending' | 'rolled_back' | 'rejected';
}

export interface AIMarketingCampaign {
  id: string;
  name: string;
  trigger: string;
  status: 'active' | 'inactive';
  discount: number;
}

export interface AIHistoricalStats {
  date: string;
  revenue: number;
  adSpend: number;
  conversionRate: number;
  profit: number;
}

export interface AISuiteState {
  enabled: boolean;
  dynamicPricing: boolean;
  pricingStrategy: 'profit' | 'conversion' | 'balanced';
  safetyMinPricePct: number;
  safetyMaxPricePct: number;
  requireHumanValidation: boolean;
  autoAdvertising: boolean;
  marketingAutomation: boolean;
  conversionIntelligence: boolean;
  profitLoopEnabled: boolean;
  adCampaigns: AICampaign[];
  pricingDecisions: AIDecision[];
  marketingCampaigns: AIMarketingCampaign[];
  historicalStats: AIHistoricalStats[];
}
