'use client';

import { useState } from 'react';
import LoginForm from './LoginForm';
import HowToVoteModal from './HowToVoteModal';
import styles from './LoginPageContent.module.css';

export default function LoginPageContent() {
    const [isHowToVoteOpen, setIsHowToVoteOpen] = useState(false);

    return (
        <>
            <div className={styles.wrapper}>
                <LoginForm />
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
