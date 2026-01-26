'use client';

import { useState, useEffect } from 'react';
import { Post } from '@/lib/mockData';
import PostSection from '@/components/PostSection';
import Modal from '@/components/Modal';
import { useRouter } from 'next/navigation';
import { getToken, removeToken } from '@/lib/auth';
import { castVote, ApiError, getPostsWithCandidates } from '@/lib/api';
import { convertVotesToBackendFormat, transformBackendData } from '@/lib/dataTransform';

export default function VotingPage() {
    const router = useRouter();
    const [selections, setSelections] = useState<Record<string, string>>({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoadingPosts, setIsLoadingPosts] = useState(true);

    useEffect(() => {
        // Check if user is authenticated
        const token = getToken();
        if (!token) {
            router.push('/');
            return;
        }
        setIsAuthenticated(true);
        
        // Fetch posts with candidates from backend
        const fetchPosts = async () => {
            setIsLoadingPosts(true);
            setError(null);
            try {
                const response = await getPostsWithCandidates();
                const transformedPosts = transformBackendData(response.posts);
                setPosts(transformedPosts);
            } catch (err) {
                const apiError = err as ApiError;
                // If network error, fallback to empty array (user can still see the page)
                if (apiError.message.includes('Network error') || apiError.message.includes('Failed to connect')) {
                    console.warn('Failed to fetch posts from backend, using empty list:', apiError.message);
                    setPosts([]);
                } else {
                    setError(`Failed to load voting data: ${apiError.message}`);
                }
            } finally {
                setIsLoadingPosts(false);
            }
        };

        fetchPosts();
    }, [router]);

    const handleSelect = (postId: string, candidateId: string) => {
        setSelections(prev => ({
            ...prev,
            [postId]: candidateId
        }));
        // Clear error when user makes a selection
        if (error) {
            setError(null);
        }
    };

    const isFormComplete = posts.length > 0 && posts.every(post => selections[post.id]);

    const handleInitialSubmit = () => {
        if (!isFormComplete) {
            setError('Please select a candidate for all posts.');
            return;
        }
        setError(null);
        setIsModalOpen(true);
    };

    const handleConfirmVote = async () => {
        const token = getToken();
        if (!token) {
            setError('Session expired. Please login again.');
            setIsModalOpen(false);
            setTimeout(() => {
                router.push('/');
            }, 2000);
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            // Convert selections to backend format
            const votes = convertVotesToBackendFormat(selections);

            if (votes.length === 0) {
                throw new Error('No valid votes to submit');
            }

            // Cast votes
            const response = await castVote(token, votes);

            // Success - clear token and redirect
            removeToken();
            setIsModalOpen(false);
            
            // Show success message
            alert(`Vote Submitted Successfully! ${response.votes_cast} vote(s) recorded. Thank you.`);
            
            // Redirect to home page
            router.push('/');
        } catch (err) {
            const apiError = err as ApiError;
            setIsModalOpen(false);
            
            let errorMessage = apiError.message || 'Failed to submit vote. Please try again.';
            
            // Handle specific error cases
            if (apiError.code === 'ALREADY_VOTED') {
                errorMessage = 'You have already voted. You cannot vote again.';
                // Clear token and redirect after showing error
                removeToken();
                setTimeout(() => {
                    router.push('/');
                }, 3000);
            } else if (apiError.code === 'UNAUTHORIZED') {
                errorMessage = 'Session expired. Please login again.';
                removeToken();
                setTimeout(() => {
                    router.push('/');
                }, 2000);
            }
            
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Show loading state while checking authentication or loading posts
    if (!isAuthenticated || isLoadingPosts) {
        return (
            <div className="container" style={{ textAlign: 'center', padding: '2rem' }}>
                <p>Loading voting data...</p>
            </div>
        );
    }

    return (
        <div className="container">
            <h1 style={{ margin: '2rem 0', textAlign: 'center', borderBottom: '1px solid #ddd', paddingBottom: '1rem' }}>
                SGEA Election 2024 Ballot
            </h1>

            {error && (
                <div style={{
                    padding: '1rem',
                    margin: '1rem 0',
                    backgroundColor: '#fee',
                    color: '#c33',
                    borderRadius: '4px',
                    border: '1px solid #fcc',
                    fontSize: '0.9rem',
                    textAlign: 'center'
                }}>
                    {error}
                </div>
            )}

            {posts.length === 0 ? (
                <div style={{
                    padding: '2rem',
                    textAlign: 'center',
                    color: '#666'
                }}>
                    <p>No active posts available for voting.</p>
                </div>
            ) : (
                posts.map(post => (
                    <PostSection
                        key={post.id}
                        post={post}
                        selectedCandidateId={selections[post.id]}
                        onSelectCandidate={(candidateId) => handleSelect(post.id, candidateId)}
                    />
                ))
            )}

            <div style={{ padding: '2rem 0', textAlign: 'center' }}>
                <button
                    onClick={handleInitialSubmit}
                    className="primary-btn"
                    disabled={isSubmitting || !isFormComplete}
                    style={{
                        fontSize: '1.2rem',
                        padding: '1rem 3rem',
                        opacity: isFormComplete && !isSubmitting ? 1 : 0.5,
                        cursor: isFormComplete && !isSubmitting ? 'pointer' : 'not-allowed'
                    }}
                >
                    {isSubmitting ? 'Submitting...' : 'Submit Final Vote'}
                </button>
            </div>

            <Modal
                isOpen={isModalOpen}
                title="Confirm Submission"
                message="Are you sure you want to submit your vote? Once your vote is recorded, you are not allowed to vote again."
                onConfirm={handleConfirmVote}
                onCancel={() => {
                    if (!isSubmitting) {
                        setIsModalOpen(false);
                    }
                }}
                isLoading={isSubmitting}
            />
        </div>
    );
}
