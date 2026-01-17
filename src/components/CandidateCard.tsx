import { Candidate } from '@/lib/mockData';
import styles from './CandidateCard.module.css';

interface Props {
    candidate: Candidate;
    isSelected: boolean;
    onSelect: () => void;
}

export default function CandidateCard({ candidate, isSelected, onSelect }: Props) {
    return (
        <div
            className={`${styles.card} ${isSelected ? styles.selected : ''}`}
            onClick={onSelect}
        >
            <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(candidate.name)}&background=0D8ABC&color=fff&size=128`}
                alt={candidate.name}
                className={styles.image}
            />
            <h3 className={styles.name}>{candidate.name}</h3>
            <p className={styles.dept}>{candidate.department}</p>
            <input
                type="radio"
                checked={isSelected}
                readOnly
                className={styles.radio}
            />
        </div>
    );
}
