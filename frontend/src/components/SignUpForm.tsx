'use client'
import { SignUpFormSchema } from '@/lib/schema';
import { SignUpFormData, ToastFunc, ValidationState } from "@/lib/types";
import type {
  CheckboxOnChangeData,
  InputOnChangeData
} from '@fluentui/react-components';
import {
  Button,
  Checkbox,
  Field,
  Input,
  Spinner
} from '@fluentui/react-components';
import { EyeOffRegular, EyeRegular } from '@fluentui/react-icons';
import { useRouter } from 'next/navigation';
import { useState } from "react";
import * as v from 'valibot';
import { useTranslations } from 'next-intl';

const SignUpForm = ({ ToastMessage }: { ToastMessage: ToastFunc }) => {
  const t = useTranslations('signup_form');
  const router = useRouter();
  const [formData, setFormData] = useState<SignUpFormData>({
    username: '',
    email: '',
    password: '',
    full_name: '',
  });

  const [validation, setMessage] = useState<{ [key: string]: string, state: ValidationState }>({
    username: '',
    email: '',
    password: '',
    full_name: '',
    state: 'none',
  });

  const [prevUserName, setPrevUserName] = useState<string>('');
  const [isValidUserName, setIsValidUserName] = useState(false);
  const [isPolicyAccepted, setIsPolicyAccepted] = useState(false);
  const [isCheckingUserName, setCheckingUserName] = useState(false);
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
    const res = v.safeParse(SignUpFormSchema, formData);
    const newValidMsg: { [key: string]: string } = {
      username: '',
      email: '',
      password: '',
      full_name: '',
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
    setMessage((prev) => ({
      ...prev,
      ...newValidMsg,
      username: !isValidUserName ? newValidMsg.username : prev.username,
    }));
    return res.success;
  };

  const signUpHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!validateFormData()) {
      setIsLoading(false);
      ToastMessage(
        {
          message: t('toast.signUpFailed'),
          description: t('toast.improperData'),
        },
        'error'
      );
      return;
    }

    setTimeout(async () => {
      try {
        const res: Response = await fetch('/api/v1/auth/sign_up', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        switch (res.status) {
          case 200:
            ToastMessage(
              { message: t('toast.signUpSuccessful'), description: t('toast.canSignIn') },
              'success'
            );
            const signInRes: Response = await fetch('/api/v1/auth/sign_in', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                username: formData.username,
                password: formData.password
              }),
            });
            if (signInRes.ok) {
              router.push('/auth?action=onboard');
              break;
            }
            break;
          case 409:
            ToastMessage(
              { message: t('toast.signUpFailed'), description: t('toast.exists') },
              'error'
            );
            break;
          case 422:
            ToastMessage(
              { message: t('toast.signUpFailed'), description: t('toast.invalidData422') },
              'error'
            );
            break;
          default:
            throw new Error('Network response was not ok');
        }
      } catch (error) {
        console.error('Error during sign up:', error);
        ToastMessage(
          { message: t('toast.signUpFailed'), description: t('toast.tryLater') },
          'error'
        );
      }
      setIsLoading(false);
    }, 500);
  };

  const checkUserName = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckingUserName(true);

    if (isValidUserName) {
      setTimeout(() => {
        setIsValidUserName(false);
        setCheckingUserName(false);
        setPrevUserName(formData.username);
        setMessage((prev) => ({ ...prev, username: '' }));
      }, 300);
      return;
    }

    const res = v.safeParse(SignUpFormSchema.entries.username, formData.username);
    if (res.issues) {
      setCheckingUserName(false);
      setMessage((prev) => ({
        ...prev,
        username: res.issues[0]?.message || t('toast.invalidUsername'),
      }));
      return;
    }

    setTimeout(async () => {
      try {
        const res: Response = await fetch(`/api/v1/auth/${formData.username}/valid`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        switch (res.status) {
          case 200:
            ToastMessage(
              {
                message: t('toast.usernameAvailable', { username: formData.username }),
                description: t('toast.usernameAvailableDesc'),
              },
              'success'
            );
            setMessage((prev) => ({
              ...prev,
              username: t('toast.usernameAvailable', { username: formData.username }),
            }));
            setIsValidUserName(true);
            break;
          case 409:
            ToastMessage(
              { message: t('toast.usernameUnavailable'), description: t('toast.chooseDifferent') },
              'error'
            );
            break;
          case 422:
            ToastMessage(
              {
                message: t('toast.invalidUsername'),
                description: t('toast.followFormat')
              },
              'error'
            );
            setMessage((prev) => ({
              ...prev,
              username: t('toast.invalidUsername')
            }));
            break;
          default:
            if (!res.ok) {
              throw new Error('Network response was not ok');
            }
        }
      } catch (error) {
        console.error('Error validating username:', error);
        ToastMessage(
          { message: t('toast.usernameValidationError'), description: t('toast.tryLater') },
          'error'
        );
      }
      setCheckingUserName(false);
    }, 500);
  };

  return (
    <>
      <form
        onSubmit={checkUserName}
        className="flex flex-col gap-3 w-full max-w-xl items-center"
        aria-label={t('aria.usernameValidationForm')}
      >
        <Field
          label={t('form.usernameLabel')}
          validationState={isValidUserName ? 'success' : validation.username ? 'error' : 'none'}
          validationMessage={validation.username}
          className="w-full"
        >
          <Input
            value={formData.username}
            appearance="underline"
            onChange={(_: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => {
              setFormData((prev) => ({ ...prev, username: data.value.trim() }));
            }}
            disabled={isValidUserName}
            className="w-full"
            style={{ minWidth: '200px' }}
            aria-describedby={validation.username ? 'username-error' : isValidUserName ? 'username-success' : undefined}
            aria-invalid={validation.username ? 'true' : 'false'}
            autoComplete="username"
            required
          />
        </Field>
        <Button
          type="submit"
          className="w-full max-w-xs hover:shadow-md btn-primary"
          onClick={checkUserName}
          disabled={!formData.username.length || isCheckingUserName || prevUserName === formData.username ? true : isLoading}
          aria-label={isValidUserName ? t('form.changeUsername') : t('form.checkUsername')}
        >
          {isCheckingUserName ? (
            <Spinner size="extra-small" aria-label={t('aria.checkingUsername')} />
          ) : isValidUserName ? (
            t('form.changeUsername')
          ) : (
            t('form.checkUsername')
          )}
        </Button>
      </form>
      {isValidUserName && (
        <form
          onSubmit={signUpHandler}
          className="flex flex-col gap-3 w-full max-w-md"
          aria-label={t('aria.signUpForm')}
        >
          <Field
            label={t('form.fullNameLabel')}
            validationState={validation.state}
            validationMessage={validation.full_name}
            className="w-full"
          >
            <Input
              value={formData.full_name}
              appearance="underline"
              onChange={(_: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => {
                setFormData((prev) => ({ ...prev, full_name: data.value }));
              }}
              disabled={isLoading}
              className="w-full"
              style={{ minWidth: '200px' }}
              aria-describedby={validation.full_name ? 'fullname-error' : undefined}
              aria-invalid={validation.full_name ? 'true' : 'false'}
              autoComplete="name"
              required
            />
          </Field>
          <Field
            label={t('form.emailLabel')}
            validationState={validation.state}
            validationMessage={validation.email}
            className="w-full"
          >
            <Input
              type="email"
              value={formData.email}
              appearance="underline"
              onChange={(_: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => {
                setFormData((prev) => ({ ...prev, email: data.value }));
              }}
              disabled={isLoading}
              className="w-full"
              style={{ minWidth: '200px' }}
              aria-describedby={validation.email ? 'email-error' : undefined}
              aria-invalid={validation.email ? 'true' : 'false'}
              autoComplete="email"
              required
            />
          </Field>
          <Field
            label={t('form.passwordLabel')}
            validationState={validation.state}
            validationMessage={validation.password}
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
              aria-describedby={validation.password ? 'password-error' : undefined}
              aria-invalid={validation.password ? 'true' : 'false'}
              autoComplete="new-password"
              required
            />
          </Field>
          <Checkbox
            label={t('form.cookieLabel')}
            labelPosition="after"
            onChange={(_: React.ChangeEvent<HTMLInputElement>, data: CheckboxOnChangeData) => {
              if (data.checked) {
                setIsPolicyAccepted(true);
              } else {
                setIsPolicyAccepted(false);
              }
            }}
            required
            aria-describedby="cookie-policy-description"
          />
          <div id="cookie-policy-description" className="sr-only">
            {t('form.cookieDesc')}
          </div>
          <Button
            type="submit"
            className="w-full mx-auto hover:shadow-md btn-primary"
            disabled={!isPolicyAccepted || isLoading}
            aria-label={t('form.submit')}
          >
            {isLoading ? <Spinner size="extra-small" aria-label={t('aria.creatingAccount')} /> : t('form.submit')}
          </Button>
        </form>
      )}
    </>
  )
}

export default SignUpForm
