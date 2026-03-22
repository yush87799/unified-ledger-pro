
import { LucideIcon } from 'lucide-react';

export type UserRole = 'owner' | 'admin' | 'billing' | 'accountant' | 'inventory';

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  mrp: number;
  price: number;
  stock: number;
  unit: string;
  status: 'In Stock' | 'Low' | 'Out of Stock';
  gst: string;
}

export interface LineItem {
  id: string;
  productId: string;
  productName: string;
  qty: number;
  price: number;
  mrp: number;
  gstRate: number;
  unit: string;
  total: number;
}

export type PaymentMode = 'cash' | 'online' | 'pending';

export interface Invoice {
  id: string;
  customer: {
    name: string;
    phone: string;
    address: string;
    stateCode: string;
  };
  items: LineItem[];
  subtotal: number;
  gstTotal: number;
  grandTotal: number;
  taxType: 'INTRA' | 'INTER';
  businessStateCode: string;
  paymentMode: PaymentMode;
  createdAt: string;
}

export interface StockLog {
  id: string;
  productId: string;
  productName: string;
  type: 'in' | 'out';
  qty: number;
  timestamp: string;
  note: string;
}

export interface BusinessSettings {
  businessName: string;
  brandName: string;
  email: string;
  phone: string;
  address: string;
  gstin: string;
  stateCode: string;
}

export interface DashboardStats {
  revenue: { value: number; trend: number };
  profit: { value: number; trend: number };
  tax: { value: number };
  assets: { value: number; trend: number };
  salesTrend: { name: string; sales: number }[];
  revenueVsExpense: { name: string; revenue: number; expense: number }[];
}
