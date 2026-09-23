// ─── Shared domain types ──────────────────────────────────────────────────────

export interface Address {
  id: string;
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
  createdAt: number;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  image: string;
  description?: string;
  inStock: boolean;
}

export interface WishlistItem {
  id: string;
  productId: string;
  name: string;
  image: string;
  price: number;
  category: string;
  addedAt: number;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  category: string;
  addedAt: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "order" | "wishlist" | "promo" | "account";
  read: boolean;
  createdAt: number;
  link?: string;
}

export interface SupportTicket {
  id: string;
  uid: string;
  userEmail: string;
  userName: string;
  subject: string;
  message: string;
  category: "order" | "return" | "payment" | "other";
  status: "open" | "in_progress" | "closed";
  attachmentURLs: string[];
  createdAt: number;
  updatedAt: number;
  adminNote?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  category: string;
  /** Vendor who owns this line item — set at checkout for sales reporting. */
  vendorId?: string;
  sku?: string;
}

export interface Order {
  id: string;
  uid: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  items: OrderItem[];
  subtotal: number;
  /** GST amount included in total (3% of subtotal). */
  gst?: number;
  /** Amount paid via Razorpay = subtotal + gst. Shipping is not charged. */
  total: number;
  currency: string;
  status: "paid" | "failed" | "pending";
  userEmail: string;
  userName: string;
  address?: string;
  createdAt: number;
  invoiceNumber: string;
  // Shipping fields (populated after shipment is booked)
  awb?: string;
  courierName?: string;
  shipmentStatus?: "pending" | "booked" | "in_transit" | "out_for_delivery" | "delivered" | "cancelled" | "failed";
  shiprocketOrderId?: number;
  shiprocketShipmentId?: number;
  shippingAddress?: {
    name: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
  };
}

// ─── CMS Content types ────────────────────────────────────────────────────────

export type ItemStatus = "published" | "draft";

export interface HeroSlide {
  id: string;
  url: string;
  alt: string;
  order: number;
  status: ItemStatus;
}

export interface HeroContent {
  slides: HeroSlide[];
  intervalMs: number;
  status: "published" | "draft";
  updatedAt: number;
  updatedBy: string;
}

export interface NewArrivalItem {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  order: number;
  status: ItemStatus;
}

export interface NewArrivalsContent {
  items: NewArrivalItem[];
  status: "published" | "draft";
  updatedAt: number;
  updatedBy: string;
}

export interface SponsoredSlide {
  id: string;
  title: string;
  image: string;
  order: number;
  status: ItemStatus;
}

export interface SponsoredContent {
  slides: SponsoredSlide[];
  status: "published" | "draft";
  updatedAt: number;
  updatedBy: string;
}

export interface MediaFile {
  id: string;
  filename: string;
  url: string;
  storagePath: string;
  type: string;
  size: number;
  uploadedBy: string;
  createdAt: number;
}
