
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { Invoice, Product, DashboardStats } from '@/lib/types';

const DATA_DIR = path.join(process.cwd(), 'src/data');
const INVOICES_FILE = path.join(DATA_DIR, 'invoices.json');
const INVENTORY_FILE = path.join(DATA_DIR, 'inventory.json');

async function readJson<T>(filePath: string): Promise<T[]> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return [];
  }
}

export async function GET() {
  const [invoices, inventory] = await Promise.all([
    readJson<Invoice>(INVOICES_FILE),
    readJson<Product>(INVENTORY_FILE)
  ]);

  // KPI Calculations
  const revenue = invoices.reduce((acc, inv) => acc + inv.grandTotal, 0);
  const tax = invoices.reduce((acc, inv) => acc + inv.gstTotal, 0);
  
  // Real Profit Calculation: (Selling Price - Buying Price) * Qty
  const profit = invoices.reduce((acc, inv) => {
    const invProfit = inv.items.reduce((itemAcc, item) => {
      return itemAcc + ((item.price - (item.buyingPrice || 0)) * item.qty);
    }, 0);
    return acc + invProfit;
  }, 0);

  const assets = inventory.reduce((acc, prod) => acc + ((prod.buyingPrice || prod.price) * prod.stock), 0);

  // Sales Trend (Last 7 Days)
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    return d;
  });

  const salesTrend = last7Days.map(date => {
    const dayName = days[date.getDay()];
    const dateStr = date.toISOString().split('T')[0];
    const daySales = invoices
      .filter(inv => inv.createdAt.startsWith(dateStr))
      .reduce((acc, inv) => acc + inv.grandTotal, 0);
    return { name: dayName, sales: daySales };
  });

  // Monthly Overview
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(today);
    d.setMonth(today.getMonth() - (5 - i));
    return d;
  });

  const revenueVsExpense = last6Months.map(date => {
    const monthName = months[date.getMonth()];
    const monthPrefix = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    const monthRevenue = invoices
      .filter(inv => inv.createdAt.startsWith(monthPrefix))
      .reduce((acc, inv) => acc + inv.grandTotal, 0);
    
    // Total COGS for the month
    const monthExpense = invoices
      .filter(inv => inv.createdAt.startsWith(monthPrefix))
      .reduce((acc, inv) => acc + inv.items.reduce((itemAcc, item) => itemAcc + ((item.buyingPrice || 0) * item.qty), 0), 0);
    
    return { name: monthName, revenue: monthRevenue, expense: monthExpense };
  });

  const stats: DashboardStats = {
    revenue: { value: revenue, trend: 12 },
    profit: { value: profit, trend: 2.1 },
    tax: { value: tax },
    assets: { value: assets, trend: 4.2 },
    salesTrend,
    revenueVsExpense
  };

  return NextResponse.json(stats);
}
