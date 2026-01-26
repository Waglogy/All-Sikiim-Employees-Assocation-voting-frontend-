import { Candidate } from '@/lib/mockData';
import styles from './CandidateCard.module.css';

interface Props {
    candidate: Candidate;
    isSelected: boolean;
    onSelect: () => void;
}

export default function CandidateCard({ candidate, isSelected, onSelect }: Props) {
    // Use photoUrl if available, otherwise generate placeholder
    const imageUrl = candidate.photoUrl && candidate.photoUrl.trim() 
        ? candidate.photoUrl 
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(candidate.name)}&background=0D8ABC&color=fff&size=128`;

    return (
        <div
            className={`${styles.card} ${isSelected ? styles.selected : ''}`}
            onClick={onSelect}
        >
            <img
                src={imageUrl}
                alt={candidate.name}
                className={styles.image}
                onError={(e) => {
                    // Fallback to placeholder if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(candidate.name)}&background=0D8ABC&color=fff&size=128`;
                }}
            />
            <h3 className={styles.name}>{candidate.name}</h3>
            {/* <p className={styles.dept}>{candidate.department}</p> */}
            <input
                type="radio"
                checked={isSelected}
                readOnly
                className={styles.radio}
            />
        </div>
    );
}
