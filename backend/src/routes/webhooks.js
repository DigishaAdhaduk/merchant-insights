const express = require('express');
const crypto = require('crypto');
const db = require('../db');

const router = express.Router();

function verifyShopifyWebhook(req, hmacHeader) {
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
  const digest = crypto
    .createHmac('sha256', secret)
    .update(req.rawBody, 'utf8')
    .digest('base64');
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(hmacHeader));
}

router.post('/orders/create', async (req, res) => {
  try {
    const hmac = req.get('X-Shopify-Hmac-Sha256');
    if (!hmac || !verifyShopifyWebhook(req, hmac)) {
      return res.status(401).send('Unauthorized');
    }

    const shopDomain = req.get('X-Shopify-Shop-Domain');
    const tenantRes = await db.query(
      `SELECT id FROM tenants WHERE shop_domain = $1`,
      [shopDomain]
    );

    if (tenantRes.rows.length === 0) {
      return res.status(200).send('No tenant mapped');
    }

    const tenantId = tenantRes.rows[0].id;
    const order = req.body;

    await db.query(
      `
      INSERT INTO custom_events (tenant_id, shopify_customer_id, event_type, metadata, occurred_at)
      VALUES ($1, $2, $3, $4, $5)
      `,
      [
        tenantId,
        order.customer && order.customer.id ? order.customer.id : null,
        'ORDER_CREATED_WEBHOOK',
        order,
        order.created_at
      ]
    );

    res.status(200).send('OK');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
