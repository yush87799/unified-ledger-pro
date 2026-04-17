
export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  mrp: number;
  price: number;
  buyingPrice: number;
  stock: number;
  unit: string;
  warehouse: string;
  status: 'In Stock' | 'Low' | 'Out of Stock';
  gst: string;
}

export interface LineItem {
  id: string;
  productId: string;
  productName: string;
  qty: number;
  price: number;
  buyingPrice: number;
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
