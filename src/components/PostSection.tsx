'use client';

import { Post } from '@/lib/mockData';
import CandidateCard from './CandidateCard';
import styles from './PostSection.module.css';

interface Props {
    post: Post;
    selectedCandidateId: string | null;
    onSelectCandidate: (candidateId: string) => void;
}

/** Sort candidates so NOTA (None Of The Above) is always last. */
function candidatesWithNotaLast<T extends { name: string }>(candidates: T[]): T[] {
    return [...candidates].sort((a, b) => {
        const aIsNota = a.name.trim().toUpperCase() === 'NOTA';
        const bIsNota = b.name.trim().toUpperCase() === 'NOTA';
        if (aIsNota && !bIsNota) return 1;
        if (!aIsNota && bIsNota) return -1;
        return 0;
    });
}

export default function PostSection({ post, selectedCandidateId, onSelectCandidate }: Props) {
    const orderedCandidates = candidatesWithNotaLast(post.candidates);
    return (
        <div className={styles.section}>
            <h2 className={styles.title}>Post: {post.title}</h2>
            <div className={styles.grid}>
                {orderedCandidates.map((candidate) => (
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
