const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

/** User-friendly message when fetch fails (no connection, CORS, server down, etc.) */
function getNetworkErrorMessage(error: unknown): string {
  const defaultMsg = 'Unable to connect. Please check your internet connection and try again.';
  if (error instanceof Error) {
    const msg = error.message?.trim();
    if (!msg) return defaultMsg;
    if (/failed to fetch|load failed|networkerror|network request failed/i.test(msg)) return defaultMsg;
    return msg;
  }
  if (error && typeof error === 'object' && 'message' in error && typeof (error as { message: unknown }).message === 'string') {
    const msg = String((error as { message: string }).message).trim();
    if (msg) return msg;
  }
  return defaultMsg;
}

/** Parse response as JSON; throw a clear error if server returned HTML or invalid JSON */
async function parseJsonResponse(response: Response): Promise<unknown> {
  const text = await response.text();
  const trimmed = text.trim();
  if (trimmed.startsWith('<') || trimmed.startsWith('<!')) {
    throw new Error('Server returned an unexpected response. Please try again later.');
  }
  try {
    return trimmed ? JSON.parse(text) : {};
  } catch {
    throw new Error('Server returned an unexpected response. Please try again later.');
  }
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

export interface SendOtpResponse {
  message: string;
}

export interface VerifyOtpResponse {
  token: string;
  message?: string;
}

export interface CastVoteRequest {
  votes: Array<{
    post_id: number;
    candidate_id: number;
  }>;
}

export interface CastVoteResponse {
  message: string;
  votes_cast: number;
  failed_votes?: Array<{
    post_id: number;
    error: string;
  }>;
}

export interface HealthResponse {
  status: string;
}

export interface Post {
  id: number;
  title: string;
  is_active: boolean;
}

export interface Candidate {
  id: number;
  name: string;
  department?: string;
  photo_url?: string;
}

export interface PostWithCandidates extends Post {
  candidates: Candidate[];
}

export interface GetAllPostsResponse {
  posts: Post[];
}

export interface GetPostsWithCandidatesResponse {
  posts: PostWithCandidates[];
}

export interface GetCandidatesByPostResponse {
  post: Post;
  candidates: Candidate[];
}

/**
 * Check if the backend is running
 */
export async function checkHealth(): Promise<HealthResponse> {
  try {
    const response = await fetch(`${BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Health check failed: ${response.statusText}`);
    }

    return (await parseJsonResponse(response)) as HealthResponse;
  } catch (error) {
    throw new Error(getNetworkErrorMessage(error));
  }
}

/**
 * Send OTP to voter's phone number
 */
export async function sendOtp(phone: string): Promise<SendOtpResponse> {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/send-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone }),
    });

    const data = (await parseJsonResponse(response)) as Record<string, unknown>;

    if (!response.ok) {
      const errorMessage = (data.message as string) || (data.error as string) || `Failed to send OTP: ${response.statusText}`;
      const apiError: ApiError = {
        message: errorMessage,
        status: response.status,
      };

      // Handle specific error cases
      if (response.status === 404) {
        apiError.message = 'Phone number not found in voter database.';
      } else if (response.status === 403) {
        apiError.message = 'You have already voted. Cannot request OTP again.';
        apiError.code = 'ALREADY_VOTED';
      } else if (response.status === 400) {
        apiError.message = (data.message as string) || 'Invalid phone number format.';
      }

      throw apiError;
    }

    return data as unknown as SendOtpResponse;
  } catch (error) {
    if (error && typeof error === 'object' && 'status' in error && 'message' in error) {
      throw error;
    }
    throw new Error(getNetworkErrorMessage(error));
  }
}

/**
 * Verify OTP and get JWT token
 */
