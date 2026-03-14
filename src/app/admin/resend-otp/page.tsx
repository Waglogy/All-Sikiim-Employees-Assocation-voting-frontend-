'use client';

import { useState, useCallback } from 'react';
import { resendOtp, ApiError } from '@/lib/api';
import styles from '../dashboard.module.css';

export default function AdminResendOtpPage() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const digits = phone.trim().replace(/\D/g, '');
      if (!digits) return;
      setLoading(true);
      setMessage(null);
      try {
        await resendOtp(digits);
        setMessage({ type: 'success', text: 'OTP resent successfully.' });
        setPhone('');
      } catch (err) {
        const apiErr = err as ApiError;
        setMessage({ type: 'error', text: apiErr.message || 'Failed to resend OTP.' });
      } finally {
        setLoading(false);
      }
    },
    [phone]
  );

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>OTP Resend</h1>
      <p className={styles.subtitle}>Resend OTP for a voter who didn’t receive it. Phone must exist in the voters table.</p>

      <section className={styles.resendOtpSection} aria-label="Resend OTP">
        <h2 className={styles.resendOtpTitle}>Resend OTP</h2>
        <p className={styles.resendOtpHint}>Enter the voter’s 10-digit mobile number. A new OTP will be sent via SMS.</p>
        <form onSubmit={handleSubmit} className={styles.resendOtpForm}>
          <input
            type="tel"
            inputMode="numeric"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="10-digit mobile number"
            className={styles.resendOtpInput}
            disabled={loading}
            maxLength={15}
          />
          <button type="submit" className={styles.resendOtpBtn} disabled={loading || !phone.trim()}>
            {loading ? 'Sending…' : 'Resend OTP'}
          </button>
        </form>
        {message && (
          <p className={message.type === 'success' ? styles.resendOtpSuccess : styles.resendOtpError} role="alert">
            {message.text}
          </p>
        )}
      </section>
    </div>
  );
}
