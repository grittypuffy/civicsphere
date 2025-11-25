'use client'
import { SignInFormSchema } from '@/lib/schema';
import { userNameAtom } from '@/lib/store';
import { SignInFormData, ToastFunc } from "@/lib/types";
import type {
  InputOnChangeData
} from '@fluentui/react-components';
import {
  Button,
  Field,
  Input,
  Spinner
} from '@fluentui/react-components';
import { EyeOffRegular, EyeRegular } from '@fluentui/react-icons';
import { useSetAtom } from 'jotai';
import { useRouter } from 'next/navigation';
import { useState } from "react";
import * as v from 'valibot';

const SignInForm = ({ ToastMessage }: { ToastMessage: ToastFunc }) => {
  const router = useRouter();
  const [formData, setFormData] = useState<SignInFormData>({
    username: '',
    password: '',
  });

  const [validMsg, setValidMsg] = useState<{ [key: string]: string }>({
    name: '',
    email: '',
    password: '',
  });

  const setUserName = useSetAtom(userNameAtom)

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const EyeToggleButton = (showPassword: boolean) => {
    return !showPassword ? (
      <EyeRegular
        className="cursor-pointer"
        onClick={() => setShowPassword(!showPassword)}
        title="Hide Password"
      />
    ) : (
      <EyeOffRegular
        className="cursor-pointer"
        onClick={() => setShowPassword(!showPassword)}
        title="Show Password"
      />
    );
  };

  const validateFormData = () => {
    const res = v.safeParse(SignInFormSchema, formData);
    const newValidMsg: { [key: string]: string } = {
      username: '',
      password: '',
    };

    if (!res.success) {
      res.issues.forEach((issue) => {
        if (issue.path) {
          issue.path.forEach((path) => {
            const key = path.key as string;
            if (newValidMsg.hasOwnProperty(key)) {
              newValidMsg[key] = issue.message;
            }
          });
        }
      });
    }
    setValidMsg((prev) => ({
      ...prev,
      ...newValidMsg,
    }));
    return res.success;
  };

  const signInHandler = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!validateFormData()) {
      setIsLoading(false);
      ToastMessage(
        {
          message: 'Sign In Failed',
          description: 'Invalid data! Please check your input and try again.',
        },
        'error'
      );
      return;
    }

    setTimeout(async () => {
      ToastMessage({ message: 'Signing In..', description: '' }, 'info');
      try {
        const res: Response = await fetch('/api/v1/auth/sign_in', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: formData.username,
            password: formData.password,
          }),
          credentials: 'include',
        });

        switch (res.status) {
          case 200:
            ToastMessage(
              { message: 'Sign In Successful', description: 'Redirecting...' },
              'success'
            );
            setUserName(formData.username)
            setTimeout(() => {
              router.push('/u/home');
            }, 200);
            break;
          case 422:
            ToastMessage(
              { message: 'Invalid Credentials', description: 'Please check your username and password.' },
              'error'
            );
            break;
          default:
            if (!res.ok) {
              throw new Error('Network response was not ok');
            }
        }
      } catch (error) {
        console.error('Error during sign in:', error);
        ToastMessage(
          { message: 'Sign In Failed', description: 'Please try again later.' },
          'error'
        );
      }
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="flex flex-col w-full max-w-md">
      <form
        onSubmit={signInHandler}
        className="flex flex-col gap-y-3 w-full items-center"
        role="form"
        aria-label="Sign in form"
        noValidate
      >
        <Field
          label="Username"
          validationMessage={validMsg.username}
          validationState={validMsg.username ? 'error' : 'none'}
          className="w-full"
        >
          <Input
            type="text"
            value={formData.username}
            appearance="underline"
            onChange={(_: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => {
              setFormData((prev) => ({ ...prev, username: data.value }));
            }}
            disabled={isLoading}
            className="w-full"
            style={{ minWidth: '200px' }}
            aria-label='Username'
            aria-describedby={validMsg.username ? 'username-error' : undefined}
            aria-invalid={validMsg.username ? 'true' : 'false'}
            required
            autoComplete="username"
          />
        </Field>
        <Field
          label="Password"
          validationState={validMsg.password ? 'error' : 'none'}
          validationMessage={validMsg.password}
          className="w-full"
        >
          <Input
            type={showPassword ? 'text' : 'password'}
            contentAfter={EyeToggleButton(showPassword)}
            value={formData.password}
            appearance="underline"
            onChange={(_: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => {
              setFormData((prev) => ({ ...prev, password: data.value }));
            }}
            disabled={isLoading}
            className="w-full"
            style={{ minWidth: '200px' }}
            aria-label='Password'
            aria-describedby={validMsg.password ? 'password-error' : undefined}
            aria-invalid={validMsg.password ? 'true' : 'false'}
            required
            autoComplete="current-password"
          />
        </Field>
        <Button
          type="submit"
          aria-label={isLoading ? "Signing in, please wait" : "Sign in"}
          className="w-full max-w-xs hover:shadow-md btn-primary"
          disabled={isLoading || !formData.username || !formData.password}
          aria-describedby={isLoading ? "loading-spinner" : undefined}
        >
          {isLoading ? <Spinner size="extra-small" aria-label="Loading" id="loading-spinner" /> : 'Sign In'}
        </Button>
      </form>
    </div>
  )
}

export default SignInForm
