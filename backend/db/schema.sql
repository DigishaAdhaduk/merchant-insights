CREATE TABLE IF NOT EXISTS tenants (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  shop_domain VARCHAR(255) NOT NULL UNIQUE,
  shopify_access_token TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
  shopify_customer_id BIGINT,
  email VARCHAR(255),
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  total_spent NUMERIC(12, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_tenant ON customers(tenant_id);

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
  shopify_product_id BIGINT,
  title VARCHAR(255),
  price NUMERIC(12, 2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_tenant ON products(tenant_id);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
  shopify_order_id BIGINT,
  customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
  subtotal_price NUMERIC(12, 2),
  total_price NUMERIC(12, 2),
  currency VARCHAR(10),
  status VARCHAR(50),
  order_created_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_tenant ON orders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_orders_tenant_date ON orders(tenant_id, order_created_at);

CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
  quantity INTEGER,
  price NUMERIC(12, 2)
);

CREATE INDEX IF NOT EXISTS idx_order_items_tenant ON order_items(tenant_id);

CREATE TABLE IF NOT EXISTS custom_events (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
  shopify_customer_id BIGINT,
  event_type VARCHAR(100),
  metadata JSONB,
  occurred_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_custom_events_tenant ON custom_events(tenant_id);
CREATE INDEX IF NOT EXISTS idx_custom_events_type ON custom_events(event_type);
