import { ToastIntent, ToastPosition } from '@fluentui/react-components';
import * as v from 'valibot';
import {
  AuthResponseSchema,
  ChatDataSchema,
  ChatRequestSchema,
  ChatResponseSchema,
  CommunitiesResponseSchema,
  CommunitySchema,
  CreateIssueRequestSchema,
  CreatePostRequestSchema,
  GetPreferencesResponseSchema,
  HTTPValidationErrorSchema,
  IssueResponseMultipleSchema,
  IssueResponseSingleSchema,
  IssueSchema,
  LanguageSchema,
  OnboardFormSchema,
  PostResponseSchema,
  SignInFormSchema,
  SignInRequestSchema,
  SignUpFormSchema,
  SignUpRequestSchema,
  TagAnalyticsSchema,
  TagCountSchema,
  TagResponseSchema,
  TrendingResponseSchema,
  UserDataModelSchema,
  UserDataResponseSchema,
  UserIssuesResponseSchema,
  UserPostsResponseSchema,
  UserPreferencesRequestSchema,
  UserPreferencesResponseSchema,
  UserPreferencesSchema,
  UserPreferencesUpdateRequestSchema,
  UserReactionsResponseSchema,
  UserSchema,
  ValidationErrorSchema
} from "./schema";

// Form Data Types
export type SignUpFormData = v.InferInput<typeof SignUpFormSchema>;
export type SignInFormData = v.InferInput<typeof SignInFormSchema>;
export type OnboardFormData = v.InferInput<typeof OnboardFormSchema>;

// UI Component Types
export type ValidationState = 'error' | 'warning' | 'success' | 'none';
export type ToastFunc = ({ message, description }: {
  message: string;
  description?: string | undefined;
}, intent: ToastIntent, position?: ToastPosition) => void

// Language & Localization Types
export type LangCode = 'ar' | 'bn' | 'de' | 'el' | 'en' | 'es' | 'fr' | 'hi' | 'ht' | 'it' | 'ja' | 'ko' | 'pl' | 'pa' | 'pt' | 'ru' | 'tl' | 'ur' | 'yi' | 'zh';
export type Language = v.InferOutput<typeof LanguageSchema>;

// Authentication Types
export type AuthResponse = v.InferOutput<typeof AuthResponseSchema>;
export type SignInRequest = v.InferInput<typeof SignInRequestSchema>;
export type SignUpRequest = v.InferInput<typeof SignUpRequestSchema>;

// Chat Types
export type ChatData = v.InferOutput<typeof ChatDataSchema>;
export type ChatRequest = v.InferInput<typeof ChatRequestSchema>;
export type ChatResponse = v.InferOutput<typeof ChatResponseSchema>;

// Validation & Error Types
export type ValidationError = v.InferOutput<typeof ValidationErrorSchema>;
export type HTTPValidationError = v.InferOutput<typeof HTTPValidationErrorSchema>;

// User Types
export type User = {
  user: UserData,
  preferences: UserPreferences;
}
export type UserData = v.InferOutput<typeof UserSchema>;
export type UserDataModel = v.InferOutput<typeof UserDataModelSchema>;
export type UserDataResponse = v.InferOutput<typeof UserDataResponseSchema>;
export type UserPreferences = v.InferOutput<typeof UserPreferencesSchema>;
export type UserPreferencesRequest = v.InferInput<typeof UserPreferencesRequestSchema>;
export type UserPreferencesResponse = v.InferOutput<typeof UserPreferencesResponseSchema>;
export type UserPreferencesUpdateRequest = v.InferInput<typeof UserPreferencesUpdateRequestSchema>;
export type GetPreferencesResponse = v.InferOutput<typeof GetPreferencesResponseSchema>;
export type UserIssuesResponse = v.InferOutput<typeof UserIssuesResponseSchema>;
export type UserPostsResponse = v.InferOutput<typeof UserPostsResponseSchema>;
export type UserReactionsResponse = v.InferOutput<typeof UserReactionsResponseSchema>;

// Content Types
export type Issue = v.InferOutput<typeof IssueSchema>;
export type IssueResponseSingle = v.InferOutput<typeof IssueResponseSingleSchema>;
export type IssueResponseMultiple = v.InferOutput<typeof IssueResponseMultipleSchema>;
export type CreateIssueRequest = v.InferInput<typeof CreateIssueRequestSchema>;
export type CreatePostRequest = v.InferInput<typeof CreatePostRequestSchema>;
export type PostResponse = v.InferOutput<typeof PostResponseSchema>;
export type TagCount = v.InferOutput<typeof TagCountSchema>;
export type TagAnalytics = v.InferOutput<typeof TagAnalyticsSchema>;
export type TagResponse = v.InferOutput<typeof TagResponseSchema>;
export type TrendingResponse = v.InferOutput<typeof TrendingResponseSchema>;
export type PostData = NonNullable<TrendingResponse["data"]>[number];
export type Community = v.InferOutput<typeof CommunitySchema>;
export type CommunitiesResponse = v.InferOutput<typeof CommunitiesResponseSchema>;
