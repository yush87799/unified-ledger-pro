
import express from 'express';
import cors from 'cors';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Invoice, Product, StockLog } from './types';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app = express();
const port = 3003;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ulp_database')
  .then(() => console.log('Connected to MongoDB cleanly!'))
  .catch(err => console.error('MongoDB connection error:', err));

const InvoiceModel = mongoose.model('Invoice', new mongoose.Schema({}, { strict: false, collection: 'invoices' }));
const InventoryModel = mongoose.model('Inventory', new mongoose.Schema({}, { strict: false, collection: 'inventory' }));
const LogModel = mongoose.model('StockLog', new mongoose.Schema({}, { strict: false, collection: 'stock_logs' }));

async function logStockChange(log: Omit<StockLog, 'id' | 'timestamp'>) {
  const newLog = new LogModel({
    ...log,
    id: `LOG-${Date.now()}`,
    timestamp: new Date().toISOString()
  });
  await newLog.save();
}

app.get('/', async (req, res) => {
  try {
    const invoices = await InvoiceModel.find({}).sort({ createdAt: -1 }).lean();
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read invoices' });
  }
});

app.post('/', async (req, res) => {
  try {
    const payload = req.body;
    
    const invoiceId = `INV-${Date.now()}`;
    const newInvoice = new InvoiceModel({
      ...payload,
      id: invoiceId,
      createdAt: new Date().toISOString()
    });
    
    await newInvoice.save();

    // Update inventory stock seamlessly in MongoDB
    for (const item of newInvoice.get('items')) {
      const product = await InventoryModel.findOne({ id: item.productId });
      if (product) {
        const oldStock = product.get('stock');
        const newStock = Math.max(0, oldStock - item.qty);
        const status = newStock === 0 ? 'Out of Stock' : newStock < 10 ? 'Low' : 'In Stock';
        
        await InventoryModel.updateOne(
          { id: item.productId },
          { $set: { stock: newStock, status: status } }
        );

        await logStockChange({
          productId: product.get('id'),
          productName: product.get('name'),
          type: 'out',
          qty: item.qty,
          note: `Sale via Invoice: ${invoiceId}`
        });
      }
    }

    res.status(201).json(newInvoice);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Process failed' });
  }
});

app.listen(port, () => {
  console.log(`Invoicing service listening at http://localhost:${port}`);
});
