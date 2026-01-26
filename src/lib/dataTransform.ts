import { PostWithCandidates, Candidate as BackendCandidate } from './api';
import { Post, Candidate } from './mockData';

/**
 * Transform backend candidate to frontend format
 */
function transformCandidate(backendCandidate: BackendCandidate, postId: number): Candidate {
  return {
    id: `${postId}-${backendCandidate.id}`, // Create unique string ID: "postId-candidateId"
    name: backendCandidate.name,
    department: backendCandidate.department || 'N/A',
    photoUrl: backendCandidate.photo_url || '',
  };
}

/**
 * Transform backend post with candidates to frontend format
 */
export function transformBackendData(backendPosts: PostWithCandidates[]): Post[] {
  return backendPosts
    .filter(post => post.is_active) // Only include active posts
    .map(post => ({
      id: `post-${post.id}`, // Create string ID: "post-1", "post-2", etc.
      title: post.title,
      candidates: post.candidates.map(candidate => transformCandidate(candidate, post.id)),
    }));
}

/**
 * Extract backend post ID from frontend post ID
 */
export function extractPostId(frontendPostId: string): number {
  const match = frontendPostId.match(/^post-(\d+)$/);
  if (!match) {
    throw new Error(`Invalid post ID format: ${frontendPostId}`);
  }
  return parseInt(match[1], 10);
}

/**
 * Extract backend candidate ID from frontend candidate ID
 */
export function extractCandidateId(frontendCandidateId: string): number {
  const match = frontendCandidateId.match(/^(\d+)-(\d+)$/);
  if (!match) {
    throw new Error(`Invalid candidate ID format: ${frontendCandidateId}`);
  }
  return parseInt(match[2], 10);
}

/**
 * Convert frontend vote selections to backend format using extracted IDs
 */
export function convertVotesToBackendFormat(
  selections: Record<string, string>
): Array<{ post_id: number; candidate_id: number }> {
  const votes: Array<{ post_id: number; candidate_id: number }> = [];

  Object.entries(selections).forEach(([postId, candidateId]) => {
    try {
      const backendPostId = extractPostId(postId);
      const backendCandidateId = extractCandidateId(candidateId);

      votes.push({
        post_id: backendPostId,
        candidate_id: backendCandidateId,
      });
    } catch (error) {
      console.error(`Failed to convert vote for post ${postId}, candidate ${candidateId}:`, error);
    }
  });

  return votes;
}
