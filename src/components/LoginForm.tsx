'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './LoginForm.module.css';
import { sendOtp, verifyOtp, ApiError } from '@/lib/api';
import { setToken, setPhone } from '@/lib/auth';

export default function LoginForm() {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const router = useRouter();

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

        if (!phoneNumber.trim()) {
            setError('Please enter your phone number');
            return;
        }

        // Basic phone number validation
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(phoneNumber.trim())) {
            setError('Please enter a valid 10-digit phone number');
            return;
        }

        setIsLoading(true);
        try {
            await sendOtp(phoneNumber.trim());
            setOtpSent(true);
            setSuccessMessage('OTP sent successfully to your phone number');
        } catch (err) {
            const apiError = err as ApiError;
            
            // If user has already voted, prevent further attempts
            if (apiError.code === 'ALREADY_VOTED') {
                setError(apiError.message || 'You have already voted. Cannot request OTP again.');
                setOtpSent(false);
                // Don't allow them to proceed
            } else {
                // For network errors or other errors, still proceed to OTP page
                // Show a warning message but allow them to continue
                setOtpSent(true);
                setSuccessMessage('Proceeding to OTP entry. If OTP was not received, you can still enter it manually.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

        if (!otp.trim()) {
            setError('Please enter the OTP');
            return;
        }

        setIsLoading(true);
        try {
            const response = await verifyOtp(phoneNumber.trim(), otp.trim());
            
            // Store token and phone number
            setToken(response.token);
            setPhone(phoneNumber.trim());
            
            setSuccessMessage('Login successful! Redirecting...');
            
            // Navigate to voting page after a short delay
            setTimeout(() => {
                router.push('/voting');
            }, 500);
        } catch (err) {
            const apiError = err as ApiError;
            setError(apiError.message || 'Failed to verify OTP. Please try again.');
            
            // If user has already voted, clear form and show error
            if (apiError.code === 'ALREADY_VOTED') {
                setOtpSent(false);
                setOtp('');
            }
            
            // If invalid OTP, allow retry
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
                {!otpSent 
                    ? 'Please enter your Phone Number to receive an OTP'
                    : 'Enter the OTP sent to your phone number'
                }
            </div>

            {error && (
                <div style={{
                    padding: '0.75rem',
                    marginBottom: '1rem',
                    backgroundColor: '#fee',
                    color: '#c33',
                    borderRadius: '4px',
                    border: '1px solid #fcc',
                    fontSize: '0.9rem'
                }}>
                    {error}
                </div>
            )}

            {successMessage && (
                <div style={{
                    padding: '0.75rem',
                    marginBottom: '1rem',
                    backgroundColor: '#efe',
                    color: '#3c3',
                    borderRadius: '4px',
                    border: '1px solid #cfc',
                    fontSize: '0.9rem'
                }}>
                    {successMessage}
                </div>
            )}

            {!otpSent ? (
                <form onSubmit={handleSendOtp}>
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
                    <button 
                        type="submit" 
                        className={`primary-btn ${styles.submitBtn}`}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Sending OTP...' : 'Send OTP'}
                    </button>
                </form>
            ) : (
                <form onSubmit={handleVerifyOtp}>
                    <div className="form-group">
                        <label htmlFor="phoneNumber" className="form-label">Phone Number</label>
                        <input
                            id="phoneNumber"
                            type="text"
                            className="form-input"
                            value={phoneNumber}
                            disabled
                            style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="otp" className="form-label">
                            OTP <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>(received in your phone)</span>
                        </label>
                        <div className={styles.passwordContainer}>
                            <input
                                id="otp"
                                type={showPassword ? 'text' : 'password'}
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
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? (
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
                        {isLoading ? 'Verifying...' : 'Verify OTP & Login'}
                    </button>
                </form>
            )}
        </div>
    );
}
