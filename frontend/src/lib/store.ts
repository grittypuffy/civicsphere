import { createStore } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  ChatData,
  IssueResponse,
  LangCode,
  PostResponse,
  User,
  UserPreferences
} from './types';

// Global Store Type
export type GlobalStore = {
  state: GlobalState;
  actions: GlobalActions;
};

export const createGlobalStore = (
  initialState: GlobalState = initialGlobalState
) => {
  return createStore<GlobalStore>()(
    persist(
      set => ({
        state: initialState,
        actions: {} as GlobalActions, // Actions will be defined later
      }),
      {
        name: 'global-store',
      }
    )
  );
}

export const initialGlobalState: GlobalState = {
  auth: {
    isAuthenticated: false,
    user: null,
    token: null,
    isLoading: false,
  },
  userPreferences: null,
  chat: {
    messages: [],
    isLoading: false,
    error: null,
  },
  posts: {
    trending: [],
    userPosts: [],
    isLoading: false,
    error: null,
  },
  issues: {
    userIssues: [],
    isLoading: false,
    error: null,
  },
  ui: {
    theme: 'auto',
    language: 'en',
    sidebarCollapsed: false,
    notifications: [],
  },
  tags: {},
  loading: {
    userProfile: false,
    preferences: false,
    posts: false,
    issues: false,
    tags: false,
  },
  errors: {
    global: null,
    auth: null,
    api: null,
  },
}

export type GlobalState = {
  // Authentication state
  auth: {
    isAuthenticated: boolean;
    user: User | null;
    token: string | null;
    isLoading: boolean;
  };
  // User preferences and data
  userPreferences: UserPreferences | null;
  // Chat state
  chat: {
    messages: ChatData[];
    isLoading: boolean;
    error: string | null;
  };
  // Content state
  posts: {
    trending: PostResponse[];
    userPosts: PostResponse[];
    isLoading: boolean;
    error: string | null;
  };
  issues: {
    userIssues: IssueResponse[];
    isLoading: boolean;
    error: string | null;
  };
  // UI state
  ui: {
    theme: 'light' | 'dark' | 'auto';
    language: LangCode;
    sidebarCollapsed: boolean;
    notifications: Array<{
      id: string;
      message: string;
      type: 'success' | 'error' | 'warning' | 'info';
      timestamp: number;
    }>;
  };
  // Tags and metadata
  tags: Record<string, string>;
  // Loading states for various operations
  loading: {
    userProfile: boolean;
    preferences: boolean;
    posts: boolean;
    issues: boolean;
    tags: boolean;
  };
  // Error states
  errors: {
    global: string | null;
    auth: string | null;
    api: string | null;
  };
};

// Action Types for State Management
export type GlobalActions = {
  // Authentication Actions
  auth: {
    setAuthenticated: (isAuthenticated: boolean) => void;
    setUser: (user: User | null) => void;
    setToken: (token: string | null) => void;
    setAuthLoading: (isLoading: boolean) => void;
    setAuthError: (error: string | null) => void;
    signOut: () => void;
  };

  // User Preferences Actions
  userPreferences: {
    setPreferences: (preferences: UserPreferences | null) => void;
    updatePreferences: (updates: Partial<UserPreferences>) => void;
  };

  // Chat Actions
  chat: {
    addMessage: (message: ChatData) => void;
    setMessages: (messages: ChatData[]) => void;
    setChatLoading: (isLoading: boolean) => void;
    setChatError: (error: string | null) => void;
    clearMessages: () => void;
  };

  // Posts Actions
  posts: {
    setTrendingPosts: (posts: PostResponse[]) => void;
    setUserPosts: (posts: PostResponse[]) => void;
    addTrendingPost: (post: PostResponse) => void;
    addUserPost: (post: PostResponse) => void;
    updatePost: (postId: string, updates: Partial<PostResponse>) => void;
    removePost: (postId: string, type: 'trending' | 'user') => void;
    setPostsLoading: (isLoading: boolean) => void;
    setPostsError: (error: string | null) => void;
  };

  // Issues Actions
  issues: {
    setUserIssues: (issues: IssueResponse[]) => void;
    addIssue: (issue: IssueResponse) => void;
    updateIssue: (issueId: string, updates: Partial<IssueResponse>) => void;
    removeIssue: (issueId: string) => void;
    setIssuesLoading: (isLoading: boolean) => void;
    setIssuesError: (error: string | null) => void;
  };

  // UI Actions
  ui: {
    setTheme: (theme: 'light' | 'dark' | 'auto') => void;
    setLanguage: (language: LangCode) => void;
    setSidebarCollapsed: (collapsed: boolean) => void;
    addNotification: (notification: Omit<GlobalState['ui']['notifications'][0], 'id' | 'timestamp'>) => void;
    removeNotification: (id: string) => void;
    clearNotifications: () => void;
  };

  // Tags Actions
  tags: {
    setTags: (tags: Record<string, string>) => void;
    addTag: (id: string, name: string) => void;
    removeTag: (id: string) => void;
  };

  // Loading Actions
  loading: {
    setUserProfileLoading: (loading: boolean) => void;
    setPreferencesLoading: (loading: boolean) => void;
    setPostsLoading: (loading: boolean) => void;
    setIssuesLoading: (loading: boolean) => void;
    setTagsLoading: (loading: boolean) => void;
  };

  // Error Actions
  errors: {
    setGlobalError: (error: string | null) => void;
    setAuthError: (error: string | null) => void;
    setApiError: (error: string | null) => void;
    clearErrors: () => void;
  };

  // Utility Actions
  reset: () => void;
  hydrate: (state: Partial<GlobalState>) => void;
};
