
import express from 'express';
import cors from 'cors';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Product, StockLog } from './types';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app = express();
const port = 3002;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ulp_database')
  .then(() => console.log('Connected to MongoDB cleanly!'))
  .catch(err => console.error('MongoDB connection error:', err));

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
    const inventory = await InventoryModel.find({}).sort({ _id: -1 }).lean();
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read inventory' });
  }
});

app.post('/', async (req, res) => {
  try {
    const newProduct = new InventoryModel(req.body);
    await newProduct.save();

    await logStockChange({
      productId: newProduct.get('id'),
      productName: newProduct.get('name'),
      type: 'in',
      qty: newProduct.get('stock'),
      note: 'Initial stock registration'
    });

    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save product' });
  }
});

app.put('/', async (req, res) => {
  try {
    const updatedProduct = req.body;
    const oldProduct = await InventoryModel.findOne({ id: updatedProduct.id });
    
    if (oldProduct && updatedProduct.stock !== oldProduct.get('stock')) {
      const diff = updatedProduct.stock - oldProduct.get('stock');
      await logStockChange({
        productId: updatedProduct.id,
        productName: updatedProduct.name,
        type: diff > 0 ? 'in' : 'out',
        qty: Math.abs(diff),
        note: diff < 0 ? 'manual stock removal' : 'manual stock addition'
      });
    }

    await InventoryModel.updateOne({ id: updatedProduct.id }, updatedProduct);
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

app.delete('/', async (req, res) => {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'ID required' });

  try {
    await InventoryModel.deleteOne({ id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});


app.listen(port, () => {
  console.log(`Inventory service listening at http://localhost:${port}`);
});
