"use client";
import LocaleSwitcher from '@/components/LocaleSwitcher';
import OnboardForm from '@/components/OnboardForm';
import SignInForm from '@/components/SignInForm';
import SignUpForm from '@/components/SignUpForm';
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
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

const AuthForm = () => {
  const searchParams = useSearchParams();
  const initialFormType =
    searchParams.get('action') === 'signin'
      ? 'signin'
      : searchParams.get('action') === 'onboard'
        ? 'onboard'
        : 'signup';
  const [formType, setFormType] = useState<TabValue | 'onboard'>(initialFormType);

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
    <>
      <LocaleSwitcher variant="standalone" />
      <div className="min-h-screen flex items-center justify-center bg-page">
        <div className="mx-auto w-full max-w-3xl p-6 surround card">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-full md:w-1/2 px-4 py-6">
              <h2 className="text-2xl font-semibold text-ui-heading">Welcome to CivicSphere</h2>
              <p className="mt-2 text-ui-muted">Join your community — discover, discuss and act.</p>
              <div className="mt-6">
                <Toaster toasterId={toasterId} />
              </div>
            </div>

            <div className="w-full md:w-1/2 px-4 py-6 bg-light-brand rounded-md">
              <div className="mb-4">
                {formType === 'onboard' ? (
                  <h3 className="text-xl font-semibold text-ui-heading mb-2">Complete Your Onboarding</h3>
                ) : (
                  <>
                    <h3 className="text-xl font-semibold text-ui-heading mb-2">
                      {formType === 'signup' ? 'Create Your Account' : 'Welcome Back'}
                    </h3>
                    <TabList selectedValue={formType} onTabSelect={onTabHandler} className="w-full">
                      <Tab value={`signup`} className="text-ui-heading">Sign Up</Tab>
                      <Tab value={`signin`} className="text-ui-heading">Sign In</Tab>
                    </TabList>
                  </>
                )}
              </div>

              <div className="flex flex-col w-full p-2 items-center gap-y-4">
                {(() => {
                  switch (formType) {
                    case 'onboard':
                      return <OnboardForm ToastMessage={ToastMessage} />;
                    case 'signup':
                      return <SignUpForm ToastMessage={ToastMessage} />;
                    default:
                      return <SignInForm ToastMessage={ToastMessage} />;
                  }
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const AuthPage = () => {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-page text-ui-muted">Loading...</div>}>
      <AuthForm />
    </Suspense>
  );
};

export default AuthPage;
