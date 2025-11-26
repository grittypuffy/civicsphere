import * as v from 'valibot';
import {
  emailValidator,
  langCodeValidator,
  nameValidator,
  passwordValidator,
  requiredStringValidator,
  roleValidator,
  statusValidator,
  usernameValidator,
  verifiedValidator,
} from './validators';

// Form schemas
export const SignUpFormSchema = v.object({
  full_name: v.pipe(
    nameValidator,
    v.regex(/^[A-Za-z ]+$/, "Full name must contain only alphabets as characters"),
  ),
  username: usernameValidator,
  email: emailValidator,
  password: passwordValidator,
});

export const SignInFormSchema = v.object({
  username: usernameValidator,
  password: passwordValidator,
});

export const OnboardFormSchema = v.object({
  location: requiredStringValidator,
  language: v.optional(langCodeValidator),
  interests: v.pipe(
    v.array(v.string()),
    v.minLength(1, 'At least one interest is required'),
  ),
  profession: requiredStringValidator,
});

// API request schemas
export const SignUpRequestSchema = v.object({
  username: usernameValidator,
  full_name: v.pipe(
    nameValidator,
    v.regex(/^[A-Za-z ]+$/, "Full name must contain only alphabets as characters"),
  ),
  email: emailValidator,
  password: passwordValidator,
  role: v.optional(roleValidator),
});

export const SignInRequestSchema = v.object({
  username: usernameValidator,
  password: passwordValidator,
});

export const ChatRequestSchema = v.object({
  prompt: requiredStringValidator,
});

export const CreateIssueRequestSchema = v.object({
  title: v.string(),
  description: v.string(),
  status: v.optional(statusValidator),
});

export const UserPreferencesRequestSchema = v.object({
  location: requiredStringValidator,
  address: v.string(),
  language: v.optional(v.string()),
  interests: v.array(v.string()),
  profession: requiredStringValidator,
});

export const UserPreferencesUpdateRequestSchema = v.object({
  location: v.optional(v.nullable(v.string())),
  address: v.optional(v.nullable(v.string())),
  language: v.optional(v.nullable(v.string())),
  interests: v.optional(v.nullable(v.array(v.string()))),
  profession: v.optional(v.nullable(v.string())),
});

export const CreatePostRequestSchema = v.object({
  files: v.optional(v.nullable(v.array(v.string()))),
  tags: v.array(v.string()),
});

// Response schemas
export const AuthResponseSchema = v.object({
  success: v.boolean(),
  message: v.string(),
});

export const ChatDataSchema = v.object({
  role: v.picklist(['user', 'assistant', 'system']),
  content: v.string(),
});

export const ChatResponseSchema = v.object({
  success: v.boolean(),
  message: v.string(),
  data: v.optional(v.nullable(ChatDataSchema)),
});

export const ValidationErrorSchema = v.object({
  loc: v.array(v.union([v.string(), v.number()])),
  msg: v.string(),
  type: v.string(),
});

export const HTTPValidationErrorSchema = v.object({
  detail: v.optional(v.array(ValidationErrorSchema)),
});

export const IssueSchema = v.object({
  community_id: v.string(),
  issue_id: v.string(),
  user_id: v.string(),
  title: v.string(),
  description: v.string(),
  upvote: v.number(),
  status: statusValidator,
  created_at: v.string(),
});

export const IssueResponseSchema = v.object({
  community_id: v.string(),
  issue_id: v.string(),
  user_id: v.string(),
  title: v.string(),
  description: v.string(),
  upvote: v.number(),
  status: statusValidator,
  created_at: v.string(),
});

export const IssueResponseSingleSchema = v.object({
  success: v.boolean(),
  message: v.string(),
  data: v.optional(v.nullable(IssueSchema)),
});

export const IssueResponseMultipleSchema = v.object({
  success: v.boolean(),
  message: v.string(),
  data: v.optional(v.nullable(v.array(IssueSchema))),
});

export const PostResponseSchema = v.object({
  community_id: v.string(),
  post_id: v.string(),
  user_id: v.string(),
  tags: v.array(v.string()),
  upvote: v.number(),
  downvote: v.number(),
  title: v.string(),
  description: v.string(),
  url: v.array(v.string()),
  lang: v.string(),
  location: v.string(),
  verified: verifiedValidator,
  flagged: v.boolean(),
  created_at: v.string(),
});

export const TagCountSchema = v.object({
  tag: v.string(),
  count: v.number(),
});

export const TagAnalyticsSchema = v.object({
  success: v.boolean(),
  message: v.string(),
  data: v.optional(v.nullable(v.array(TagCountSchema))),
});

export const TagResponseSchema = v.object({
  success: v.boolean(),
  message: v.string(),
  tags: v.optional(v.nullable(v.record(v.string(), v.string()))),
});

export const TrendingResponseSchema = v.object({
  success: v.boolean(),
  message: v.string(),
  data: v.optional(v.nullable(v.array(PostResponseSchema))),
});

export const UserSchema = v.object({
  user_id: v.string(),
  username: v.string(),
  email: v.string(),
  full_name: v.string(),
  role: v.optional(roleValidator),
});

export const UserPreferencesSchema = v.object({
  location: v.string(),
  language: v.optional(v.string()),
  interests: v.array(v.string()),
  address: v.string(),
  profession: v.string(),
});

export const UserDataModelSchema = v.object({
  user: UserSchema,
  preferences: UserPreferencesSchema,
});

export const UserDataResponseSchema = v.object({
  success: v.boolean(),
  message: v.string(),
  data: v.optional(v.nullable(UserDataModelSchema)),
});

export const UserIssuesResponseSchema = v.object({
  success: v.boolean(),
  message: v.string(),
  data: v.optional(v.nullable(v.array(IssueSchema))),
});

export const UserPostsResponseSchema = v.object({
  success: v.boolean(),
  message: v.string(),
  data: v.optional(v.nullable(v.array(PostResponseSchema))),
});

export const UserPreferencesResponseSchema = v.object({
  success: v.boolean(),
  message: v.string(),
});

export const GetPreferencesResponseSchema = v.object({
  success: v.boolean(),
  message: v.string(),
  data: v.optional(v.nullable(UserPreferencesSchema)),
});

export const UserReactionsResponseSchema = v.object({
  success: v.boolean(),
  message: v.string(),
  data: v.optional(v.nullable(v.array(v.string()))),
});

export const LanguageSchema = v.object({
  code: langCodeValidator,
  name: v.string(),
});
export const CommunitySchema = v.object({
  _id: v.string(),
  community_name: v.string(),
});

export const CommunitiesResponseSchema = v.object({
  success: v.boolean(),
  message: v.string(),
  data: v.optional(v.nullable(v.array(CommunitySchema))),
});
