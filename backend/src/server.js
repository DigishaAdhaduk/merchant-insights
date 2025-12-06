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
app.use(
  bodyParser.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    }
  })
);

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Xeno Assignment Backend' });
});

app.use('/auth', authRoutes);
app.use('/analytics', analyticsRoutes);
app.use('/ingest', ingestRoutes);
app.use('/webhooks', webhookRoutes);

cron.schedule('0 * * * *', async () => {
  console.log('Running hourly sync for all tenants...');
  try {
    await syncAllTenants();
  } catch (err) {
    console.error('Cron sync error:', err.message);
  }
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});
