export type Money = number;

export interface Category {
  id: string;
  name: string;
  slug: string;
  productCount?: number;
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string | null;
}

export interface Product {
  id: string;
  sku: string | null;
  slug: string;
  name: string;
  summary: string | null;
  description: string | null;
  category: { id: string; name: string; slug: string } | null;
  price: Money | null;
  priceOnRequest: boolean;
  currency: string;
  taxPercent: number;
  priceIncludesTax: boolean;
  unit: string;
  minQuantity: number;
  maxQuantity: number | null;
  inStock: boolean;
  attributes: { name: string; value: string }[];
  images: ProductImage[];
}

export interface ProductList {
  items: Product[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export interface Catalog {
  name: string;
  slug: string;
  currency: string;
  acceptingOrders: boolean;
  requirePhone: boolean;
  requireAddress: boolean;
  terms: string | null;
  storeUrl: string;
  branding: {
    businessName: string;
    logoUrl: string | null;
    theme: string;
    contactEmail: string | null;
    contactPhone: string | null;
  };
  categories: Category[];
}

export interface OrderItem {
  id: string;
  productId: string | null;
  sku: string | null;
  name: string;
  unit: string;
  quantity: number;
  unitPrice: Money | null;
  taxPercent: number;
  priceIncludesTax: boolean;
  netAmount: Money | null;
  taxAmount: Money | null;
  lineTotal: Money | null;
  lineNote: string | null;
}

export type OrderStatus = "received" | "payment_pending" | "confirmed" | "complete" | "cancelled";

export interface Order {
  id: string;
  number: string;
  status: OrderStatus;
  statusLabel: string;
  needsPricing: boolean;
  currency: string;
  placedAt: string;
  orderUrl: string;
  customer: { name: string; email: string; phone: string | null; company: string | null };
  shippingAddress: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  notes: string | null;
  items: OrderItem[];
  subtotal: Money | null;
  taxTotal: Money | null;
  shippingAmount: Money | null;
  roundOff: Money | null;
  total: Money | null;
  shipment: {
    partner: string | null;
    trackingCode: string | null;
    trackingUrl: string | null;
    shippedAt: string;
  } | null;
  payment: {
    amountDue: Money;
    currency: string;
    reference: string;
    payeeName: string | null;
    upiId: string | null;
    upiQrUrl: string | null;
    bankDetails: string | null;
    claimedAt: string | null;
    claimReference: string | null;
  } | null;
  cancelledReason: string | null;
  thankYouNote: string | null;
}

export interface TrackResult {
  order: Order;
  branding?: Catalog["branding"];
  statusLabels?: Partial<Record<OrderStatus, string>>;
}

export interface ListedOrderItem {
  name: string;
  quantity: number;
  unit: string;
}

export interface ListedOrder {
  token: string;
  number: string;
  status: OrderStatus;
  statusLabel: string;
  needsPricing: boolean;
  currency: string;
  placedAt: string;
  total: Money | null;
  itemCount: number;
  items: ListedOrderItem[];
  shipment: Order["shipment"];
}

export interface PhoneOrderList {
  orders: ListedOrder[];
  hasMore: boolean;
}

export interface PlaceOrderInput {
  customer: { name: string; email?: string; phone?: string; company?: string };
  shippingAddress?: Order["shippingAddress"];
  items: { sku?: string; productId?: string; quantity: number }[];
  notes?: string;
  website?: string;
}
