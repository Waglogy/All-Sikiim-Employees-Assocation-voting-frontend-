
import React from 'react';
import { Post } from '../lib/mockData';
import CandidateCard from './CandidateCard';

interface PostCardProps {
    post: Post;
    selectedCandidateId: string | null;
    onVote: (candidateId: string) => void;
}

export default function PostCard({ post, selectedCandidateId, onVote }: PostCardProps) {
    return (
        <div className="bg-white border text-left border-gray-200 shadow-sm rounded-lg overflow-hidden mb-8">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg md:text-xl font-bold text-gray-800">
                    Post: <span className="text-blue-900">{post.title}</span>
                </h2>
                <p className="text-sm text-gray-500 mt-1">Select one candidate for this post.</p>
            </div>
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {post.candidates.map((candidate) => (
                        <CandidateCard
                            key={candidate.id}
                            candidate={candidate}
                            name={`post_${post.id}`}
                            isSelected={selectedCandidateId === candidate.id}
                            onSelect={() => onVote(candidate.id)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
