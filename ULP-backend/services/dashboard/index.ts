
import express from 'express';
import cors from 'cors';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Invoice, Product, DashboardStats } from './types';

// Load environment variables from the ULP-backend root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ulp_database')
  .then(() => console.log('Connected to MongoDB cleanly!'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define flexible Mongoose Schemas (strict: false allows your dynamic JSON objects to map perfectly)
const User = mongoose.model('User', new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  role: String,
  orgId: String
}, { strict: false, collection: 'users' }));

const InvoiceModel = mongoose.model('Invoice', new mongoose.Schema({}, { strict: false, collection: 'invoices' }));
const InventoryModel = mongoose.model('Inventory', new mongoose.Schema({}, { strict: false, collection: 'inventory' }));
const SettingsModel = mongoose.model('Settings', new mongoose.Schema({}, { strict: false, collection: 'settings' }));

app.get('/stats', async (req, res) => {
  try {
    const [invoices, inventory] = await Promise.all([
      InvoiceModel.find({}).lean() as unknown as Promise<Invoice[]>,
      InventoryModel.find({}).lean() as unknown as Promise<Product[]>
    ]);

    // KPI Calculations
    const revenue = invoices.reduce((acc, inv) => acc + (inv.grandTotal || 0), 0);
    const tax = invoices.reduce((acc, inv) => acc + (inv.gstTotal || 0), 0);
    
    // Real Profit Calculation: (Selling Price - Buying Price) * Qty
    const profit = invoices.reduce((acc, inv) => {
      const invProfit = (inv.items || []).reduce((itemAcc, item) => {
        return itemAcc + (((item.price || 0) - (item.buyingPrice || 0)) * (item.qty || 0));
      }, 0);
      return acc + invProfit;
    }, 0);

    const assets = inventory.reduce((acc, prod) => acc + ((prod.buyingPrice || prod.price || 0) * (prod.stock || 0)), 0);

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
        .filter(inv => inv.createdAt && inv.createdAt.startsWith(dateStr))
        .reduce((acc, inv) => acc + (inv.grandTotal || 0), 0);
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
      
      const validInvoices = invoices.filter(inv => inv.createdAt && inv.createdAt.startsWith(monthPrefix));
      const monthRevenue = validInvoices.reduce((acc, inv) => acc + (inv.grandTotal || 0), 0);
      
      // Total COGS for the month
      const monthExpense = validInvoices.reduce((acc, inv) => 
        acc + (inv.items || []).reduce((itemAcc, item) => itemAcc + ((item.buyingPrice || 0) * (item.qty || 0)), 0)
      , 0);
      
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

    res.json(stats);
  } catch (error) {
    console.error('Stats aggregation error:', error);
    res.status(500).json({ error: 'Failed to aggregate dashboard statistics' });
  }
});

// GSTR-1 Report Generation (B2B and B2CS Formats)
app.get('/gstr1', async (req, res) => {
  const month = (req.query.month as string) || new Date().toISOString().slice(0, 7); // Default to current YYYY-MM
  
  const [invoices, settingsData] = await Promise.all([
    InvoiceModel.find({ createdAt: { $regex: `^${month}` } }).lean(),
    SettingsModel.find({}).lean()
  ]);
  
  const filtered = invoices;

  // Safely extract the home state from settings (fallback to '27' if missing)
  const settings: any = Array.isArray(settingsData) ? settingsData[0] : settingsData;
  const homeStateCode = settings?.stateCode || settings?.gstin?.substring(0, 2) || '27';

  // GST Offline Tool exact headers
  let b2bCsv = 'GSTIN/UIN of Recipient,Receiver Name,Invoice Number,Invoice date,Invoice Value,Place Of Supply,Reverse Charge,Applicable % of Tax Rate,Invoice Type,E-Commerce GSTIN,Rate,Taxable Value,Cess Amount\n';
  let b2csCsv = 'Type,Place Of Supply,Rate,Taxable Value,Cess Amount,E-Commerce GSTIN\n';

  // B2CS Aggregation map: 'PlaceOfSupply_Rate' -> TaxableValue
  const b2csSummary: Record<string, { pos: string, rate: number, taxable: number, cess: number }> = {};

  filtered.forEach((inv: any) => {
    const customer = inv.customer || {};
    const gstin = customer.gstin || '';
    const isB2B = gstin.trim().length === 15;
    
    // Format date as DD-MMM-YY (Standard GST format)
    const dateObj = new Date(inv.createdAt);
    const invDate = `${dateObj.getDate().toString().padStart(2, '0')}-${dateObj.toLocaleString('en-IN', { month: 'short' })}-${dateObj.getFullYear().toString().slice(-2)}`;
    
    const pos = customer.stateCode ? `${customer.stateCode}-${customer.state || 'State'}` : `${homeStateCode}-HomeState`;
    const items = inv.items || [];

    // Group items by tax rate per invoice
    const rateGroups: Record<number, { taxable: number, cess: number }> = {};
    items.forEach((item: any) => {
      const rate = item.taxRate || 18; // Default to 18% if missing
      const taxable = (item.price * item.qty);
      if (!rateGroups[rate]) rateGroups[rate] = { taxable: 0, cess: 0 };
      rateGroups[rate].taxable += taxable;
    });

    Object.keys(rateGroups).forEach(rateStr => {
      const rate = parseFloat(rateStr);
      const { taxable, cess } = rateGroups[rate];

      if (isB2B) {
        b2bCsv += `${gstin},${customer.name || 'Unknown'},${inv.invoiceNumber || inv.id},${invDate},${inv.grandTotal},${pos},N,,Regular,,${rate},${taxable.toFixed(2)},${cess.toFixed(2)}\n`;
      } else {
        // Aggregate B2C Small
        const key = `${pos}_${rate}`;
        if (!b2csSummary[key]) b2csSummary[key] = { pos, rate, taxable: 0, cess: 0 };
        b2csSummary[key].taxable += taxable;
        b2csSummary[key].cess += cess;
      }
    });
  });

  Object.values(b2csSummary).forEach(summary => {
    b2csCsv += `OE,${summary.pos},${summary.rate},${summary.taxable.toFixed(2)},${summary.cess.toFixed(2)},\n`;
  });

  res.json({ b2b: b2bCsv, b2cs: b2csCsv });
});

