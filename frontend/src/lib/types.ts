import { ToastIntent, ToastPosition } from '@fluentui/react-components';
import * as v from 'valibot';
import { SignInFormSchema, SignUpFormSchema } from "./schema";

export type SignUpFormData = v.InferInput<typeof SignUpFormSchema>;
export type SignInFormData = v.InferInput<typeof SignInFormSchema>;

export type ValidationState = 'error' | 'warning' | 'success' | 'none';
export type ToastFunc = ({ message, description }: {
  message: string;
  description?: string | undefined;
}, intent: ToastIntent, position?: ToastPosition) => void

export type UserPreferencesUpdateReq = {
  location: string | null;
  language: string | null;
  interests: string[] | null;
  profession: string | null;
}

export type UserPreferencesReq = {
  location: string;
  language: LangCode | "en";
  interests: string[];
  profession: string;
}
export type LangCode = 'ar' | 'bn' | 'de' | 'el' | 'en' | 'es' | 'fr' | 'hi' | 'ht' | 'it' | 'ja' | 'ko' | 'pl' | 'pa' | 'pt' | 'ru' | 'tl' | 'ur' | 'yi' | 'zh';
export type Language = {
  code: LangCode;
  name: string;
}
