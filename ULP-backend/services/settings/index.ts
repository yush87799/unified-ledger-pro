
import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { BusinessSettings } from './types';

const app = express();
const port = 3004;

app.use(cors());
app.use(express.json());

const DATA_DIR = path.join(__dirname, '../../src/data');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

const DEFAULT_SETTINGS: BusinessSettings = {
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

app.get('/', async (req, res) => {
  await ensureDataFile();
  try {
    const data = await fs.readFile(SETTINGS_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    
    const finalWarehouses = Array.isArray(parsed.warehouses) 
      ? (parsed.warehouses.length > 0 ? parsed.warehouses : DEFAULT_SETTINGS.warehouses)
      : DEFAULT_SETTINGS.warehouses;

    res.json({ 
      ...DEFAULT_SETTINGS, 
      ...parsed,
      warehouses: finalWarehouses
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to read settings' });
  }
});

app.post('/', async (req, res) => {
  await ensureDataFile();
  try {
    const newSettings = req.body;
    if (!newSettings.warehouses || !Array.isArray(newSettings.warehouses)) {
      newSettings.warehouses = DEFAULT_SETTINGS.warehouses;
    }
    await fs.writeFile(SETTINGS_FILE, JSON.stringify(newSettings, null, 2));
    res.json(newSettings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save settings' });
  }
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Settings service listening at http://localhost:${port}`);
  });
}

export default app;
