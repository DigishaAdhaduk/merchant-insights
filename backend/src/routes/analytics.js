const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.get('/summary', async (req, res) => {
  try {
    const tenantId = req.user.tenantId;

    const customersRes = await db.query(
      `SELECT COUNT(*) AS count FROM customers WHERE tenant_id = $1`,
      [tenantId]
    );
    const ordersRes = await db.query(
      `SELECT COUNT(*) AS count, COALESCE(SUM(total_price), 0) AS revenue FROM orders WHERE tenant_id = $1`,
      [tenantId]
    );
    const result = {
      totalCustomers: Number(customersRes.rows[0].count || 0),
      totalOrders: Number(ordersRes.rows[0].count || 0),
      totalRevenue: Number(ordersRes.rows[0].revenue || 0)
    };
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/orders-by-date', async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { from, to } = req.query;

    const params = [tenantId];
    let where = `tenant_id = $1`;

    if (from) {
      params.push(from);
      where += ` AND order_created_at >= $${params.length}`;
    }
    if (to) {
      params.push(to);
      where += ` AND order_created_at <= $${params.length}`;
    }

    const q = `
      SELECT
        DATE(order_created_at) AS date,
        COUNT(*) AS order_count,
        COALESCE(SUM(total_price), 0) AS revenue
      FROM orders
      WHERE ${where}
      GROUP BY DATE(order_created_at)
      ORDER BY DATE(order_created_at)
    `;

    const result = await db.query(q, params);

    res.json(result.rows.map(r => ({
      date: r.date,
      orderCount: Number(r.order_count),
      revenue: Number(r.revenue)
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/top-customers', async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const limit = Number(req.query.limit || 5);

    const q = `
      SELECT
        c.id,
        c.email,
        c.first_name,
        c.last_name,
        COALESCE(SUM(o.total_price), 0) AS total_spent,
        COUNT(o.id) AS orders_count
      FROM customers c
      LEFT JOIN orders o ON o.customer_id = c.id
      WHERE c.tenant_id = $1
      GROUP BY c.id
      ORDER BY total_spent DESC
      LIMIT $2
    `;

    const result = await db.query(q, [tenantId, limit]);

    res.json(result.rows.map(r => ({
      id: r.id,
      email: r.email,
      name: `${r.first_name || ''} ${r.last_name || ''}`.trim(),
      totalSpent: Number(r.total_spent),
      ordersCount: Number(r.orders_count)
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
