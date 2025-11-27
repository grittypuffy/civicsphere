import { NextRequest } from "next/server";
import * as v from 'valibot';
import { SessionCache } from "./cache";
import {
  CommunitiesResponseSchema,
  CreateIssueRequestSchema,
  GetPreferencesResponseSchema,
  IssueResponseMultipleSchema,
  IssueResponseSingleSchema,
  PostResponseSchema,
  TagAnalyticsSchema,
  TagResponseSchema,
  TrendingResponseSchema,
  UserDataResponseSchema,
  UserIssuesResponseSchema,
  UserPostsResponseSchema,
  UserPreferencesResponseSchema,
  UserPreferencesUpdateRequestSchema,
  UserReactionsResponseSchema
} from "./schema";
import { CreateIssueRequest, UserPreferencesUpdateRequest } from "./types";

const sessionCache = new SessionCache<boolean>({
  ttl: 5 * 60 * 1000,
  maxSize: 1000
});

export const isAuthenticated = async (req: NextRequest): Promise<boolean> => {
  const token = req.cookies.get('token');
  if (!token) {
    return false;
  }

  const tokenValue = token.value;

  // Check cache first
  const cachedResult = sessionCache.get(tokenValue);
  if (cachedResult !== undefined) {
    // Return cached result
    return cachedResult;
  }

  try {
    const backendApi = process.env.NEXT_PUBLIC_BACKEND_URL;
    const newUrl = `${backendApi}/api/v1/auth/session/is_valid`;
    const newReq = new Request(newUrl, req.clone());

    const res = await fetch(newReq, {
      signal: AbortSignal.timeout(30000),
    });

    const isValid = res.status === 200;

    // Cache the result
    sessionCache.set(tokenValue, isValid);

    return isValid;
  } catch (error) {
    if (error instanceof Error && error.name === 'TimeoutError') {
      console.error('Request timeout while validating session');
    } else {
      console.error('Error proxying request:', error);
    }

    // Don't cache errors, return false
    return false;
  }
}

// Helper function to clear session cache (useful for logout scenarios)
export const clearSessionCache = (tokenValue?: string): void => {
  if (tokenValue) {
    sessionCache.delete(tokenValue);
  } else {
    sessionCache.clear();
  }
}

// Helper function to get cache stats (useful for debugging)
export const getSessionCacheStats = () => {
  return {
    size: sessionCache['cache'].size,
    ttl: sessionCache['ttl']
  };
}

