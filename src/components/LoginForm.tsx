'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './LoginForm.module.css';

export default function LoginForm() {
    const [username, setUsername] = useState('');
    const [uniqueCode, setUniqueCode] = useState('');
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (username.trim() && uniqueCode.trim()) {
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
                Please enter your official Username and the Unique Code provided by the department.
            </div>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="username" className="form-label">Username / Employee ID</label>
                    <input
                        id="username"
                        type="text"
                        className="form-input"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Ex: EMP12345"
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="code" className="form-label">Unique Code</label>
                    <input
                        id="code"
                        type="password"
                        className="form-input"
                        value={uniqueCode}
                        onChange={(e) => setUniqueCode(e.target.value)}
                        placeholder="Enter unique code"
                        required
                    />
                </div>
                <button type="submit" className={`primary-btn ${styles.submitBtn}`}>
                    Proceed to Vote
                </button>
            </form>
        </div>
    );
}
