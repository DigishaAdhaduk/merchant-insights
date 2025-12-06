import React from 'react';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

function App() {
  const { isAuthenticated } = useAuth();

  return <div>{isAuthenticated ? <Dashboard /> : <Login onSuccess={() => {}} />}</div>;
}

export default App;
