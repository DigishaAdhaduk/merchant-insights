import React, { useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

function Login({ onSuccess }) {
  const { login } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({
    email: '',
    password: '',
    tenantName: '',
    shopDomain: '',
    shopifyAccessToken: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await api.post('/auth/login', {
          email: form.email,
          password: form.password
        });
        login(res.data.token);
        onSuccess();
      } else {
        const res = await api.post('/auth/register', {
          email: form.email,
          password: form.password,
          tenantName: form.tenantName,
          shopDomain: form.shopDomain,
          shopifyAccessToken: form.shopifyAccessToken
        });
        login(res.data.token);
        onSuccess();
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{mode === 'login' ? 'Login' : 'Register & Connect Store'}</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />
          {mode === 'register' && (
            <>
              <input
                type="text"
                name="tenantName"
                placeholder="Store Name"
                value={form.tenantName}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="shopDomain"
                placeholder="Shopify Domain (my-store.myshopify.com)"
                value={form.shopDomain}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="shopifyAccessToken"
                placeholder="Shopify Access Token"
                value={form.shopifyAccessToken}
                onChange={handleChange}
                required
              />
            </>
          )}

          {error && <div className="error-msg">{error}</div>}

          <button type="submit" disabled={loading}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Register'}
          </button>
        </form>

        <div className="auth-toggle">
          {mode === 'login' ? (
            <p>
              New here?{' '}
              <button type="button" onClick={() => setMode('register')}>
                Register & connect store
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button type="button" onClick={() => setMode('login')}>
                Login
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;
