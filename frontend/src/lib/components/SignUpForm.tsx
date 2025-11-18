'use client'
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
import { SignUpFormData, ToastFunc } from "../types";

const SignUpForm = ({ ToastMessage }: { ToastMessage: ToastFunc }) => {
  const router = useRouter();
  const [formData, setFormData] = useState<SignUpFormData>({
    username: '',
    email: '',
    password: '',
    full_name: '',
  });

  const [validMsg, setValidMsg] = useState<{ [key: string]: string }>({
    name: '',
    email: '',
    password: '',
  });

  const [isValidUserName, setIsValidUserName] = useState(false);
  const [isPolicyAccepted, setIsPolicyAccepted] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
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

  const resetFormData = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      full_name: '',
    });
    setValidMsg({
      username: '',
      email: '',
      password: '',
      full_name: '',
    });
  };

  const resetValidMsg = () => {
    setValidMsg({
      username: '',
      email: '',
      password: '',
      full_name: '',
    });
  };


  const validateFormData = (): boolean => {
    return true
  }

  const signUpHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(async () => {
      if (validateFormData()) {
        ToastMessage({ message: 'Signing Up..', description: '' }, 'info');
        const res: Response = await fetch('/api/v1/auth/sign_up', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (!res.ok) {
          ToastMessage(
            { message: 'Sign Up Failed', description: 'Incorrect credentials! Try again.' },
            'error'
          );
        } else {
          ToastMessage({ message: 'Sign Up Successful', description: 'Redirecting...' }, 'success');
          const res: Response = await fetch('/api/v1/auth/sign_in', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username: formData.username, password: formData.password }),
            credentials: 'include'
          });
        }
        setIsLoading(false);
        return;
      }
      setIsLoading(false);
      ToastMessage(
        {
          message: 'Sign Up Failed',
          description: 'Improper data! Please follow the format specified',
        },
        'error'
      );
    }, 500);
  };

  const validateUserName = () => {
    setIsChecking(true);
    if (isValidUserName) {
      setTimeout(() => {
        setIsValidUserName(false);
        setIsChecking(false);
      }, 300);
    } else {
      setTimeout(async () => {
        const res: Response = await fetch(`/api/auth/validate?username=${formData.username}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) {
          ToastMessage(
            { message: 'Username is already taken', description: 'Please choose another one.' },
            'error'
          );
          setValidMsg((prev) => ({ ...prev, username: 'Username is already taken' }));
          setIsChecking(false);
          return;
        }
        setValidMsg((prev) => ({
          ...prev,
          username: `Username "${formData.username}" is available`,
        }));
        setIsValidUserName(true);
        setIsChecking(false);
      }, 500);
    }
  };

  return (
    <>
      <form
        onSubmit={validateUserName}
        className="flex flex-col gap-3 w-full max-w-xl items-center"
      >
        <Field
          label="Username"
          validationState={isValidUserName ? 'success' : validMsg.username ? 'error' : 'none'}
          validationMessage={validMsg.username}
          className="w-full"
        >
          <Input
            value={formData.username}
            appearance="underline"
            onChange={(_: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => {
              setFormData((prev) => ({ ...prev, username: data.value }));
            }}
            disabled={isValidUserName}
            className="w-full"
            style={{ minWidth: '200px' }}
          />
        </Field>
        <Button
          type="submit"
          className="w-full max-w-xs hover:shadow-md"
          onClick={validateUserName}
          disabled={!formData.username.length || isChecking}
        >
          {isChecking ? (
            <Spinner size="extra-small" />
          ) : isValidUserName ? (
            'Change Username'
          ) : (
            'Check Username'
          )}
        </Button>
      </form>
      {isValidUserName && (
        <form onSubmit={signUpHandler} className="flex flex-col gap-3 w-full max-w-md">
          <Field
            label="Full Name"
            validationState={validMsg.full_name ? 'error' : 'none'}
            validationMessage={validMsg.full_name}
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
            />
          </Field>
          <Field
            label="Email"
            validationState={validMsg.email ? 'error' : 'none'}
            validationMessage={validMsg.email}
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
          />
          <Button
            type="submit"
            className="w-full mx-auto hover:shadow-md"
            disabled={!isPolicyAccepted || isLoading}
          >
            {isLoading ? <Spinner size="extra-small" /> : 'Submit'}
          </Button>
        </form>
      )}
    </>
  )
}

export default SignUpForm
