'use client';

import { Post } from '@/lib/mockData';
import CandidateCard from './CandidateCard';
import styles from './PostSection.module.css';

interface Props {
    post: Post;
    selectedCandidateId: string | null;
    onSelectCandidate: (candidateId: string) => void;
}

export default function PostSection({ post, selectedCandidateId, onSelectCandidate }: Props) {
    return (
        <div className={styles.section}>
            <h2 className={styles.title}>Post: {post.title}</h2>
            <div className={styles.grid}>
                {post.candidates.map((candidate) => (
                    <CandidateCard
                        key={candidate.id}
                        candidate={candidate}
                        isSelected={selectedCandidateId === candidate.id}
                        onSelect={() => onSelectCandidate(candidate.id)}
                    />
                ))}
            </div>
        </div>
    );
}