// GSTR-3B Report Generation (Section 3.1 Summary)
app.get('/gstr3b', async (req, res) => {
  const month = (req.query.month as string) || new Date().toISOString().slice(0, 7);
  
  const [invoices, settingsData] = await Promise.all([
    InvoiceModel.find({ createdAt: { $regex: `^${month}` } }).lean(),
    SettingsModel.find({}).lean()
  ]);
  
  const filtered = invoices;

  // Safely extract the home state from settings
  const settings: any = Array.isArray(settingsData) ? settingsData[0] : settingsData;
  const homeStateCode = settings?.stateCode || settings?.gstin?.substring(0, 2) || '27';

  let totalTaxable = 0;
  let totalIgst = 0;
  let totalCgst = 0;
  let totalSgst = 0;

  filtered.forEach((inv: any) => {
    const customer = inv.customer || {};
    const posCode = customer.stateCode || homeStateCode;
    const isInterState = posCode !== homeStateCode; 

    const items = inv.items || [];
    items.forEach((item: any) => {
      const rate = item.taxRate || 18;
      const taxable = (item.price * item.qty);
      const taxAmount = taxable * (rate / 100);
      
      totalTaxable += taxable;
      if (isInterState) {
        totalIgst += taxAmount;
      } else {
        totalCgst += taxAmount / 2;
        totalSgst += taxAmount / 2;
      }
    });
  });

  let gstr3bCsv = 'Nature of Supplies,Total Taxable Value,Integrated Tax,Central Tax,State/UT Tax,Cess\n';
  gstr3bCsv += `(a) Outward taxable supplies (other than zero rated nil rated and exempted),${totalTaxable.toFixed(2)},${totalIgst.toFixed(2)},${totalCgst.toFixed(2)},${totalSgst.toFixed(2)},0.00\n`;
  
  res.json({ 
    csv: gstr3bCsv,
    summary: {
      taxable: totalTaxable,
      igst: totalIgst,
      cgst: totalCgst,
      sgst: totalSgst,
      totalTax: totalIgst + totalCgst + totalSgst
    }
  });
});

// --- USER MANAGEMENT API ---
app.get('/users', async (req, res) => {
  const email = req.query.email as string;
  
  if (email) {
    const user = await User.findOne({ email }).lean();
    return res.json(user || { error: 'Not found' });
  }
  
  const users = await User.find({}).lean();
  res.json(users);
});

app.post('/users', async (req, res) => {
  const { email, role, orgId } = req.body;
  
  await User.findOneAndUpdate(
    { email }, 
    { email, role, orgId }, 
    { upsert: true, new: true } // Creates the user if they don't exist, updates if they do!
  );
  
  res.json({ success: true });
});

app.listen(port, () => {
  console.log(`Dashboard service listening at http://localhost:${port}`);
});
