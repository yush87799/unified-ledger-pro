
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'src/data');
const DATA_FILE = path.join(DATA_DIR, 'inventory.json');

/**
 * Ensures the data directory and inventory file exist.
 * If not, initializes with default data.
 */
async function ensureDataFile() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    try {
      await fs.access(DATA_FILE);
    } catch {
      const initialData = [
        { 
          id: 'SKU-8271', 
          name: 'Ergonomic Office Chair', 
          brand: 'Featherlite',
          category: 'Standard Rate', 
          mrp: 18000, 
          price: 14999, 
          stock: 45, 
          unit: 'pcs',
          status: 'In Stock', 
          gst: '18%' 
        },
        { 
          id: 'SKU-1922', 
          name: 'Wireless Mechanical Keyboard', 
          brand: 'Logitech',
          category: 'Standard Rate', 
          mrp: 8999, 
          price: 7499, 
          stock: 12, 
          unit: 'pcs',
          status: 'Low', 
          gst: '18%' 
        }
      ];
      await fs.writeFile(DATA_FILE, JSON.stringify(initialData, null, 2));
    }
  } catch (error) {
    console.error('Error ensuring data file:', error);
  }
}

export async function GET() {
  await ensureDataFile();
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read inventory data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  await ensureDataFile();
  try {
    const newProduct = await request.json();
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    const inventory = JSON.parse(data);
    
    // Add new product to the beginning of the list
    const updatedInventory = [newProduct, ...inventory];
    
    await fs.writeFile(DATA_FILE, JSON.stringify(updatedInventory, null, 2));
    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save product' }, { status: 500 });
  }
}
