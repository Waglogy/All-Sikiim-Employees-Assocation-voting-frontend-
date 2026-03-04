'use client';

import { useState, useEffect } from 'react';
import LoginForm from './LoginForm';
import HowToVoteModal from './HowToVoteModal';
import styles from './LoginPageContent.module.css';

const VOTING_STARTS_ENV = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_VOTING_STARTS_AT : '';

function parseVotingStartsAt(value: string): Date | null {
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

function isVotingStarted(): { started: boolean; formatted: string } {
  if (!VOTING_STARTS_ENV || !VOTING_STARTS_ENV.trim()) {
    return { started: true, formatted: '' };
  }
  const startsAt = parseVotingStartsAt(VOTING_STARTS_ENV);
  if (!startsAt) return { started: true, formatted: '' };
  const started = Date.now() >= startsAt.getTime();
  const formatted = startsAt.toLocaleString(undefined, {
    dateStyle: 'long',
    timeStyle: 'short',
  });
  return { started, formatted };
}

export default function LoginPageContent() {
    const [isHowToVoteOpen, setIsHowToVoteOpen] = useState(false);
    const [votingState, setVotingState] = useState<{ started: boolean; formatted: string }>({ started: false, formatted: '' });

    useEffect(() => {
        setVotingState(isVotingStarted());
        const interval = setInterval(() => setVotingState(isVotingStarted()), 60_000);
        return () => clearInterval(interval);
    }, []);

    return (
        <>
            <div className={styles.wrapper}>
                {!votingState.started ? (
                    <div className={styles.votingSoon}>
                        <h2 className={styles.votingSoonTitle}>Voting will start on</h2>
                        <p className={styles.votingSoonDate}>{votingState.formatted || '—'}</p>
                        <p className={styles.votingSoonSub}>Please come back then to cast your vote.</p>
                    </div>
                ) : (
                    <LoginForm />
                )}
                <div className={styles.howToVoteSection}>
                    <button
                        type="button"
                        className={styles.howToVoteBtn}
                        onClick={() => setIsHowToVoteOpen(true)}
                        aria-label="Open how to vote instructions"
                    >
                        How to Vote
                    </button>
                </div>
            </div>
            <HowToVoteModal
                isOpen={isHowToVoteOpen}
                onClose={() => setIsHowToVoteOpen(false)}
            />
        </>
    );
}