export async function verifyOtp(phone: string, otp: string): Promise<VerifyOtpResponse> {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone, otp }),
    });

    const data = (await parseJsonResponse(response)) as Record<string, unknown>;

    if (!response.ok) {
      const errorMessage = (data.message as string) || (data.error as string) || `Failed to verify OTP: ${response.statusText}`;
      const apiError: ApiError = {
        message: errorMessage,
        status: response.status,
      };

      // Handle specific error cases
      if (response.status === 401) {
        apiError.message = 'Invalid OTP. Please check and try again.';
        apiError.code = 'INVALID_OTP';
      } else if (response.status === 403) {
        apiError.message = (data.message as string) || 'You have already voted. Cannot login again.';
        apiError.code = 'ALREADY_VOTED';
      } else if (response.status === 400) {
        apiError.message = (data.message as string) || 'Invalid or expired OTP. Please check and try again.';
        apiError.code = 'INVALID_OTP';
      } else if (response.status === 404) {
        apiError.message = (data.message as string) || 'Voter not found.';
      }

      throw apiError;
    }

    if (!data.token) {
      throw new Error('No token received from server');
    }

    return data as unknown as VerifyOtpResponse;
  } catch (error) {
    if (error && typeof error === 'object' && 'status' in error && 'message' in error) {
      throw error;
    }
    throw new Error(getNetworkErrorMessage(error));
  }
}

/**
 * Cast votes for multiple posts
 */
export async function castVote(token: string, votes: CastVoteRequest['votes']): Promise<CastVoteResponse> {
  try {
    const response = await fetch(`${BASE_URL}/api/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ votes }),
    });

    const data = (await parseJsonResponse(response)) as Record<string, unknown>;

    if (!response.ok) {
      const errorMessage = (data.message as string) || (data.error as string) || `Failed to cast vote: ${response.statusText}`;
      const apiError: ApiError = {
        message: errorMessage,
        status: response.status,
      };

      // Handle specific error cases
      if (response.status === 401) {
        apiError.message = 'Session expired. Please login again.';
        apiError.code = 'UNAUTHORIZED';
      } else if (response.status === 403) {
        apiError.message = 'You have already voted for one or more posts.';
        apiError.code = 'ALREADY_VOTED';
      } else if (response.status === 400) {
        apiError.message = (data.message as string) || 'Invalid vote data. Please check your selections.';
      } else if (response.status === 404) {
        apiError.message = (data.message as string) || 'Post or candidate not found.';
      }

      // Include failed votes if present
      if (data.failed_votes && Array.isArray(data.failed_votes)) {
        apiError.message += ` Failed votes: ${data.failed_votes.map((fv: any) => `Post ${fv.post_id}: ${fv.error}`).join(', ')}`;
      }

      throw apiError;
    }

    return data as unknown as CastVoteResponse;
  } catch (error) {
    if (error && typeof error === 'object' && 'status' in error && 'message' in error) {
      throw error;
    }
    throw new Error(getNetworkErrorMessage(error));
  }
}

/**
 * Get all active posts
 */
export async function getAllPosts(): Promise<GetAllPostsResponse> {
  try {
    const response = await fetch(`${BASE_URL}/api/posts`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = (await parseJsonResponse(response)) as GetAllPostsResponse & { message?: string; error?: string };

    if (!response.ok) {
      const errorMessage = (data.message as string) || (data.error as string) || `Failed to fetch posts: ${response.statusText}`;
      const apiError: ApiError = {
        message: errorMessage,
        status: response.status,
      };

      throw apiError;
    }

    return data as GetAllPostsResponse;
  } catch (error) {
    if (error && typeof error === 'object' && 'status' in error && 'message' in error) {
      throw error;
    }
    throw new Error(getNetworkErrorMessage(error));
  }
}

/**
 * Get all active posts with their candidates
 */
export async function getPostsWithCandidates(): Promise<GetPostsWithCandidatesResponse> {
  try {
    const response = await fetch(`${BASE_URL}/api/posts/with-candidates`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = (await parseJsonResponse(response)) as GetPostsWithCandidatesResponse & { message?: string; error?: string };

    if (!response.ok) {
      const errorMessage = (data.message as string) || (data.error as string) || `Failed to fetch posts with candidates: ${response.statusText}`;
      const apiError: ApiError = {
        message: errorMessage,
        status: response.status,
      };

      throw apiError;
    }

    return data as GetPostsWithCandidatesResponse;
  } catch (error) {
    if (error && typeof error === 'object' && 'status' in error && 'message' in error) {
      throw error;
    }
    throw new Error(getNetworkErrorMessage(error));
  }
}

/**
 * Get candidates for a specific post
 */
export async function getCandidatesByPost(postId: number): Promise<GetCandidatesByPostResponse> {
  try {
    const response = await fetch(`${BASE_URL}/api/posts/${postId}/candidates`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = (await parseJsonResponse(response)) as GetCandidatesByPostResponse & { message?: string; error?: string };

    if (!response.ok) {
      const errorMessage = (data.message as string) || (data.error as string) || `Failed to fetch candidates: ${response.statusText}`;
      const apiError: ApiError = {
        message: errorMessage,
        status: response.status,
      };

      if (response.status === 404) {
        apiError.message = `Post with ID ${postId} not found.`;
      }

      throw apiError;
    }

    return data as GetCandidatesByPostResponse;
  } catch (error) {
    if (error && typeof error === 'object' && 'status' in error && 'message' in error) {
      throw error;
    }
    throw new Error(getNetworkErrorMessage(error));
  }
}

export interface ElectoralVoter {
  voter_id: number;
  sl_no: number;
  form_no: string;
  name: string;
  designation: string;
  id_no: string;
  created_at: string;
}

export interface ElectoralPagination {
  current_page: number;
  items_per_page: number;
  total_items: number;
  total_pages: number;
  has_next_page: boolean;
  has_previous_page: boolean;
}

export interface ElectoralSummary {
  total_voters: number;
}

export interface GetElectoralVotesResponse {
  voters: ElectoralVoter[];
  pagination: ElectoralPagination;
  summary: ElectoralSummary;
}

/**
 * Get electoral votes with pagination
 */
export async function getElectoralVotes(page: number = 1): Promise<GetElectoralVotesResponse> {
  try {
    const response = await fetch(`${BASE_URL}/api/electoral/votes?page=${page}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = (await parseJsonResponse(response)) as GetElectoralVotesResponse & { message?: string; error?: string };

    if (!response.ok) {
      const errorMessage = (data.message as string) || (data.error as string) || `Failed to fetch electoral votes: ${response.statusText}`;
      const apiError: ApiError = {
        message: errorMessage,
        status: response.status,
      };

      throw apiError;
    }

    return data as GetElectoralVotesResponse;
  } catch (error) {
    if (error && typeof error === 'object' && 'status' in error && 'message' in error) {
      throw error;
    }
    throw new Error(getNetworkErrorMessage(error));
  }
}

// --- Admin API ---

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  token: string;
  message?: string;
}

