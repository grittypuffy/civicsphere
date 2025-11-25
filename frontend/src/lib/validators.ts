import * as v from 'valibot';

export const emailValidator = v.pipe(
  v.string(),
  v.nonEmpty('Email is required'),
  v.email('Invalid email format'),
);

export const passwordValidator = v.pipe(
  v.string(),
  v.nonEmpty('Password is required'),
  v.minLength(8, 'Password must be at least 8 characters'),
  v.maxLength(20, 'Password must be less than 20 characters'),
);

export const nameValidator = v.pipe(
  v.string(),
  v.nonEmpty('Name shouldn\'t be empty'),
  v.maxLength(20, 'Name must be less than 20 characters'),
);

export const usernameValidator = v.pipe(
  nameValidator,
  v.excludes(' ', 'The username should not contain whitespaces'),
  v.regex(/^\w+$/, "Username must contain only alphanumeric characters"),
);

export const requiredStringValidator = v.pipe(
  v.string(),
  v.nonEmpty('This field is required'),
);

export const langCodeValidator = v.picklist(['ar', 'bn', 'de', 'el', 'en', 'es', 'fr', 'hi', 'ht', 'it', 'ja', 'ko', 'pl', 'pa', 'pt', 'ru', 'tl', 'ur', 'yi', 'zh']);

export const roleValidator = v.picklist(['User', 'Admin', 'Moderator']);

export const statusValidator = v.picklist(['Open', 'Closed', 'Resolved']);

export const verifiedValidator = v.picklist(['True', 'False', 'Not Sure', 'Uncertain']);
