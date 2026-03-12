'use client';

import { useState } from 'react';
import Link from 'next/link';
import HowToVoteModal from './HowToVoteModal';
import styles from './LandingPage.module.css';

export default function LandingPage() {
  const [isHowToVoteOpen, setIsHowToVoteOpen] = useState(false);

  return (
    <>
      <div className={styles.landing}>
        <section className={styles.hero}>
          <img
            src="/logo.jpeg"
            alt="All Sikkim Govt. Employees Association"
            className={styles.heroLogo}
            fetchPriority="high"
          />
          <div className={styles.heroBadge}>asgea election 2026</div>
          <h1 className={styles.heroTitle}>Welcome to the ASGEA Voting Platform</h1>
          <p className={styles.heroSubtitle}>
            All Sikkim Govt. Employees Association (C & D Category) — official online voting platform.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Voting Date & Time</h2>
          <p className={styles.sectionText}>
            The ASGEA C & D Category election will be held on 16th March 2026 from 8:00 AM to 2:00 PM.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>How You Can Vote</h2>
          <p className={styles.sectionText}>
            Enter your registered mobile number and the OTP received in the message to access the ballot and cast your vote.
          </p>
          <div className={styles.buttonRow}>
            <button
              type="button"
              className={styles.howToVoteBtn}
              onClick={() => setIsHowToVoteOpen(true)}
              aria-label="Open how to vote instructions"
            >
              See How to Vote (English / नेपाली)
            </button>
          </div>
        </section>
      </div>

      <HowToVoteModal
        isOpen={isHowToVoteOpen}
        onClose={() => setIsHowToVoteOpen(false)}
      />
    </>
  );
}
