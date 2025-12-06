import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from'jwt-decode';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('xeno_token'));
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser({ id: decoded.userId, tenantId: decoded.tenantId });
      } catch (err) {
        console.error('Invalid token', err);
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, [token]);

  const login = newToken => {
    localStorage.setItem('xeno_token', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('xeno_token');
    setToken(null);
    setUser(null);
  };

  const value = {
    token,
    user,
    isAuthenticated: !!user,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
