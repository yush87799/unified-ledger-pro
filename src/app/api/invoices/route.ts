
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'src/data');
const DATA_FILE = path.join(DATA_DIR, 'invoices.json');

async function ensureDataFile() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    try {
      await fs.access(DATA_FILE);
    } catch {
      await fs.writeFile(DATA_FILE, JSON.stringify([], null, 2));
    }
  } catch (error) {
    console.error('Error ensuring invoice data file:', error);
  }
}

export async function GET() {
  await ensureDataFile();
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read invoice data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  await ensureDataFile();
  try {
    const newInvoice = await request.json();
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    const invoices = JSON.parse(data);
    
    const invoiceWithId = {
      ...newInvoice,
      id: `INV-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    
    const updatedInvoices = [invoiceWithId, ...invoices];
    await fs.writeFile(DATA_FILE, JSON.stringify(updatedInvoices, null, 2));
    return NextResponse.json(invoiceWithId, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save invoice' }, { status: 500 });
  }
}
