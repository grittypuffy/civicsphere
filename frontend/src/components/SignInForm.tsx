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
import { useTranslations } from 'next-intl';

const SignInForm = ({ ToastMessage }: { ToastMessage: ToastFunc }) => {
  const t = useTranslations('signin_form');
  const router = useRouter();
  const [formData, setFormData] = useState<SignInFormData>({
    username: '',
    password: '',
  });

  const [validMsg, setValidMsg] = useState<{ [key: string]: string }>({
    username: '',
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
        title={t('form.showPassword')}
      />
    ) : (
      <EyeOffRegular
        className="cursor-pointer"
        onClick={() => setShowPassword(!showPassword)}
        title={t('form.hidePassword')}
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
          message: t('toast.signInFailed'),
          description: t('toast.invalidData'),
        },
        'error'
      );
      return;
    }

    setTimeout(async () => {
      ToastMessage({ message: t('toast.signingIn'), description: '' }, 'info');
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
              { message: t('toast.signInSuccessful'), description: t('toast.redirecting') },
              'success'
            );
            setUserName(formData.username)
            setTimeout(() => {
              router.push('/u/home');
            }, 200);
            break;
          case 422:
            ToastMessage(
              { message: t('toast.invalidCredentialsTitle'), description: t('toast.invalidCredentialsDesc') },
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
          { message: t('toast.signInFailed'), description: t('toast.tryLater') },
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
        aria-label={t('aria.formLabel')}
        noValidate
      >
        <Field
          label={t('form.usernameLabel')}
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
            aria-label={t('form.usernameAria')}
            aria-describedby={validMsg.username ? 'username-error' : undefined}
            aria-invalid={validMsg.username ? 'true' : 'false'}
            required
            autoComplete="username"
          />
        </Field>
        <Field
          label={t('form.passwordLabel')}
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
            aria-label={t('form.passwordAria')}
            aria-describedby={validMsg.password ? 'password-error' : undefined}
            aria-invalid={validMsg.password ? 'true' : 'false'}
            required
            autoComplete="current-password"
          />
        </Field>
        <Button
          type="submit"
          aria-label={isLoading ? t('aria.signingIn') : t('form.signIn')}
          className="w-full max-w-xs hover:shadow-md btn-primary"
          disabled={isLoading || !formData.username || !formData.password}
          aria-describedby={isLoading ? "loading-spinner" : undefined}
        >
          {isLoading ? <Spinner size="extra-small" aria-label={t('aria.loading')} id="loading-spinner" /> : t('form.signIn')}
        </Button>
      </form>
    </div>
  )
}

export default SignInForm;
