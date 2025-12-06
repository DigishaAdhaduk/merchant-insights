const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');
const { syncTenant, syncAllTenants } = require('../services/syncService');

const router = express.Router();

router.use(auth);

router.post('/tenant', async (req, res) => {
  try {
    const tenantRes = await db.query(`SELECT * FROM tenants WHERE id = $1`, [req.user.tenantId]);
    if (tenantRes.rows.length === 0) {
      return res.status(404).json({ message: 'Tenant not found' });
    }
    await syncTenant(tenantRes.rows[0]);
    res.json({ message: 'Sync started for current tenant' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/all', async (req, res) => {
  try {
    await syncAllTenants();
    res.json({ message: 'Sync started for all tenants' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
