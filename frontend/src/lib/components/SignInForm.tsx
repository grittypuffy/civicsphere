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

const SignInForm = ({ ToastMessage }: { ToastMessage: ToastFunc }) => {
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
    return false
  }
  const signInHandler = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(async () => {
      if (validateFormData()) {
        ToastMessage({ message: 'Signing In..' }, 'info');
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

        if (!res.ok) {
          ToastMessage(
            { message: 'Sign In Failed', description: 'Incorrect credentials! Try again.' },
            'error'
          );
        } else {
          ToastMessage({ message: 'Sign In Successful', description: 'Redirecting...' }, 'success');
          setTimeout(() => {
            router.push('/home');
          }, 400);
        }
        setIsLoading(false);
        return;
      }
      setIsLoading(false);
      ToastMessage(
        { message: 'Sign In Failed', description: 'Incorrect credentials! Try again.' },
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
    <div className="flex flex-col w-full max-w-md">
      <form onSubmit={signInHandler} className="flex flex-col gap-y-3 w-full items-center">
        <Field
          label="Username"
          validationState={isValidUserName ? 'success' : validMsg.username ? 'error' : 'none'}
          validationMessage={validMsg.username}
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
          className="w-full max-w-xs hover:shadow-md"
          disabled={!isPolicyAccepted || isLoading}
        >
          {isLoading ? <Spinner size="extra-small" /> : 'Submit'}
        </Button>
      </form>
    </div>
  )
}

export default SignInForm