export interface ResultCandidate {
  candidate_id: number;
  name: string;
  votes: number;
}

export interface ResultPost {
  post_id: number;
  title: string;
  candidates: ResultCandidate[];
}

export interface GetResultsResponse {
  results?: ResultPost[];
}

/**
 * Admin login. Returns JWT for admin-only endpoints.
 */
export async function adminLogin(email: string, password: string): Promise<AdminLoginResponse> {
  try {
    const response = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = (await parseJsonResponse(response)) as Record<string, unknown>;

    if (!response.ok) {
      const errorMessage = (data.message as string) || (data.error as string) || `Login failed: ${response.statusText}`;
      const apiError: ApiError = {
        message: errorMessage,
        status: response.status,
      };
      if (response.status === 401) {
        apiError.message = (data.message as string) || 'Invalid email or password.';
      }
      throw apiError;
    }

    if (!data.token) {
      throw new Error('No token received from server');
    }

    return data as unknown as AdminLoginResponse;
  } catch (error) {
    if (error && typeof error === 'object' && 'status' in error && 'message' in error) {
      throw error;
    }
    throw new Error(getNetworkErrorMessage(error));
  }
}

/**
 * Get voting results. Requires X-Results-Password header (e.g. RESULTS_PASSWORD env).
 */
export async function getResults(resultsPassword: string): Promise<GetResultsResponse> {
  try {
    const response = await fetch(`${BASE_URL}/api/results`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Results-Password': resultsPassword,
      },
    });

    const data = (await parseJsonResponse(response)) as GetResultsResponse & { message?: string; error?: string };

    if (!response.ok) {
      const errorMessage = (data.message as string) || (data.error as string) || `Failed to fetch results: ${response.statusText}`;
      const apiError: ApiError = {
        message: errorMessage,
        status: response.status,
      };
      throw apiError;
    }

    return data as GetResultsResponse;
  } catch (error) {
    if (error && typeof error === 'object' && 'status' in error && 'message' in error) {
      throw error;
    }
    throw new Error(getNetworkErrorMessage(error));
  }
}

