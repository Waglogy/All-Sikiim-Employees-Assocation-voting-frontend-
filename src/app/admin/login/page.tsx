'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminLogin, ApiError } from '@/lib/api';
import { setAdminToken } from '@/lib/auth';
import styles from './login.module.css';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError('Please enter email and password.');
      return;
    }
    setLoading(true);
    try {
      const res = await adminLogin(trimmedEmail, password);
      setAdminToken(res.token);
      router.replace('/admin');
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.icon}>⚙</span>
        <h1 className={styles.title}>Admin Login</h1>
        <p className={styles.subtitle}>Sign in to manage posts and view results</p>
      </div>
      <form onSubmit={handleSubmit} className={styles.form}>
        {error && (
          <div className={styles.error} role="alert">
            {error}
          </div>
        )}
        <div className={styles.field}>
          <label htmlFor="admin-email" className={styles.label}>Email</label>
          <input
            id="admin-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
            placeholder="admin@example.com"
            disabled={loading}
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="admin-password" className={styles.label}>Password</label>
          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
            placeholder="••••••••"
            disabled={loading}
          />
        </div>
        <button type="submit" className={styles.submit} disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
      <p className={styles.footer}>
        <a href="/">← Back to site</a>
      </p>
    </div>
  );
}
