
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

export interface StockLog {
  id: string;
  productId: string;
  productName: string;
  type: 'in' | 'out';
  qty: number;
  timestamp: string;
  note: string;
}
