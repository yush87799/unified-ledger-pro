
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'src/data');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

const DEFAULT_SETTINGS = {
  businessName: "Unified Ledger Pro PVT LTD",
  brandName: "Unified Ledger",
  email: "hello@unifiedledger.pro",
  phone: "+91 98765 43210",
  address: "Plot 45, Tech Park Phase 2, Bangalore, Karnataka - 560001",
  gstin: "29AAAAA0000A1Z5",
  stateCode: "29",
  warehouses: ["Main Warehouse"]
};

async function ensureDataFile() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    try {
      await fs.access(SETTINGS_FILE);
    } catch {
      await fs.writeFile(SETTINGS_FILE, JSON.stringify(DEFAULT_SETTINGS, null, 2));
    }
  } catch (error) {
    console.error('Error ensuring settings file:', error);
  }
}

export async function GET() {
  await ensureDataFile();
  try {
    const data = await fs.readFile(SETTINGS_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    // Ensure warehouses is always an array in the response and merged with defaults if empty
    const warehouses = Array.isArray(parsed.warehouses) && parsed.warehouses.length > 0 
      ? parsed.warehouses 
      : DEFAULT_SETTINGS.warehouses;

    return NextResponse.json({ 
      ...DEFAULT_SETTINGS, 
      ...parsed,
      warehouses
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read settings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  await ensureDataFile();
  try {
    const newSettings = await request.json();
    await fs.writeFile(SETTINGS_FILE, JSON.stringify(newSettings, null, 2));
    return NextResponse.json(newSettings);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
