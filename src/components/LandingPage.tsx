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
            src="/logo.png"
            alt="All Sikkim Govt. Employees Association"
            className={styles.heroLogo}
            fetchPriority="high"
          />
          <div className={styles.heroBadge}>SGEA Election 2024</div>
          <h1 className={styles.heroTitle}>Voting Day Will Be Announced Soon</h1>
          <p className={styles.heroSubtitle}>
            All Sikkim Govt. Employees Association (C & D Category) — official online voting platform. Stay tuned for the voting date.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Voting Is Coming Soon</h2>
          <p className={styles.sectionText}>
            This is the official voting platform for the SGEA C & D Category elections. Eligible members will be able to cast their vote securely using their registered mobile number.
          </p>
          <ul className={styles.infoList}>
            <li>Vote from your phone or computer — no need to visit in person.</li>
            <li>One-time OTP sent to your registered 10-digit mobile number.</li>
            <li>One vote per member; once submitted, it cannot be changed.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>How You Can Vote</h2>
          <p className={styles.sectionText}>
            When voting opens, you will log in with your phone number, receive an OTP, select your preferred candidate for each post, and submit your vote. Full step-by-step instructions are available below.
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
            <Link
              href="/login"
              className={styles.loginBtn}
              aria-label="Go to login page"
            >
              Login
            </Link>
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
