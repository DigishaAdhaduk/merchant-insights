const db = require('../db');
const {
  fetchShopifyCustomers,
  fetchShopifyOrders,
  fetchShopifyProducts
} = require('./shopifyService');

async function syncTenant(tenant) {
  console.log(`Syncing tenant ${tenant.id} (${tenant.name})...`);

  const customers = await fetchShopifyCustomers(tenant.shop_domain, tenant.shopify_access_token);

  for (const c of customers) {
    await db.query(
      `
      INSERT INTO customers (tenant_id, shopify_customer_id, email, first_name, last_name, total_spent)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (tenant_id, shopify_customer_id) DO UPDATE SET
        email = EXCLUDED.email,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        total_spent = EXCLUDED.total_spent,
        updated_at = NOW()
      `,
      [
        tenant.id,
        c.id,
        c.email,
        c.first_name,
        c.last_name,
        c.total_spent || 0
      ]
    );
  }

  const products = await fetchShopifyProducts(tenant.shop_domain, tenant.shopify_access_token);

  for (const p of products) {
    const price = p.variants && p.variants[0] ? p.variants[0].price : 0;
    await db.query(
      `
      INSERT INTO products (tenant_id, shopify_product_id, title, price)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (tenant_id, shopify_product_id) DO UPDATE SET
        title = EXCLUDED.title,
        price = EXCLUDED.price,
        updated_at = NOW()
      `,
      [tenant.id, p.id, p.title, price]
    );
  }

  const orders = await fetchShopifyOrders(tenant.shop_domain, tenant.shopify_access_token);

  for (const o of orders) {
    let customerId = null;

    if (o.customer && o.customer.id) {
      const result = await db.query(
        `SELECT id FROM customers WHERE tenant_id = $1 AND shopify_customer_id = $2`,
        [tenant.id, o.customer.id]
      );
      if (result.rows.length > 0) {
        customerId = result.rows[0].id;
      }
    }

    const orderRes = await db.query(
      `
      INSERT INTO orders (tenant_id, shopify_order_id, customer_id, subtotal_price, total_price, currency, status, order_created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (tenant_id, shopify_order_id) DO UPDATE SET
        customer_id = EXCLUDED.customer_id,
        subtotal_price = EXCLUDED.subtotal_price,
        total_price = EXCLUDED.total_price,
        currency = EXCLUDED.currency,
        status = EXCLUDED.status,
        order_created_at = EXCLUDED.order_created_at,
        updated_at = NOW()
      RETURNING id
      `,
      [
        tenant.id,
        o.id,
        customerId,
        o.subtotal_price || 0,
        o.total_price || 0,
        o.currency || 'USD',
        o.financial_status || 'unknown',
        o.created_at
      ]
    );

    const orderId = orderRes.rows[0].id;

    if (o.line_items && o.line_items.length > 0) {
      await db.query(
        `DELETE FROM order_items WHERE tenant_id = $1 AND order_id = $2`,
        [tenant.id, orderId]
      );

      for (const item of o.line_items) {
        let productId = null;
        if (item.product_id) {
          const productRes = await db.query(
            `SELECT id FROM products WHERE tenant_id = $1 AND shopify_product_id = $2`,
            [tenant.id, item.product_id]
          );
          if (productRes.rows.length > 0) {
            productId = productRes.rows[0].id;
          }
        }

        await db.query(
          `
          INSERT INTO order_items (tenant_id, order_id, product_id, quantity, price)
          VALUES ($1, $2, $3, $4, $5)
          `,
          [
            tenant.id,
            orderId,
            productId,
            item.quantity,
            item.price || 0
          ]
        );
      }
    }
  }

  console.log(`Sync complete for tenant ${tenant.id}`);
}

async function syncAllTenants() {
  const res = await db.query(`SELECT * FROM tenants`);
  for (const tenant of res.rows) {
    try {
      await syncTenant(tenant);
    } catch (err) {
      console.error(`Error syncing tenant ${tenant.id}`, err.message);
    }
  }
}

module.exports = {
  syncTenant,
  syncAllTenants
};
