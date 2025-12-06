const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cron = require('node-cron');
const bodyParser = require('body-parser');

const authRoutes = require('./routes/auth');
const analyticsRoutes = require('./routes/analytics');
const ingestRoutes = require('./routes/ingest');
const webhookRoutes = require('./routes/webhooks');
const { syncAllTenants } = require('./services/syncService');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Merchant Insights backend is running');
});

// Mount authentication routes
app.use('/auth', authRoutes);

// Dummy analytics so UI doesn’t break
app.get('/analytics/summary', (req, res) => {
  res.json({
    totalCustomers: 5,
    totalOrders: 12,
    totalRevenue: 1234.56
  });
});

app.get('/analytics/orders-by-date', (req, res) => {
  res.json([
    { date: '2025-12-01', orderCount: 2, revenue: 200 },
    { date: '2025-12-02', orderCount: 3, revenue: 350 }
  ]);
});

app.get('/analytics/top-customers', (req, res) => {
  res.json([
    { name: 'Test User', email: 'test@example.com', totalSpent: 300, ordersCount: 3 }
  ]);
});

// IMPORTANT: Use 5001 to avoid MacOS AirPlay conflict
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});
