'use client';
import SignInForm from '@/lib/components/SignInForm';
import SignUpForm from '@/lib/components/SignUpForm';
import type {
  SelectTabData,
  SelectTabEvent,
  TabValue
} from '@fluentui/react-components';
import {
  Tab,
  TabList,
  Toast,
  ToastBody,
  Toaster,
  ToastIntent,
  ToastPosition,
  ToastTitle,
  useId,
  useToastController
} from '@fluentui/react-components';
import { useState } from 'react';

export default function AuthForm() {
  const [formType, setFormType] = useState<TabValue>('signup');

  const onTabHandler = (_: SelectTabEvent, data: SelectTabData) => {
    setFormType(data.value);
  };

  const toasterId = useId('toaster-id');
  const { dispatchToast } = useToastController(toasterId);
  const ToastMessage = (
    { message, description }: { message: string; description?: string | undefined },
    intent: ToastIntent,
    position: ToastPosition = 'top'
  ) => {
    dispatchToast(
      <>
        <Toast>
          <ToastTitle className="font-bold">{message}</ToastTitle>
          <ToastBody className="text-sm">{description}</ToastBody>
        </Toast>
      </>,
      {
        intent,
        position,
      }
    );
  };

  return (
    <div className='mx-auto max-w-5xl p-4 border min-h-screen flex flex-col justify-center items-center gap-3 md:gap-5 lg:gap-8'>
      <div className="flex flex-col gap-5 items-center lg:justify-center surround w-full lg:w-3/8">
        <Toaster toasterId={toasterId} />
        <div>
          <TabList selectedValue={formType} onTabSelect={onTabHandler}>
            <Tab value={`signup`}>Sign Up</Tab>
            <Tab value={`signin`}>Sign In</Tab>
          </TabList>
        </div>
        <div
          className="flex flex-col w-full p-6 items-center gap-y-5"
        >
          {formType === 'signup' ? (
            <SignUpForm ToastMessage={ToastMessage} />
          ) : (
            <SignInForm ToastMessage={ToastMessage} />
          )}
        </div>
      </div>
    </div>
  );
}
