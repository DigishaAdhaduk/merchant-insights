import React from 'react';
import { useAuth } from '../context/AuthContext';

function Layout({ children }) {
  const { logout } = useAuth();

  return (
    <div className="app-container">
      <header className="header">
        <div className="logo">Xeno Insights</div>
        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </header>
      <main className="main">{children}</main>
    </div>
  );
}

export default Layout;
