import { VOTING_DATA } from './mockData';

/**
 * Map frontend post IDs to backend post_id numbers
 * Based on the order in VOTING_DATA array
 */
export function getPostIdMapping(): Record<string, number> {
  return {
    'president': 1,
    'gen_sec': 2,
    'vice_pres': 3,
    'treasurer': 4,
  };
}

/**
 * Map frontend candidate IDs to backend candidate_id numbers
 * Based on the order within each post's candidates array (1-based index)
 * Each post has candidates numbered 1-4
 */
export function getCandidateIdMapping(): Record<string, number> {
  const mapping: Record<string, number> = {};
  
  VOTING_DATA.forEach((post) => {
    post.candidates.forEach((candidate, candidateIndex) => {
      // Map candidate ID to its position (1-4) within the post
      const candidateId = candidateIndex + 1;
      mapping[candidate.id] = candidateId;
    });
  });
  
  return mapping;
}

/**
 * Convert frontend vote selections to backend format
 */
export function convertVotesToBackendFormat(
  selections: Record<string, string>
): Array<{ post_id: number; candidate_id: number }> {
  const postMapping = getPostIdMapping();
  const candidateMapping = getCandidateIdMapping();
  const votes: Array<{ post_id: number; candidate_id: number }> = [];

  Object.entries(selections).forEach(([postId, candidateId]) => {
    const backendPostId = postMapping[postId];
    const backendCandidateId = candidateMapping[candidateId];

    if (backendPostId && backendCandidateId) {
      votes.push({
        post_id: backendPostId,
        candidate_id: backendCandidateId,
      });
    }
  });

  return votes;
}
