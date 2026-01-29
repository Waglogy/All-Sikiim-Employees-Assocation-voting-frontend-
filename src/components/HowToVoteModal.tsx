'use client';

import { useState } from 'react';
import styles from './HowToVoteModal.module.css';

/**
 * Add your YouTube video ID here (the part after "v=" in the URL).
 * Example: for https://www.youtube.com/watch?v=abc123 use "abc123"
 * Leave empty to show a placeholder until you add the video.
 */
const HOW_TO_VOTE_VIDEO_ID = '';

type Lang = 'en' | 'ne';

const CONTENT = {
  en: {
    title: 'How to Vote',
    steps: [
      'Enter your registered 10-digit phone number and click "Send OTP".',
      'Enter the OTP received on your phone and click "Verify OTP & Login".',
      'On the ballot page, select one candidate for each post by tapping the candidate card.',
      'Review your choices and click "Submit Final Vote" to confirm.',
      'After submitting, you cannot vote again. Keep your confirmation message for your records.',
    ],
    close: 'Close',
    videoPlaceholder: 'Video will be added here',
    videoHint: 'To add your YouTube video, set HOW_TO_VOTE_VIDEO_ID in src/components/HowToVoteModal.tsx',
  },
  ne: {
    title: 'कसरी मत दिने',
    steps: [
      'तपाईंको दर्ता गरिएको १० अंकको फोन नम्बर प्रविष्ट गर्नुहोस् र "Send OTP" क्लिक गर्नुहोस्।',
      'तपाईंको फोनमा प्राप्त OTP प्रविष्ट गर्नुहोस् र "Verify OTP & Login" क्लिक गर्नुहोस्।',
      'मतपत्र पृष्ठमा, प्रत्येक पदको लागि एक उम्मेदवार छान्न उम्मेदवार कार्डमा ट्याप गर्नुहोस्।',
      'तपाईंको छान्नीहरू समीक्षा गर्नुहोस् र पुष्टि गर्न "Submit Final Vote" क्लिक गर्नुहोस्।',
      'पेश गरेपछि तपाईं पुनः मत दिन सक्नुहुन्न। तपाईंको रेकर्डको लागि पुष्टिकरण सन्देश राख्नुहोस्।',
    ],
    close: 'बन्द गर्नुहोस्',
    videoPlaceholder: 'भिडियो यहाँ थपिनेछ',
    videoHint: 'YouTube भिडियो थप्न HOW_TO_VOTE_VIDEO_ID सेट गर्नुहोस् (HowToVoteModal.tsx)',
  },
} as const;

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function HowToVoteModal({ isOpen, onClose }: Props) {
  const [lang, setLang] = useState<Lang>('en');
  const t = CONTENT[lang];

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="how-to-vote-title">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.titleRow}>
          <h2 id="how-to-vote-title" className={styles.title}>{t.title}</h2>
          <div className={styles.langToggle} role="group" aria-label="Instruction language">
            <button
              type="button"
              className={lang === 'en' ? styles.langBtnActive : styles.langBtn}
              onClick={() => setLang('en')}
              aria-pressed={lang === 'en'}
            >
              English
            </button>
            <button
              type="button"
              className={lang === 'ne' ? styles.langBtnActive : styles.langBtn}
              onClick={() => setLang('ne')}
              aria-pressed={lang === 'ne'}
            >
              नेपाली
            </button>
          </div>
        </div>

        <ol className={styles.steps}>
          {t.steps.map((step, i) => (
            <li key={i} className={styles.step}>{step}</li>
          ))}
        </ol>

        <div className={styles.videoWrapper}>
          {HOW_TO_VOTE_VIDEO_ID ? (
            <iframe
              className={styles.video}
              src={`https://www.youtube.com/embed/${HOW_TO_VOTE_VIDEO_ID}`}
              title={lang === 'en' ? 'How to vote video' : 'कसरी मत दिने भिडियो'}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className={styles.videoPlaceholder}>
              <p>{t.videoPlaceholder}</p>
              <p className={styles.placeholderHint}>{t.videoHint}</p>
            </div>
          )}
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
}

