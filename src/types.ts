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
}
