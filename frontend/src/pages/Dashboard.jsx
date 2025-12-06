import React, { useEffect, useState } from 'react';
import api from '../api/client';
import Layout from '../components/Layout';
import KpiCard from '../components/KpiCard';
import OrdersChart from '../components/OrdersChart';
import TopCustomersTable from '../components/TopCustomersTable';

function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [ordersByDate, setOrdersByDate] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  async function fetchData() {
    setLoading(true);
    try {
      const [summaryRes, ordersRes, customersRes] = await Promise.all([
        api.get('/analytics/summary'),
        api.get('/analytics/orders-by-date'),
        api.get('/analytics/top-customers?limit=5')
      ]);
      setSummary(summaryRes.data);
      setOrdersByDate(ordersRes.data);
      setTopCustomers(customersRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function triggerSync() {
    setSyncing(true);
    try {
      await api.post('/ingest/tenant');
      await fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setSyncing(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Layout>
      <div className="dashboard-header">
        <div>
          <h1>Store Insights</h1>
          <p className="subtext">High-level view of your customers, orders and revenue</p>
        </div>
        <button className="sync-btn" onClick={triggerSync} disabled={syncing}>
          {syncing ? 'Syncing…' : 'Sync now'}
        </button>
      </div>

      {loading && <div>Loading analytics...</div>}

      {!loading && summary && (
        <>
          <div className="kpi-grid">
            <KpiCard label="Total Customers" value={summary.totalCustomers} />
            <KpiCard label="Total Orders" value={summary.totalOrders} />
            <KpiCard label="Total Revenue" value={summary.totalRevenue.toFixed(2)} prefix="$" />
          </div>

          <div className="grid-2">
            <OrdersChart data={ordersByDate} />
            <TopCustomersTable customers={topCustomers} />
          </div>
        </>
      )}
    </Layout>
  );
}

export default Dashboard;
