'use client';

import { useState } from 'react';
import { VOTING_DATA } from '@/lib/mockData';
import PostSection from '@/components/PostSection';
import Modal from '@/components/Modal';
import { useRouter } from 'next/navigation';

export default function VotingPage() {
    const router = useRouter();
    const [selections, setSelections] = useState<Record<string, string>>({});
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSelect = (postId: string, candidateId: string) => {
        setSelections(prev => ({
            ...prev,
            [postId]: candidateId
        }));
    };

    const isFormComplete = VOTING_DATA.every(post => selections[post.id]);

    const handleInitialSubmit = () => {
        if (!isFormComplete) {
            alert('Please select a candidate for all posts.');
            return;
        }
        setIsModalOpen(true);
    };

    const handleConfirmVote = () => {
        // Here we would submit to backend
        alert('Vote Submitted Successfully! Thank you.');
        router.push('/');
        setIsModalOpen(false);
    };

    return (
        <div className="container">
            <h1 style={{ margin: '2rem 0', textAlign: 'center', borderBottom: '1px solid #ddd', paddingBottom: '1rem' }}>
                SGEA Election 2024 Ballot
            </h1>

            {VOTING_DATA.map(post => (
                <PostSection
                    key={post.id}
                    post={post}
                    selectedCandidateId={selections[post.id]}
                    onSelectCandidate={(candidateId) => handleSelect(post.id, candidateId)}
                />
            ))}

            <div style={{ padding: '2rem 0', textAlign: 'center' }}>
                <button
                    onClick={handleInitialSubmit}
                    className="primary-btn"
                    style={{
                        fontSize: '1.2rem',
                        padding: '1rem 3rem',
                        opacity: isFormComplete ? 1 : 0.5,
                        cursor: isFormComplete ? 'pointer' : 'not-allowed'
                    }}
                >
                    Submit Final Vote
                </button>
            </div>

            <Modal
                isOpen={isModalOpen}
                title="Confirm Submission"
                message="Are you sure you want to submit your vote? Detailed summary will be shown next."
                onConfirm={handleConfirmVote}
                onCancel={() => setIsModalOpen(false)}
            />
        </div>
    );
}
