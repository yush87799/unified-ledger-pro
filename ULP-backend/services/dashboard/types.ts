
export interface InvoiceItem {
  price: number;
  buyingPrice?: number;
  qty: number;
}

export interface Invoice {
  grandTotal: number;
  gstTotal: number;
  items: InvoiceItem[];
  createdAt: string;
}

export interface Product {
  buyingPrice?: number;
  price: number;
  stock: number;
}

export interface DashboardStats {
  revenue: { value: number; trend: number };
  profit: { value: number; trend: number };
  tax: { value: number };
  assets: { value: number; trend: number };
  salesTrend: { name: string; sales: number }[];
  revenueVsExpense: { name: string; revenue: number; expense: number }[];
}
