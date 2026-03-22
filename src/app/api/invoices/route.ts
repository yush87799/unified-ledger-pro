
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { Invoice, Product, StockLog } from '@/lib/types';

const DATA_DIR = path.join(process.cwd(), 'src/data');
const INVOICES_FILE = path.join(DATA_DIR, 'invoices.json');
const INVENTORY_FILE = path.join(DATA_DIR, 'inventory.json');
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
  await ensureDataFile(INVOICES_FILE);
  try {
    const fileContent = await fs.readFile(INVOICES_FILE, 'utf-8');
    const data = JSON.parse(fileContent);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read invoices' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  await ensureDataFile(INVOICES_FILE);
  await ensureDataFile(INVENTORY_FILE);

  try {
    const payload = await request.json();
    const invoicesContent = await fs.readFile(INVOICES_FILE, 'utf-8');
    const invoices = JSON.parse(invoicesContent);
    
    const invoiceId = `INV-${Date.now()}`;
    const newInvoice: Invoice = {
      ...payload,
      id: invoiceId,
      createdAt: new Date().toISOString() // Detailed DateTime
    };
    
    invoices.unshift(newInvoice);
    await fs.writeFile(INVOICES_FILE, JSON.stringify(invoices, null, 2));

    const inventoryContent = await fs.readFile(INVENTORY_FILE, 'utf-8');
    let inventory: Product[] = JSON.parse(inventoryContent);

    for (const item of newInvoice.items) {
      const productIdx = inventory.findIndex(p => p.id === item.productId);
      if (productIdx !== -1) {
        const product = inventory[productIdx];
        const oldStock = product.stock;
        product.stock = Math.max(0, oldStock - item.qty);
        product.status = product.stock === 0 ? 'Out of Stock' : product.stock < 10 ? 'Low' : 'In Stock';
        
        await logStockChange({
          productId: product.id,
          productName: product.name,
          type: 'out',
          qty: item.qty,
          note: `Sale via Invoice: ${invoiceId}`
        });
      }
    }

    await fs.writeFile(INVENTORY_FILE, JSON.stringify(inventory, null, 2));
    return NextResponse.json(newInvoice, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Process failed' }, { status: 500 });
  }
}
