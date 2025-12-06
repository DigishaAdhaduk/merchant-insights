const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { email, password, tenantName, shopDomain, shopifyAccessToken } = req.body;

    if (!email || !password || !tenantName || !shopDomain || !shopifyAccessToken) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const existing = await db.query(`SELECT id FROM users WHERE email = $1`, [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const tenantRes = await db.query(
      `
      INSERT INTO tenants (name, shop_domain, shopify_access_token)
      VALUES ($1, $2, $3)
      ON CONFLICT (shop_domain) DO UPDATE SET
        name = EXCLUDED.name,
        shopify_access_token = EXCLUDED.shopify_access_token,
        updated_at = NOW()
      RETURNING id
      `,
      [tenantName, shopDomain, shopifyAccessToken]
    );

    const tenantId = tenantRes.rows[0].id;

    const hash = await bcrypt.hash(password, 10);

    const userRes = await db.query(
      `
      INSERT INTO users (email, password_hash, tenant_id)
      VALUES ($1, $2, $3)
      RETURNING id
      `,
      [email, hash, tenantId]
    );

    const token = jwt.sign(
      { userId: userRes.rows[0].id, tenantId },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const userRes = await db.query(
      `SELECT id, password_hash, tenant_id FROM users WHERE email = $1`,
      [email]
    );

    if (userRes.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const user = userRes.rows[0];
    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, tenantId: user.tenant_id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
