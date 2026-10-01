import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getErrorMessage } from '../services/api.js';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(form);
      navigate('/');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="card auth-card">
        <div className="auth-brand">
          <div className="logo-mark">W</div>
          <span style={{ fontWeight: 700, fontSize: 18 }}>
            Wealthline
          </span>
        </div>

        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-sub">
          Log in to manage your money.
        </p>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>

            <input
              className="input"
              type="email"
              required
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) =>
                setForm({
                  ...form,
                  email: e.target.value
                })
              }
            />
          </div>

          <div className="form-group">
            <label>Password</label>

            <input
              className="input"
              type="password"
              required
              placeholder="••••••••"
              value={form.password}
              onChange={(e) =>
                setForm({
                  ...form,
                  password: e.target.value
                })
              }
            />
          </div>

          <button
            className="btn btn-primary btn-block"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        <div className="auth-switch">
          Don't have an account?{' '}
          <Link to="/register">
            Create one
          </Link>
        </div>

        <div
          className="text-muted"
          style={{
            fontSize: 12,
            textAlign: 'center',
            marginTop: 14
          }}
        >
          Demo: demo@expensetracker.app / demo1234
          {' '}
          (after running <code>npm run seed</code>)
        </div>
      </div>
    </div>
  );
}
