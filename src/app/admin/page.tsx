'use client';

import { useState, useEffect, useCallback } from 'react';
import { getResults, getVotesCount, GetResultsResponse, ApiError } from '@/lib/api';
import { getAdminToken } from '@/lib/auth';
import styles from './dashboard.module.css';

const UNLOCK_AT_ENV = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_RESULTS_UNLOCK_AT : '';

/** Parse ISO date-time as local time (e.g. 2026-02-01T09:30:00 = 9:30 AM local). */
function parseUnlockAt(value: string): Date | null {
  const s = value.trim();
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{1,2}):(\d{2})(?::(\d{2}))?(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?$/i.exec(s);
  if (!match) return null;
  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10) - 1;
  const day = parseInt(match[3], 10);
  const hour = parseInt(match[4], 10);
  const min = parseInt(match[5], 10);
  const sec = match[6] ? parseInt(match[6], 10) : 0;
  const d = new Date(year, month, day, hour, min, sec);
  return Number.isNaN(d.getTime()) ? null : d;
}

function isResultsUnlocked(): { unlocked: boolean; formatted: string } {
  if (!UNLOCK_AT_ENV || !UNLOCK_AT_ENV.trim()) {
    return { unlocked: false, formatted: '' };
  }
  const unlockAt = parseUnlockAt(UNLOCK_AT_ENV);
  if (!unlockAt) {
    return { unlocked: false, formatted: UNLOCK_AT_ENV };
  }
  const now = Date.now();
  const unlocked = now >= unlockAt.getTime();
  const formatted = unlockAt.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  return { unlocked, formatted };
}

export default function AdminDashboardPage() {
  const [password, setPassword] = useState('');
  const [data, setData] = useState<GetResultsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unlockState, setUnlockState] = useState<{ unlocked: boolean; formatted: string }>({ unlocked: false, formatted: '' });

  const [votesCount, setVotesCount] = useState<number | null>(null);
  const [votesCountLoading, setVotesCountLoading] = useState(false);
  const [votesCountError, setVotesCountError] = useState<string | null>(null);

  const fetchVotesCount = useCallback(async () => {
    const token = getAdminToken();
    if (!token) {
      setVotesCount(null);
      return;
    }
    setVotesCountLoading(true);
    setVotesCountError(null);
    try {
      const res = await getVotesCount(token);
      setVotesCount(res.total_votes);
    } catch (err) {
      const apiErr = err as ApiError;
      setVotesCountError(apiErr.message || 'Failed to load vote count.');
      setVotesCount(null);
    } finally {
      setVotesCountLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVotesCount();
  }, [fetchVotesCount]);

  useEffect(() => {
    setUnlockState((prev) => {
      const { unlocked, formatted } = isResultsUnlocked();
      return { unlocked, formatted };
    });
    const interval = setInterval(() => {
      setUnlockState((prev) => {
        const { unlocked, formatted } = isResultsUnlocked();
        return { unlocked, formatted };
      });
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  const handleLoadResults = async (e: React.FormEvent) => {
    e.preventDefault();
    const pwd = password.trim();
    if (!pwd) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getResults(pwd);
      setData(res);
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr.message || 'Failed to load results. Check the password.');
    } finally {
      setLoading(false);
    }
  };

  const results = data?.results ?? [];

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>Dashboard</h1>
      <p className={styles.subtitle}>Voting results by post</p>

      <section className={styles.votesCountSection} aria-label="Total votes cast">
        {!getAdminToken() ? (
          <p className={styles.votesCountHint}>Log in as admin to see total votes cast.</p>
        ) : votesCountLoading ? (
          <p className={styles.votesCountHint}>Loading vote count…</p>
        ) : votesCountError ? (
          <div className={styles.votesCountError}>
            <span>{votesCountError}</span>
            <button type="button" onClick={fetchVotesCount} className={styles.votesCountRetry}>
              Retry
            </button>
          </div>
        ) : votesCount !== null ? (
          <>
            <p className={styles.votesCountLabel}>Total votes cast</p>
            <p className={styles.votesCountNumber}>{votesCount.toLocaleString()}</p>
            <button type="button" onClick={fetchVotesCount} className={styles.votesCountRefresh} disabled={votesCountLoading}>
              Refresh
            </button>
          </>
        ) : null}
      </section>

      {!unlockState.unlocked ? (
        <div className={styles.locked}>
          <span className={styles.lockedIcon} aria-hidden>🔒</span>
          <p className={styles.lockedTitle}>Results are locked</p>
          <p className={styles.lockedText}>
            {unlockState.formatted
              ? `Results will be available from ${unlockState.formatted}.`
              : 'Results unlock time is not configured. Set NEXT_PUBLIC_RESULTS_UNLOCK_AT in .env.local (e.g. 2025-03-01T18:00:00).'}
          </p>
        </div>
      ) : (
        <form onSubmit={handleLoadResults} className={styles.passwordForm}>
          <label htmlFor="results-password" className={styles.passwordLabel}>
            Results password
          </label>
          <div className={styles.passwordRow}>
            <input
              id="results-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter results password"
              className={styles.passwordInput}
              disabled={loading}
              autoComplete="current-password"
            />
            <button type="submit" className={styles.passwordBtn} disabled={loading || !password.trim()}>
              {loading ? 'Loading...' : 'View results'}
            </button>
          </div>
        </form>
      )}

      {unlockState.unlocked && error && (
        <div className={styles.error} role="alert">
          {error}
        </div>
      )}

      {unlockState.unlocked && data && results.length === 0 && !error && (
        <div className={styles.empty}>No results to display yet.</div>
      )}

      {unlockState.unlocked && data && results.length > 0 ? (
        <div className={styles.grid}>
          {results.map((post) => (
            <section key={post.post_id} className={styles.card}>
              <h2 className={styles.cardTitle}>{post.title}</h2>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Candidate</th>
                      <th className={styles.num}>Votes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {post.candidates
                      .slice()
                      .sort((a, b) => b.votes - a.votes)
                      .map((c) => (
                        <tr key={c.candidate_id}>
                          <td>{c.name}</td>
                          <td className={styles.num}>{c.votes}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              <div className={styles.total}>
                Total votes: {post.candidates.reduce((s, c) => s + c.votes, 0)}
              </div>
            </section>
          ))}
        </div>
      ) : null}
    </div>
  );
}
