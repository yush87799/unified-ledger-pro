import express from 'express';
import dashboardApp from './services/dashboard/index';
import inventoryApp from './services/inventory/index';
import invoicingApp from './services/invoicing/index';
import settingsApp from './services/settings/index';

const app = express();
const port = process.env.PORT || 10000;

// Mount all microservices under a unified API Gateway
app.use('/api/dashboard', dashboardApp);
app.use('/api/inventory', inventoryApp);
app.use('/api/invoicing', invoicingApp);
app.use('/api/settings', settingsApp);

app.get('/', (req, res) => res.send('Unified Ledger Pro API Gateway is active.'));

app.listen(port, () => {
  console.log(`🚀 Unified API Gateway listening on port ${port}`);
});