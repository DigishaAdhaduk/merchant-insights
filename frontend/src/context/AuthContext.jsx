import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('xeno_token'));
  const [user, setUser] = useState(null);

  useEffect(() => {
    console.log('AuthContext useEffect, token =', token);
    if (token) {
      // Do NOT decode token now; treat any token as "logged in"
      setUser({ email: 'demo@user', tenantId: 1 });
    } else {
      setUser(null);
    }
  }, [token]);

  const login = newToken => {
    console.log('login() called with token:', newToken);
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

  console.log('AuthContext value:', value);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

