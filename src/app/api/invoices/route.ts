
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'src/data');
const INVOICES_FILE = path.join(DATA_DIR, 'invoices.json');
const INVENTORY_FILE = path.join(DATA_DIR, 'inventory.json');

async function ensureDataFile(filePath: string, defaultData: any = []) {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    try {
      await fs.access(filePath);
    } catch {
      await fs.writeFile(filePath, JSON.stringify(defaultData, null, 2));
    }
  } catch (error) {
    console.error(`Error ensuring data file ${filePath}:`, error);
  }
}

export async function GET() {
  await ensureDataFile(INVOICES_FILE);
  try {
    const data = await fs.readFile(INVOICES_FILE, 'utf-8');
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read invoice data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  await ensureDataFile(INVOICES_FILE);
  await ensureDataFile(INVENTORY_FILE, []);

  try {
    const newInvoice = await request.json();
    
    // 1. Save the Invoice
    const invoicesData = await fs.readFile(INVOICES_FILE, 'utf-8');
    const invoices = JSON.parse(invoicesData);
    
    const invoiceWithId = {
      ...newInvoice,
      id: `INV-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    
    const updatedInvoices = [invoiceWithId, ...invoices];
    await fs.writeFile(INVOICES_FILE, JSON.stringify(updatedInvoices, null, 2));

    // 2. Update Inventory Stock
    const inventoryData = await fs.readFile(INVENTORY_FILE, 'utf-8');
    const inventory = JSON.parse(inventoryData);

    const updatedInventory = inventory.map((product: any) => {
      const soldItem = newInvoice.items.find((item: any) => item.productId === product.id);
      if (soldItem) {
        const newStock = Math.max(0, product.stock - soldItem.qty);
        return {
          ...product,
          stock: newStock,
          status: newStock === 0 ? 'Out of Stock' : newStock < 10 ? 'Low' : 'In Stock'
        };
      }
      return product;
    });

    await fs.writeFile(INVENTORY_FILE, JSON.stringify(updatedInventory, null, 2));

    return NextResponse.json(invoiceWithId, { status: 201 });
  } catch (error) {
    console.error('Invoice POST error:', error);
    return NextResponse.json({ error: 'Failed to save invoice and update stock' }, { status: 500 });
  }
}
