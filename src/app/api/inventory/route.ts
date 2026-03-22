
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { Product, StockLog } from '@/lib/types';

const DATA_DIR = path.join(process.cwd(), 'src/data');
const DATA_FILE = path.join(DATA_DIR, 'inventory.json');
const LOG_FILE = path.join(DATA_DIR, 'stock_logs.json');

async function ensureDataFile(filePath: string, defaultData: any = []) {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    try {
      await fs.access(filePath);
    } catch {
      await fs.writeFile(filePath, JSON.stringify(defaultData, null, 2));
    }
  } catch (error) {
    console.error(`Error ensuring ${filePath}:`, error);
  }
}

async function logStockChange(log: Omit<StockLog, 'id' | 'timestamp'>) {
  await ensureDataFile(LOG_FILE);
  const content = await fs.readFile(LOG_FILE, 'utf-8');
  const logs = JSON.parse(content);
  const newLog: StockLog = {
    ...log,
    id: `LOG-${Date.now()}`,
    timestamp: new Date().toISOString()
  };
  logs.unshift(newLog);
  await fs.writeFile(LOG_FILE, JSON.stringify(logs, null, 2));
}

export async function GET() {
  await ensureDataFile(DATA_FILE);
  try {
    const fileContent = await fs.readFile(DATA_FILE, 'utf-8');
    const data = JSON.parse(fileContent);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read inventory' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  await ensureDataFile(DATA_FILE);
  try {
    const newProduct: Product = await request.json();
    const content = await fs.readFile(DATA_FILE, 'utf-8');
    const inventory = JSON.parse(content);
    
    inventory.unshift(newProduct);
    await fs.writeFile(DATA_FILE, JSON.stringify(inventory, null, 2));

    await logStockChange({
      productId: newProduct.id,
      productName: newProduct.name,
      type: 'in',
      qty: newProduct.stock,
      note: 'Initial stock registration'
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save product' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  await ensureDataFile(DATA_FILE);
  try {
    const updatedProduct: Product = await request.json();
    const content = await fs.readFile(DATA_FILE, 'utf-8');
    let inventory: Product[] = JSON.parse(content);
    
    const oldProduct = inventory.find(p => p.id === updatedProduct.id);
    if (oldProduct) {
      if (updatedProduct.stock !== oldProduct.stock) {
        const diff = updatedProduct.stock - oldProduct.stock;
        await logStockChange({
          productId: updatedProduct.id,
          productName: updatedProduct.name,
          type: diff > 0 ? 'in' : 'out',
          qty: Math.abs(diff),
          note: diff < 0 ? 'manual stock removal' : 'manual stock addition'
        });
      }
    }

    inventory = inventory.map(p => p.id === updatedProduct.id ? updatedProduct : p);
    await fs.writeFile(DATA_FILE, JSON.stringify(inventory, null, 2));
    return NextResponse.json(updatedProduct);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

  await ensureDataFile(DATA_FILE);
  try {
    const content = await fs.readFile(DATA_FILE, 'utf-8');
    let inventory: Product[] = JSON.parse(content);
    inventory = inventory.filter(p => p.id !== id);
    await fs.writeFile(DATA_FILE, JSON.stringify(inventory, null, 2));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
