
'use client';

import React, { useState } from 'react';
import { POSTS } from '../lib/mockData';
import PostCard from './PostCard';
import { useRouter } from 'next/navigation';

export default function VotingDashboard() {
    const router = useRouter();
    const [votes, setVotes] = useState<Record<number, string>>({});
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleVote = (postId: number, candidateId: string) => {
        setVotes((prev) => ({
            ...prev,
            [postId]: candidateId,
        }));
    };

    const handleSubmit = () => {
        // Check if all posts have a vote
        const allVoted = POSTS.every((post) => votes[post.id]);

        if (!allVoted) {
            const confirm = window.confirm("You haven't selected a candidate for all posts. Do you wish to proceed anyway?");
            if (!confirm) return;
        } else {
            const confirm = window.confirm("Are you sure you want to submit your vote? This action cannot be undone.");
            if (!confirm) return;
        }

        setSubmitting(true);

        // Simulate API submission
        setTimeout(() => {
            setSubmitting(false);
            setSubmitted(true);
            // In a real app, clear auth/redirect
        }, 1500);
    };

    if (submitted) {
        return (
            <div className="max-w-xl mx-auto text-center py-20 px-4">
                <div className="bg-green-100 rounded-full h-24 w-24 flex items-center justify-center mx-auto mb-6">
                    <svg className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Vote Submitted Successfully</h2>
                <p className="text-gray-600 mb-8">Thank you for participating in the ongoing election. Your vote has been recorded securely.</p>
                <button
                    onClick={() => router.push('/')}
                    className="bg-blue-900 text-white px-6 py-2 rounded shadow hover:bg-blue-800"
                >
                    Return to Home
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <div className="mb-8 text-center md:text-left">
                <h1 className="text-2xl font-bold text-gray-900">Official Ballot Paper</h1>
                <p className="text-gray-600">Please select your preferred candidate for each post below.</p>
            </div>

            <div className="space-y-6">
                {POSTS.map((post) => (
                    <PostCard
                        key={post.id}
                        post={post}
                        selectedCandidateId={votes[post.id] || null}
                        onVote={(candidateId) => handleVote(post.id, candidateId)}
                    />
                ))}
            </div>

            <div className="mt-12 p-6 bg-yellow-50 border border-yellow-200 rounded-lg text-center md:text-left md:flex justify-between items-center">
                <div className="mb-4 md:mb-0">
                    <h3 className="font-semibold text-yellow-800">Review your choices</h3>
                    <p className="text-sm text-yellow-700">Once submitted, votes cannot be changed.</p>
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className={`w-full md:w-auto px-8 py-3 bg-green-700 hover:bg-green-600 text-white font-bold rounded shadow-lg transition-transform transform active:scale-95 ${submitting ? 'opacity-70 cursor-wait' : ''
                        }`}
                >
                    {submitting ? 'Submitting...' : 'Submit Final Vote'}
                </button>
            </div>
        </div>
    );
}
