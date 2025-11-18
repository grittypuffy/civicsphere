import { ToastIntent, ToastPosition } from '@fluentui/react-components';
import * as v from 'valibot';
import { SignInFormSchema, SignUpFormSchema } from "./schema";

export type SignUpFormData = v.InferInput<typeof SignUpFormSchema>;
export type SignInFormData = v.InferInput<typeof SignInFormSchema>;

export type ToastFunc = ({ message, description }: {
  message: string;
  description?: string | undefined;
}, intent: ToastIntent, position?: ToastPosition) => void
