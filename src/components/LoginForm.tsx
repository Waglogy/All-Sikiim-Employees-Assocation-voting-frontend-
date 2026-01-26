'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './LoginForm.module.css';

export default function LoginForm() {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [uniqueCode, setUniqueCode] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (phoneNumber.trim() && uniqueCode.trim()) {
            // In a real app, validate with backend here
            router.push('/voting');
        } else {
            alert('Please enter both details');
        }
    };

    return (
        <div className={styles.card}>
            <h2 className={styles.title}>Voter Login</h2>
            <div className={styles.instructions}>
                Please enter your Phone Number and the Unique Code provided by the department (received in your phone number).
            </div>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="phoneNumber" className="form-label">Phone Number</label>
                    <input
                        id="phoneNumber"
                        type="text"
                        className="form-input"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="Ex: 9733814168"
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="code" className="form-label">
                        Unique Code <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>(recived in your phone no)</span>
                    </label>
                    <div className={styles.passwordContainer}>
                        <input
                            id="code"
                            type={showPassword ? 'text' : 'password'}
                            className="form-input"
                            value={uniqueCode}
                            onChange={(e) => setUniqueCode(e.target.value)}
                            placeholder="Enter unique code"
                            required
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
                <button type="submit" className={`primary-btn ${styles.submitBtn}`}>
                    Proceed to Vote
                </button>
            </form>
        </div>
    );
}
