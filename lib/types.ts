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
  subject: string;
  message: string;
  category: "order" | "return" | "payment" | "other";
  status: "open" | "in_progress" | "closed";
  attachmentURLs: string[];
  createdAt: number;
  updatedAt: number;
  adminNote?: string;
}

// Static product catalog sourced from /public images
export const PRODUCTS: Product[] = [
  { id: "p1", name: "Gold Bangles", category: "Bangles", price: 4500, originalPrice: 5200, image: "/basic-products/bangles.png", inStock: true },
  { id: "p2", name: "Diamond Earrings", category: "Earrings", price: 8900, originalPrice: 10000, image: "/basic-products/earrings.png", inStock: true },
  { id: "p3", name: "Men's Chain", category: "Chains", price: 6200, image: "/basic-products/men-chain.png", inStock: true },
  { id: "p4", name: "Neck Piece", category: "Neckpieces", price: 7800, originalPrice: 9000, image: "/basic-products/neck-piece.png", inStock: true },
  { id: "p5", name: "Solitaire Ring", category: "Rings", price: 12500, image: "/basic-products/ring.png", inStock: true },
  { id: "p6", name: "Daily Wear Set", category: "Sets", price: 5500, image: "/images-2/Daily.jpg", inStock: true },
  { id: "p7", name: "Bridal Jewellery", category: "Bridal", price: 28000, originalPrice: 32000, image: "/images-2/Thebridal.jpg", inStock: true },
  { id: "p8", name: "Vacation Collection", category: "Sets", price: 4200, image: "/images-2/Vacation.jpg", inStock: true },
];

export interface OrderItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  category: string;
}

export interface Order {
  id: string;
  uid: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  items: OrderItem[];
  subtotal: number;
  total: number;
  currency: string;
  status: "paid" | "failed" | "pending";
  userEmail: string;
  userName: string;
  address?: string;
  createdAt: number;
  invoiceNumber: string;
}
