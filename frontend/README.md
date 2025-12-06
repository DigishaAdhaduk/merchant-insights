🛍️ Merchant Insights  
Multi-Tenant Shopify Data Ingestion & Analytics Dashboard
A full-stack platform built for the **Xeno FDE Internship Assignment – 2025**, enabling Shopify merchants to onboard, sync, and visualize store performance in real-time.

</div>

---

# 🚀 Overview

**Merchant Insights** simulates how Xeno enables enterprise retailers to integrate and analyze customer data.  
It ingests Shopify store data for multiple tenants and visualizes insights on a clean React dashboard.

This solution includes:

- Multi-tenant onboarding  
- Shopify REST API ingestion (Customers, Orders, Products)  
- Cron-based scheduled sync  
- JWT Authentication  
- KPI cards, charts, tables  
- Deployed backend + frontend  

---

# 🌟 Features

### 🔐 Multi-Tenant Authentication
- Email + password login  
- JWT session handling  
- Store-level isolation via `tenant_id`  

---

### 🔄 Shopify Data Ingestion
- Pulls:
  - Customers  
  - Products  
  - Orders + Order Items  
  - (Optional) Custom events  
- Manual sync + hourly scheduled sync  
- Shopify REST Admin API integration  
- Architecture supports webhooks for real-time sync  

---

### 📊 Insights Dashboard
Includes:

- Total Customers  
- Total Orders  
- Total Revenue  
- Orders & Revenue by Date (Line Chart)  
- Top 5 Customers by Spend  
- Responsive UI built with React + Vite  

---

# 🏗️ Architecture Diagram

```mermaid
flowchart LR

subgraph Shopify["Shopify Store(s)"]
  C[Customers]
  O[Orders]
  P[Products]
end

subgraph Backend["Node.js + Express Backend"]
  AUTH["Auth Service (JWT)"]
  TENANT["Tenant Manager"]
  INGEST["Shopify Ingestion Service"]
  ANALYTICS["Analytics Module"]
  CRON["Scheduled Sync (node-cron)"]
  WEBHOOK["Webhook Handler (extendable)"]
end

subgraph DB["PostgreSQL Database"]
  T1(tenants)
  T2(users)
  T3(customers)
  T4(products)
  T5(orders)
  T6(order_items)
  T7(custom_events)
end

subgraph Frontend["React + Vite Frontend"]
  LOGIN["Login / Register"]
  DASH["Analytics Dashboard"]
end

Shopify -->|REST API Calls| INGEST
CRON --> INGEST
WEBHOOK --> T7
INGEST --> DB
Frontend -->|JWT + REST| Backend
ANALYTICS --> DB
````

---

# 🗄️ Database Schema

### **tenants**

```
id PK  
name  
shop_domain  
shopify_access_token  
created_at  
```

### **users**

```
id PK  
email  
password_hash  
tenant_id FK  
created_at  
```

### **customers**

```
id PK  
tenant_id FK  
shopify_customer_id  
first_name  
last_name  
email  
total_spent  
created_at  
```

### **products**

```
id PK  
tenant_id FK  
shopify_product_id  
title  
price  
```

### **orders**

```
id PK  
tenant_id FK  
shopify_order_id  
customer_id FK  
subtotal_price  
total_price  
currency  
order_created_at  
```

### **order_items**

```
id PK  
tenant_id FK  
order_id FK  
product_id FK  
quantity  
price  
```

### **custom_events**

```
id PK  
tenant_id FK  
event_type  
metadata JSONB  
occurred_at  
```

---

# 🔌 API Endpoints

## 🔐 Authentication

### **POST /auth/register**

Registers tenant + user
Returns JWT token

**Body**

```json
{
  "email": "merchant@example.com",
  "password": "password123",
  "tenantName": "Test Store",
  "shopDomain": "my-store.myshopify.com",
  "shopifyAccessToken": "shpat_..."
}
```

---

### **POST /auth/login**

```json
{
  "email": "merchant@example.com",
  "password": "password123"
}
```

Returns:

```json
{ "token": "<jwt>" }
```

---

## 🔄 Ingestion APIs

### **POST /ingest/tenant**

Trigger data sync for logged-in tenant

### **POST /ingest/all**

Cron job uses this internally to sync all tenants

---

## 📊 Analytics APIs

### **GET /analytics/summary**

Returns:

```json
{
  "totalCustomers": 123,
  "totalOrders": 456,
  "totalRevenue": 7890.50
}
```

### **GET /analytics/orders-by-date**

Returns aggregated orders + revenue per day

### **GET /analytics/top-customers?limit=5**

Returns top spenders

---

# ⚙️ Local Setup

## 🟦 Backend Setup

```bash
cd backend
npm install
```

### Create DB

```bash
psql -U postgres -c "CREATE DATABASE merchant_insights_db;"
```

### Apply schema

```bash
psql -U postgres -d merchant_insights_db -f db/schema.sql
```

### Add `.env`

```env
PORT=5000
DATABASE_URL=postgres://postgres:<yourpassword>@localhost:5432/merchant_insights_db
JWT_SECRET=supersecret
SHOPIFY_WEBHOOK_SECRET=dummy
```

### Run backend

```bash
npm run dev
```

Backend URL:
👉 [http://localhost:5000](http://localhost:5000)

---

## 🟩 Frontend Setup

```bash
cd frontend
npm install
npm install axios jwt-decode recharts
```

### Add `.env`

```env
VITE_API_BASE_URL=http://localhost:5000
```

### Start frontend

```bash
npm run dev
```

Open:
👉 [http://localhost:5173](http://localhost:5173)

---

# 🌐 Deployment

### Backend → Render

* Root directory: `/backend`
* Build: `npm install`
* Start: `npm start`
* Add environment variables
* Connect to PostgreSQL
* Apply schema manually

---

### Frontend → Vercel

* Root directory: `/frontend`
* Build command: `npm run build`
* Output folder: `dist`
* Env:

  ```
  VITE_API_BASE_URL=<backend-url>
  ```

---

# 📌 Assumptions

* Shopify access token is provided by merchant
* Hourly cron sync is sufficient for demo
* Simplified pagination from Shopify
* Basic authentication is enough
* Webhooks optional unless needed

---

# ⚠️ Limitations

* Cron jobs run inside Node process (not distributed)
* Minimal rate-limit handling
* Simplified error logging
* No worker queue for large ingestion
* No advanced metrics (CLTV, RFM, segmentation)
* Webhook support minimal

---