export const getFeeds = async () => {
  const res = await fetch(`/api/v1/feed`, {
    signal: AbortSignal.timeout(30000),
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error('Failed to fetch feed data');
  }
  const json = await res.json();
  // if (!json.success) {
  //   throw new Error('Failed to fetch feed data');
  // }
  return json.data || [];
}

export const getTrendingPosts = async () => {
  const res = await fetch(`/api/v1/trending`, {
    signal: AbortSignal.timeout(30000),
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error('Failed to fetch trending posts');
  }
  const json = v.parse(TrendingResponseSchema, await res.json());
  if (!json.success) {
    throw new Error('Failed to fetch trending posts');
  }
  return json.data || [];
}

export const getTrendingTopics = async () => {
  const res = await fetch(`/api/v1/trending/analytics`, {
    signal: AbortSignal.timeout(30000),
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error('Failed to fetch trending analytics');
  }
  const json = v.parse(TagAnalyticsSchema, await res.json());
  if (!json.success) {
    throw new Error('Failed to fetch trending analytics');
  }
  return json.data || [];
}

// User Preferences API
export const getUserPreferences = async () => {
  const res = await fetch(`/api/v1/user/preferences`, {
    signal: AbortSignal.timeout(30000),
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error('Failed to fetch user preferences');
  }
  const json = v.parse(GetPreferencesResponseSchema, await res.json());
  if (!json.success) {
    throw new Error('Failed to fetch user preferences');
  }
  return json.data;
}

export const updateUserPreferences = async (preferences: UserPreferencesUpdateRequest) => {
  const res = await fetch(`/api/v1/user/preferences`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(v.parse(UserPreferencesUpdateRequestSchema, preferences)),
    signal: AbortSignal.timeout(30000),
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error('Failed to update user preferences');
  }
  const json = v.parse(UserPreferencesResponseSchema, await res.json());
  if (!json.success) {
    throw new Error('Failed to update user preferences');
  }
  return json;
}

// User Posts API
export const getUserPosts = async () => {
  const res = await fetch(`/api/v1/u/posts`, {
    signal: AbortSignal.timeout(30000),
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error('Failed to fetch user posts');
  }
  const json = v.parse(UserPostsResponseSchema, await res.json());
  if (!json.success) {
    throw new Error('Failed to fetch user posts');
  }
  return json.data || [];
}

export const getUserPostUpvotes = async () => {
  const res = await fetch(`/api/v1/u/posts/upvotes`, {
    signal: AbortSignal.timeout(30000),
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error('Failed to fetch user upvotes');
  }
  const json = v.parse(UserReactionsResponseSchema, await res.json());
  if (!json.success) {
    throw new Error('Failed to fetch user upvotes');
  }
  return json.data || [];
}

export const getUserPostDownvotes = async () => {
  const res = await fetch(`/api/v1/u/posts/downvotes`, {
    signal: AbortSignal.timeout(30000),
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error('Failed to fetch user downvotes');
  }
  const json = v.parse(UserReactionsResponseSchema, await res.json());
  if (!json.success) {
    throw new Error('Failed to fetch user downvotes');
  }
  return json.data || [];
}

// User Issues API
export const getUserIssues = async () => {
  const res = await fetch(`/api/v1/u/issues`, {
    signal: AbortSignal.timeout(30000),
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error('Failed to fetch user issues');
  }
  const json = v.parse(UserIssuesResponseSchema, await res.json());
  if (!json.success) {
    throw new Error('Failed to fetch user issues');
  }
  return json.data || [];
}

export const getUserIssueUpvotes = async () => {
  const res = await fetch(`/api/v1/u/issues/upvotes`, {
    signal: AbortSignal.timeout(30000),
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error('Failed to fetch user issue upvotes');
  }
  const json = v.parse(UserReactionsResponseSchema, await res.json());
  if (!json.success) {
    throw new Error('Failed to fetch user issue upvotes');
  }
  return json.data || [];
}

// User Details API
export const getUserDetails = async (username: string) => {
  const res = await fetch(`/api/v1/u/${username}`, {
    signal: AbortSignal.timeout(30000),
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error('Failed to fetch user details');
  }
  const json = v.parse(UserDataResponseSchema, await res.json());
  if (!json.success) {
    throw new Error('Failed to fetch user details');
  }
  return json.data;
}

// Community Posts API
export const createPost = async (communityId: string, formData: FormData) => {
  const res = await fetch(`/api/v1/c/${communityId}/post`, {
    method: 'POST',
    body: formData,
    signal: AbortSignal.timeout(30000),
    credentials: 'include',
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  if (!res.ok) {
    throw new Error('Failed to create post');
  }
  return await res.json();
}

export const createVoicePost = async (communityId: string, tags: string[]) => {
  const res = await fetch(`/api/v1/c/${communityId}/post/voice`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(tags),
    signal: AbortSignal.timeout(30000),
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error('Failed to create voice post');
  }
  return await res.json();
}

export const getCommunityPosts = async (communityId: string) => {
  const res = await fetch(`/api/v1/c/${communityId}/posts`, {
    signal: AbortSignal.timeout(30000),
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error('Failed to fetch community posts');
  }
  const json = v.parse(TrendingResponseSchema, await res.json());
  if (!json.success) {
    throw new Error('Failed to create post');
  }
  return json.data || [];
}

export const getPost = async (communityId: string, postId: string) => {
  const res = await fetch(`/api/v1/c/${communityId}/${postId}`, {
    signal: AbortSignal.timeout(30000),
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error('Failed to fetch post');
  }
  return v.parse(PostResponseSchema, await res.json());
}

export const explainPost = async (communityId: string, postId: string) => {
  const res = await fetch(`/api/v1/c/${communityId}/${postId}/explain`, {
    signal: AbortSignal.timeout(30000),
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error('Failed to explain post');
  }
  return await res.json();
}

export const upvotePost = async (communityId: string, postId: string) => {
  const res = await fetch(`/api/v1/c/${communityId}/${postId}/upvote`, {
    method: 'PUT',
    signal: AbortSignal.timeout(30000),
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error('Failed to upvote post');
  }
  return await res.json();
}

export const downvotePost = async (communityId: string, postId: string) => {
  const res = await fetch(`/api/v1/c/${communityId}/${postId}/downvote`, {
    method: 'PUT',
    signal: AbortSignal.timeout(30000),
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error('Failed to downvote post');
  }
  return await res.json();
}

export const removeUpvotePost = async (communityId: string, postId: string) => {
  const res = await fetch(`/api/v1/c/${communityId}/${postId}/remove_upvote`, {
    method: 'DELETE',
    signal: AbortSignal.timeout(30000),
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error('Failed to remove upvote from post');
  }
  return await res.json();
}

export const removeDownvotePost = async (communityId: string, postId: string) => {
  const res = await fetch(`/api/v1/c/${communityId}/${postId}/remove_downvote`, {
    method: 'DELETE',
    signal: AbortSignal.timeout(30000),
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error('Failed to remove downvote from post');
  }
  return await res.json();
}

// Community Issues API
export const getCommunityIssues = async (communityId: string) => {
  const res = await fetch(`/api/v1/c/${communityId}/issues/all`, {
    signal: AbortSignal.timeout(30000),
    credentials: 'include',
  });
  const json = v.parse(IssueResponseMultipleSchema, await res.json());
  if (!json.success) {
    throw new Error('Failed to fetch issue');
  }
  return json.data || [];
}

export const getIssue = async (communityId: string, issueId: string) => {
  const res = await fetch(`/api/v1/c/${communityId}/issues/${issueId}`, {
    signal: AbortSignal.timeout(30000),
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error('Failed to fetch issue');
  }
  const json = v.parse(IssueResponseSingleSchema, await res.json());
  if (!json.success) {
    throw new Error('Failed to fetch issue');
  }
  return json.data;
}

export const createIssue = async (communityId: string, issue: CreateIssueRequest) => {
  const res = await fetch(`/api/v1/c/${communityId}/issues`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(v.parse(CreateIssueRequestSchema, issue)),
    signal: AbortSignal.timeout(30000),
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error('Failed to create issue');
  }
  return await res.json();
}

export const upvoteIssue = async (communityId: string, issueId: string) => {
  const res = await fetch(`/api/v1/c/${communityId}/issues/${issueId}/upvote`, {
    method: 'PUT',
    signal: AbortSignal.timeout(30000),
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error('Failed to upvote issue');
  }
  return await res.json();
}

export const removeUpvoteIssue = async (communityId: string, issueId: string) => {
  const res = await fetch(`/api/v1/c/${communityId}/issues/${issueId}/remove_upvote`, {
    method: 'DELETE',
    signal: AbortSignal.timeout(30000),
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error('Failed to remove upvote from issue');
  }
  return await res.json();
}

export const resolveIssue = async (communityId: string, issueId: string) => {
  const res = await fetch(`/api/v1/c/${communityId}/issues/${issueId}/resolve`, {
    method: 'PUT',
    signal: AbortSignal.timeout(30000),
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error('Failed to resolve issue');
  }
  return await res.json();
}

export const closeIssue = async (communityId: string, issueId: string) => {
  const res = await fetch(`/api/v1/c/${communityId}/issues/${issueId}/close`, {
    method: 'PUT',
    signal: AbortSignal.timeout(30000),
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error('Failed to close issue');
  }
  return await res.json();
}

// Communities API
export const getCommunities = async () => {
  const res = await fetch(`/api/v1/c/communities`, {
    signal: AbortSignal.timeout(30000),
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error('Failed to fetch communities');
  }
  const json = v.parse(CommunitiesResponseSchema, await res.json());
  if (!json.success) {
    throw new Error('Failed to fetch communities');
  }
  return json.data || [];
}

// Tags API
export const getTags = async () => {
  const res = await fetch(`/api/v1/tag/en`, {
    signal: AbortSignal.timeout(30000),
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error('Failed to fetch tags');
  }
  const json = v.parse(TagResponseSchema, await res.json());
  if (!json.success) {
    throw new Error('Failed to fetch tags');
  }
  return json.tags || {};
}
