'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import LoginPageContent from './LoginPageContent';
import styles from './VotingScheduleGate.module.css';

const STARTS_AT_ENV = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_VOTING_STARTS_AT : '';
const ENDS_AT_ENV = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_VOTING_ENDS_AT : '';

function parseLocalDateTime(value: string): Date | null {
  const s = (value || '').trim();
  if (!s) return null;
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

function formatStartEnd(start: Date, end: Date): { startStr: string; endStr: string } {
  const startStr = start.toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'short' });
  const endStr = end.toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'short' });
  return { startStr, endStr };
}

type Phase = 'before' | 'during' | 'ended';

export default function VotingScheduleGate() {
  const [, setNow] = useState(() => new Date());
  const [phase, setPhase] = useState<Phase>('during');
  const hasReloadedForEnded = useRef(false);

  const startAt = useMemo(() => parseLocalDateTime(STARTS_AT_ENV ?? ''), []);
  const endAt = useMemo(() => parseLocalDateTime(ENDS_AT_ENV ?? ''), []);

  useEffect(() => {
    if (!startAt || !endAt) {
      return;
    }
    const update = () => {
      const t = new Date();
      setNow(t);
      if (t.getTime() < startAt.getTime()) setPhase('before');
      else if (t.getTime() < endAt.getTime()) setPhase('during');
      else {
        setPhase('ended');
        if (!hasReloadedForEnded.current && typeof window !== 'undefined') {
          hasReloadedForEnded.current = true;
          window.location.reload();
        }
      }
    };
    update();
    const interval = setInterval(update, 60_000);
    return () => clearInterval(interval);
  }, [startAt, endAt]);

  if (!startAt || !endAt) {
    return <LoginPageContent />;
  }

  if (phase === 'before' && startAt && endAt) {
    const { startStr } = formatStartEnd(startAt, endAt);
    return (
      <div className={styles.box}>
        <p className={styles.title}>Voting will start at 8:00 AM on 16th March 2026</p>
        <p className={styles.text}>Login will be available from {startStr}.</p>
      </div>
    );
  }

  if (phase === 'ended') {
    return (
      <div className={styles.box}>
        <p className={styles.title}>Voting time ended</p>
        <p className={styles.text}>Voting closed at 2:00 PM on 16th March 2026. Thank you.</p>
      </div>
    );
  }

  return <LoginPageContent />;
}
