import React from 'react';

function TopCustomersTable({ customers }) {
  return (
    <div className="table-container">
      <h3>Top Customers</h3>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Total Spent</th>
            <th>Orders</th>
          </tr>
        </thead>
        <tbody>
          {customers.length === 0 && (
            <tr>
              <td colSpan="4" style={{ textAlign: 'center' }}>
                No data
              </td>
            </tr>
          )}
          {customers.map(c => (
            <tr key={c.id}>
              <td>{c.name || '-'}</td>
              <td>{c.email || '-'}</td>
              <td>${c.totalSpent.toFixed(2)}</td>
              <td>{c.ordersCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TopCustomersTable;
