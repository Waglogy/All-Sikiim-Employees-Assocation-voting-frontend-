'use client';

import { useState, useCallback } from 'react';
import { searchOtpLogsByFormNo, ApiError, OtpLogEntry } from '@/lib/api';
import { getAdminToken } from '@/lib/auth';
import styles from './otp-logs.module.css';

function formatFormNumbers(val: OtpLogEntry['voter_form_numbers']): string {
  if (Array.isArray(val)) return val.join(', ');
  return String(val ?? '');
}

function formatDate(s: string): string {
  try {
    const d = new Date(s);
    return Number.isNaN(d.getTime()) ? s : d.toLocaleString();
  } catch {
    return s;
  }
}

export default function AdminOtpLogsPage() {
  const [formNo, setFormNo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<OtpLogEntry[] | null>(null);

  const handleSearch = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const token = getAdminToken();
      const trimmed = formNo.trim();
      if (!token) {
        setError('Please log in as admin.');
        return;
      }
      if (!trimmed) {
        setError('Form number is required.');
        return;
      }
      setLoading(true);
      setError(null);
      setLogs(null);
      try {
        const res = await searchOtpLogsByFormNo(token, trimmed);
        setLogs(res.otp_logs ?? []);
      } catch (err) {
        const apiErr = err as ApiError;
        setError(apiErr.message || 'Failed to search OTP logs.');
        setLogs(null);
      } finally {
        setLoading(false);
      }
    },
    [formNo]
  );

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>OTP Logs</h1>
      <p className={styles.subtitle}>Search OTP logs by voter form number (admin only).</p>

      <form onSubmit={handleSearch} className={styles.form}>
        <label htmlFor="otp-logs-form-no" className={styles.label}>
          Form number
        </label>
        <div className={styles.row}>
          <input
            id="otp-logs-form-no"
            type="text"
            value={formNo}
            onChange={(e) => setFormNo(e.target.value)}
            placeholder="e.g. F001"
            className={styles.input}
            disabled={loading}
          />
          <button type="submit" className={styles.btn} disabled={loading || !formNo.trim()}>
            {loading ? 'Searching…' : 'Search'}
          </button>
        </div>
      </form>

      {error && (
        <div className={styles.error} role="alert">
          {error}
        </div>
      )}

      {logs !== null && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Results ({logs.length})</h2>
          {logs.length === 0 ? (
            <p className={styles.empty}>No OTP logs found for this form number.</p>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Phone</th>
                    <th>Form numbers</th>
                    <th>Used</th>
                    <th>Expires at</th>
                    <th>Created at</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((entry) => (
                    <tr key={entry.id}>
                      <td>{entry.id}</td>
                      <td>{entry.phone}</td>
                      <td>{formatFormNumbers(entry.voter_form_numbers)}</td>
                      <td>{entry.is_used ? 'Yes' : 'No'}</td>
                      <td>{formatDate(entry.expires_at)}</td>
                      <td>{formatDate(entry.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
