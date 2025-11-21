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
import Router from 'next/router';
import { useState } from "react";
import * as v from 'valibot';

const SignUpForm = ({ ToastMessage }: { ToastMessage: ToastFunc }) => {
  const [formData, setFormData] = useState<SignUpFormData>({
    username: '',
    email: '',
    password: '',
    full_name: '',
  });

  const [validation, setMessage] = useState<{ [key: string]: string, state: ValidationState }>({
    name: '',
    email: '',
    password: '',
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
          message: 'Sign Up Failed',
          description: 'Improper data! Please follow the format specified',
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
              { message: 'Sign Up Successful', description: 'You can now sign in.' },
              'success'
            );
            Router.push('/auth?action=onboard');
            break;
          case 409:
            ToastMessage(
              { message: 'Sign Up Failed', description: 'Username or Email already exists.' },
              'error'
            );
            break;
          case 422:
            ToastMessage(
              { message: 'Sign Up Failed', description: 'Invalid data! Please check your input and try again.', },
              'error'
            );
            break;
          default:
            if (!res.ok) {
              throw new Error('Network response was not ok');
            }
        }
      } catch (error) {
        console.error('Error during sign up:', error);
        ToastMessage(
          { message: 'Sign Up Failed', description: 'Please try again later.' },
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
        username: res.issues[0]?.message || 'Invalid Username',
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
                message: `Username "${formData.username}" is available`,
                description: 'You can proceed with this username.',
              },
              'success'
            );
            setMessage((prev) => ({
              ...prev,
              username: `Username "${formData.username}" is available`,
            }));
            setIsValidUserName(true);
            break;
          case 409:
            ToastMessage(
              { message: 'Username Unavailable', description: 'Please choose a different username.' },
              'error'
            );
            break;
          case 422:
            ToastMessage(
              {
                message: 'Invalid Username',
                description: 'Please follow the username format.'
              },
              'error'
            );
            setMessage((prev) => ({
              ...prev,
              username: 'Invalid Username'
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
          { message: 'Error validating username', description: 'Please try again later.' },
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
        aria-label="Username validation form"
      >
        <Field
          label="Username"
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
          className="w-full max-w-xs hover:shadow-md"
          onClick={checkUserName}
          disabled={!formData.username.length || isCheckingUserName || prevUserName === formData.username ? true : isLoading}
          aria-label={isValidUserName ? 'Change username' : 'Check username availability'}
        >
          {isCheckingUserName ? (
            <Spinner size="extra-small" aria-label="Checking username availability" />
          ) : isValidUserName ? (
            'Change Username'
          ) : (
            'Check Username'
          )}
        </Button>
      </form>
      {isValidUserName && (
        <form
          onSubmit={signUpHandler}
          className="flex flex-col gap-3 w-full max-w-md"
          aria-label="Sign up form"
        >
          <Field
            label="Full Name"
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
            label="Email"
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
            label="Password"
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
            label="This website requires cookies to function properly. I accept third-party cookies."
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
            You must accept the cookie policy to create an account
          </div>
          <Button
            type="submit"
            className="w-full mx-auto hover:shadow-md"
            disabled={!isPolicyAccepted || isLoading}
            aria-label="Submit sign up form"
          >
            {isLoading ? <Spinner size="extra-small" aria-label="Creating account" /> : 'Submit'}
          </Button>
        </form>
      )}
    </>
  )
}

export default SignUpForm
