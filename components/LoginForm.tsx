
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Simulate API delay
        setTimeout(() => {
            // Simple validation logic (Mock)
            // Accept any username with code "sikkim2025" or "12345" for demo
            // In real backend, this would call an API
            if (username.trim().length > 0 && code.trim().length > 0) {
                // Successful login
                router.push('/voting');
            } else {
                setError('Invalid credentials. Please check your username and code.');
                setLoading(false);
            }
        }, 800);
    };

    return (
        <div className="w-full max-w-md mx-auto bg-white p-8 border-t-4 border-blue-900 shadow-lg rounded-sm animate-fade-in-up">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800">Voter Login</h2>
                <p className="text-gray-600 text-sm mt-2">Enter your credentials to access the ballot.</p>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
                    {error}
                </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
                <div>
                    <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-1">
                        Username / Employee ID
                    </label>
                    <input
                        id="username"
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-900 focus:border-blue-900 outline-none transition-all"
                        placeholder="Enter your Employee ID"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="code" className="block text-sm font-semibold text-gray-700 mb-1">
                        Unique Voting Code
                    </label>
                    <input
                        id="code"
                        type="password"
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-900 focus:border-blue-900 outline-none transition-all"
                        placeholder="••••••••"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 px-4 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded shadow transition-colors flex justify-center items-center ${loading ? 'opacity-70 cursor-not-allowed' : ''
                        }`}
                >
                    {loading ? (
                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        'Proceed to Vote'
                    )}
                </button>
            </form>

            <div className="mt-6 text-center text-xs text-gray-500">
                <p>If you have not received your unique code, please contact the Election Commission office.</p>
            </div>
        </div>
    );
}
