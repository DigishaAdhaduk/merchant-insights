const axios = require('axios');

async function fetchShopifyCustomers(shopDomain, accessToken) {
  const url = `https://${shopDomain}/admin/api/2024-01/customers.json?limit=50`;
  const res = await axios.get(url, {
    headers: {
      'X-Shopify-Access-Token': accessToken,
      'Content-Type': 'application/json'
    }
  });
  return res.data.customers || [];
}

async function fetchShopifyOrders(shopDomain, accessToken) {
  const url = `https://${shopDomain}/admin/api/2024-01/orders.json?limit=50&status=any`;
  const res = await axios.get(url, {
    headers: {
      'X-Shopify-Access-Token': accessToken,
      'Content-Type': 'application/json'
    }
  });
  return res.data.orders || [];
}

async function fetchShopifyProducts(shopDomain, accessToken) {
  const url = `https://${shopDomain}/admin/api/2024-01/products.json?limit=50`;
  const res = await axios.get(url, {
    headers: {
      'X-Shopify-Access-Token': accessToken,
      'Content-Type': 'application/json'
    }
  });
  return res.data.products || [];
}

module.exports = {
  fetchShopifyCustomers,
  fetchShopifyOrders,
  fetchShopifyProducts
};
