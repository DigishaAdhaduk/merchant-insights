import React from 'react';
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

function OrdersChart({ data }) {
  return (
    <div className="chart-container">
      <h3>Orders & Revenue by Date</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="orderCount"
            stroke="#8884d8"
            name="Orders"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="revenue"
            stroke="#82ca9d"
            name="Revenue"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default OrdersChart;
