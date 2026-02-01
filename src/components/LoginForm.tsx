'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './LoginForm.module.css';
import { verifyOtp, ApiError } from '@/lib/api';
import { setToken, setPhone } from '@/lib/auth';

export default function LoginForm() {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [showOtp, setShowOtp] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

        const phone = phoneNumber.trim();
        const phoneRegex = /^\d{10}$/;
        if (!phone) {
            setError('Please enter your phone number');
            return;
        }
        if (!phoneRegex.test(phone)) {
            setError('Please enter a valid 10-digit phone number');
            return;
        }
        if (!otp.trim()) {
            setError('Please enter the OTP you received');
            return;
        }

        setIsLoading(true);
        try {
            const response = await verifyOtp(phone, otp.trim());
            setToken(response.token);
            setPhone(phone);
            setSuccessMessage('Login successful! Redirecting...');
            setTimeout(() => {
                router.push('/voting');
            }, 500);
        } catch (err) {
            const apiError = err as ApiError;
            setError(apiError.message || 'Login failed. Please try again.');
            if (apiError.code === 'INVALID_OTP') {
                setOtp('');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.card}>
            <h2 className={styles.title}>Voter Login</h2>
            <div className={styles.instructions}>
                Enter your phone number and the OTP you received to log in.
            </div>

            {error && (
                <div className="alert-error" style={{ marginBottom: '1rem' }}>
                    {error}
                </div>
            )}

            {successMessage && (
                <div className="alert-success">
                    {successMessage}
                </div>
            )}

            <form onSubmit={handleLogin}>
                <div className="form-group">
                    <label htmlFor="phoneNumber" className="form-label">Phone Number</label>
                    <input
                        id="phoneNumber"
                        type="text"
                        className="form-input"
                        value={phoneNumber}
                        onChange={(e) => {
                            setPhoneNumber(e.target.value);
                            setError(null);
                        }}
                        placeholder="Ex: 9876543210"
                        required
                        disabled={isLoading}
                        maxLength={10}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="otp" className="form-label">
                        OTP <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>(received on your phone)</span>
                    </label>
                    <div className={styles.passwordContainer}>
                        <input
                            id="otp"
                            type={showOtp ? 'text' : 'password'}
                            className="form-input"
                            value={otp}
                            onChange={(e) => {
                                setOtp(e.target.value);
                                setError(null);
                            }}
                            placeholder="Enter OTP"
                            required
                            disabled={isLoading}
                            maxLength={6}
                        />
                        <button
                            type="button"
                            className={styles.eyeButton}
                            onClick={() => setShowOtp(!showOtp)}
                            aria-label={showOtp ? 'Hide OTP' : 'Show OTP'}
                        >
                            {showOtp ? (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                    <line x1="1" y1="1" x2="23" y2="23"></line>
                                </svg>
                            ) : (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                    <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
                <button
                    type="submit"
                    className={`primary-btn ${styles.submitBtn}`}
                    disabled={isLoading}
                >
                    {isLoading ? 'Logging in...' : 'Login'}
                </button>
            </form>
        </div>
    );
}
