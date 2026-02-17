'use client';

import { useState } from 'react';
import { getResults, ApiError, GetResultsResponse } from '@/lib/api';
import { generatePostPDF } from '@/lib/pdfGenerator';
import styles from './page.module.css';

export default function ResultPage() {
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [results, setResults] = useState<GetResultsResponse | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!password.trim()) {
            setError('Please enter the results password');
            return;
        }

        setIsLoading(true);
        try {
            const data = await getResults(password.trim());
            setResults(data);
            setError(null);
        } catch (err) {
            const apiError = err as ApiError;
            setError(apiError.message || 'Failed to fetch results. Please check your password and try again.');
            setResults(null);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownloadPDF = (postResult: GetResultsResponse['results'][0]) => {
        try {
            generatePostPDF(postResult);
        } catch (err) {
            setError('Failed to generate PDF. Please try again.');
        }
    };

    // Show password form if results not loaded
    if (!results) {
        return (
            <div className="container">
                <div className={styles.passwordCard}>
                    <h1 className={styles.title}>Election Results</h1>
                    <p className={styles.subtitle}>Enter the results password to view election results</p>

                    {error && (
                        <div className="alert-error" style={{ marginBottom: '1rem' }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="password" className="form-label">Results Password</label>
                            <div className={styles.passwordContainer}>
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    className="form-input"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        setError(null);
                                    }}
                                    placeholder="Enter results password"
                                    required
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    className={styles.eyeButton}
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    disabled={isLoading}
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
                            {isLoading ? 'Loading Results...' : 'View Results'}
                        </button>
                    </form>

                    {isLoading && (
                        <div className={styles.loadingOverlay}>
                            <div className={styles.spinner}></div>
                            <p>Fetching results...</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Show results
    return (
        <div className="container">
            <div className={styles.resultsContainer}>
                <h1 className={styles.resultsTitle}>Election Results</h1>

                {error && (
                    <div className="alert-error" style={{ marginBottom: '1rem' }}>
                        {error}
                    </div>
                )}

                {/* Summary Section */}
                <div className={styles.summaryCard}>
                    <h2 className={styles.summaryTitle}>Summary</h2>
                    <div className={styles.summaryGrid}>
                        <div className={styles.summaryItem}>
                            <span className={styles.summaryLabel}>Total Posts</span>
                            <span className={styles.summaryValue}>{results.summary.total_posts}</span>
                        </div>
                        <div className={styles.summaryItem}>
                            <span className={styles.summaryLabel}>Total Votes</span>
                            <span className={styles.summaryValue}>{results.summary.total_votes}</span>
                        </div>
                        <div className={styles.summaryItem}>
                            <span className={styles.summaryLabel}>Total Voters</span>
                            <span className={styles.summaryValue}>{results.summary.total_voters}</span>
                        </div>
                    </div>
                </div>

                {/* Results by Post */}
                {results.results.map((postResult) => (
                    <div key={postResult.post_id} className={styles.postCard}>
                        <div className={styles.postHeader}>
                            <h2 className={styles.postTitle}>{postResult.post_title}</h2>
                            <button
                                onClick={() => handleDownloadPDF(postResult)}
                                className={styles.downloadBtn}
                                aria-label={`Download ${postResult.post_title} results as PDF`}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                    <polyline points="7 10 12 15 17 10"></polyline>
                                    <line x1="12" y1="15" x2="12" y2="3"></line>
                                </svg>
                                Download PDF
                            </button>
                        </div>
                        <div className={styles.postStats}>
                            <span className={styles.totalVotes}>Total Votes: {postResult.total_votes}</span>
                        </div>
                        <div className={styles.candidatesList}>
                            {postResult.candidates.map((candidate) => (
                                <div key={candidate.id} className={styles.candidateRow}>
                                    <div className={styles.candidateInfo}>
                                        <span className={styles.candidateName}>{candidate.name}</span>
                                        <span className={styles.candidateVotes}>
                                            {candidate.votes} {candidate.votes === 1 ? 'vote' : 'votes'}
                                        </span>
                                    </div>
                                    <div className={styles.voteBar}>
                                        <div
                                            className={styles.voteBarFill}
                                            style={{
                                                width: `${candidate.percentage}%`,
                                                backgroundColor: candidate.percentage > 0 ? 'var(--primary-color)' : 'var(--border-color)'
                                            }}
                                        />
                                    </div>
                                    <div className={styles.percentage}>
                                        {candidate.percentage.toFixed(1)}%
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
