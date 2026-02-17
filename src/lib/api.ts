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

export interface ResultCandidate {
  id: number;
  name: string;
  votes: number;
  percentage: number;
}

export interface PostResult {
  post_id: number;
  post_title: string;
  total_votes: number;
  candidates: ResultCandidate[];
}

export interface ResultsSummary {
  total_posts: number;
  total_votes: number;
  total_voters: number;
}

export interface GetResultsResponse {
  results: PostResult[];
  summary: ResultsSummary;
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

/**
 * Get election results (requires password)
 */
export async function getResults(password: string): Promise<GetResultsResponse> {
  try {
    const response = await fetch(`${BASE_URL}/api/results`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Results-Password': password,
      },
    });

    const data = (await parseJsonResponse(response)) as GetResultsResponse & { message?: string; error?: string };

    if (!response.ok) {
      const errorMessage = (data.message as string) || (data.error as string) || `Failed to fetch results: ${response.statusText}`;
      const apiError: ApiError = {
        message: errorMessage,
        status: response.status,
      };

      if (response.status === 401 || response.status === 403) {
        apiError.message = 'Invalid password. Please check and try again.';
        apiError.code = 'UNAUTHORIZED';
      }

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