/**
 * Create a new post (admin only).
 */
export async function addPost(adminToken: string, title: string, is_active: boolean = true): Promise<{ post: Post } | { message: string }> {
  try {
    const response = await fetch(`${BASE_URL}/api/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ title, is_active }),
    });

    const data = (await parseJsonResponse(response)) as Record<string, unknown>;

    if (!response.ok) {
      const errorMessage = (data.message as string) || (data.error as string) || `Failed to add post: ${response.statusText}`;
      throw { message: errorMessage, status: response.status } as ApiError;
    }

    return data as { post: Post } | { message: string };
  } catch (error) {
    if (error && typeof error === 'object' && 'status' in error && 'message' in error) {
      throw error;
    }
    throw new Error(getNetworkErrorMessage(error));
  }
}

/**
 * Delete a post (admin only).
 */
export async function deletePost(adminToken: string, postId: number): Promise<void> {
  try {
    const response = await fetch(`${BASE_URL}/api/posts/${postId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
      },
    });

    const data = (await parseJsonResponse(response)) as Record<string, unknown>;

    if (!response.ok) {
      const errorMessage = (data.message as string) || (data.error as string) || `Failed to delete post: ${response.statusText}`;
      throw { message: errorMessage, status: response.status } as ApiError;
    }
  } catch (error) {
    if (error && typeof error === 'object' && 'status' in error && 'message' in error) {
      throw error;
    }
    throw new Error(getNetworkErrorMessage(error));
  }
}

/**
 * Add a candidate to a post (admin only).
 */
export async function addCandidate(adminToken: string, postId: number, name: string): Promise<{ candidate: Candidate } | { message: string }> {
  try {
    const response = await fetch(`${BASE_URL}/api/posts/${postId}/candidates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ name }),
    });

    const data = (await parseJsonResponse(response)) as Record<string, unknown>;

    if (!response.ok) {
      const errorMessage = (data.message as string) || (data.error as string) || `Failed to add candidate: ${response.statusText}`;
      throw { message: errorMessage, status: response.status } as ApiError;
    }

    return data as { candidate: Candidate } | { message: string };
  } catch (error) {
    if (error && typeof error === 'object' && 'status' in error && 'message' in error) {
      throw error;
    }
    throw new Error(getNetworkErrorMessage(error));
  }
}

/**
 * Delete a candidate (admin only).
 */
export async function deleteCandidate(adminToken: string, postId: number, candidateId: number): Promise<void> {
  try {
    const response = await fetch(`${BASE_URL}/api/posts/${postId}/candidates/${candidateId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
      },
    });

    const data = (await parseJsonResponse(response)) as Record<string, unknown>;

    if (!response.ok) {
      const errorMessage = (data.message as string) || (data.error as string) || `Failed to delete candidate: ${response.statusText}`;
      throw { message: errorMessage, status: response.status } as ApiError;
    }
  } catch (error) {
    if (error && typeof error === 'object' && 'status' in error && 'message' in error) {
      throw error;
    }
    throw new Error(getNetworkErrorMessage(error));
  }
}
