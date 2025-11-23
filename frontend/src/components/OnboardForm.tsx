'use client'
import { OnboardFormSchema } from '@/lib/schema';
import { LangCode, ToastFunc, UserPreferencesRequest } from "@/lib/types";
import { langs } from "@/lib/utils";
import { Button, Dropdown, Field, Input, InputOnChangeData, Option, Spinner, Textarea } from "@fluentui/react-components";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from "react";
import * as v from 'valibot';

const OnboardForm = ({ ToastMessage }: { ToastMessage: ToastFunc }) => {
  const router = useRouter();
  const [formData, setFormData] = useState<UserPreferencesRequest>({
    location: '',
    language: 'en',
    interests: [],
    profession: '',
  });

  const [validMsg, setValidMsg] = useState<{ [key: string]: string }>({
    location: '',
    language: '',
    interests: '',
    profession: '',
  });

  const [interestsInput, setInterestsInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateFormData = () => {
    const res = v.safeParse(OnboardFormSchema, formData);
    const newValidMsg: { [key: string]: string } = {
      location: '',
      language: '',
      interests: '',
      profession: '',
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

  const handleOnboarding = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    if (!validateFormData()) {
      setIsLoading(false);
      ToastMessage(
        {
          message: 'Onboarding Failed',
          description: 'Invalid data! Please check your input and try again.',
        },
        'error'
      );
      return;
    }

    setTimeout(async () => {
      ToastMessage({ message: 'Completing Onboarding..', description: '' }, 'info');
      try {
        const res: Response = await fetch('/api/v1/user/onboarding', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
          credentials: 'include',
        });

        switch (res.status) {
          case 200:
            ToastMessage(
              { message: 'Onboarding Complete', description: 'Welcome! Redirecting to your dashboard...' },
              'success'
            );
            setTimeout(() => {
              router.push('/u/home');
            }, 400);
            break;
          case 422:
            ToastMessage(
              { message: 'Invalid Data', description: 'Please check your information and try again.' },
              'error'
            );
            break;
          default:
            if (!res.ok) {
              throw new Error('Network response was not ok');
            }
        }
      } catch (error) {
        console.error('Error during onboarding:', error);
        ToastMessage(
          { message: 'Onboarding Failed', description: 'Please try again later.' },
          'error'
        );
      }
      setIsLoading(false);
    }, 500);
  }

  const handleInterestsChange = (value: string) => {
    setInterestsInput(value);
    const interests = value.split(',').map(item => item.trim()).filter(item => item.length > 0);
    setFormData((prev) => ({ ...prev, interests }));
  };

  useEffect(() => {
    console.log(formData.language)
  }, [formData]);

  return (
    <div className="flex flex-col w-full max-w-md">
      <form
        onSubmit={handleOnboarding}
        className="flex flex-col gap-y-3 w-full items-center"
        role="form"
        aria-label="User onboarding form"
        noValidate
      >
        <Field
          label="Location"
          validationMessage={validMsg.location}
          validationState={validMsg.location ? 'error' : 'none'}
          className="w-full"
        >
          <Input
            type="text"
            value={formData.location}
            appearance="underline"
            onChange={(_: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => {
              setFormData((prev) => ({ ...prev, location: data.value }));
            }}
            disabled={isLoading}
            className="w-full"
            style={{ minWidth: '200px' }}
            aria-label='Location'
            aria-describedby={validMsg.location ? 'location-error' : undefined}
            aria-invalid={validMsg.location ? 'true' : 'false'}
            required
            autoComplete="address-level2"
          />
        </Field>

        <Field
          label="Language"
          validationMessage={validMsg.language}
          validationState={validMsg.language ? 'error' : 'none'}
          className="w-full"
        >
          <Dropdown
            onOptionSelect={(_, data) => {
              setFormData((prev) => ({ ...prev, language: (data.optionValue as LangCode) || 'en' }));
            }}
            disabled={isLoading}
            className="w-full"
            placeholder="Select your preferred language"
            aria-label='Language'
            aria-describedby={validMsg.language ? 'language-error' : undefined}
            aria-invalid={validMsg.language ? 'true' : 'false'}
          >
            {langs.map((lang, i) => (
              <Option key={i} text={lang.name} value={lang.code}>
                {lang.name}
              </Option>
            ))}
          </Dropdown>
        </Field>

        <Field
          label="Interests (comma separated)"
          validationMessage={validMsg.interests}
          validationState={validMsg.interests ? 'error' : 'none'}
          className="w-full"
        >
          <Textarea
            value={interestsInput}
            appearance="outline"
            onChange={(_: React.ChangeEvent<HTMLTextAreaElement>, data) => {
              handleInterestsChange(data.value);
            }}
            disabled={isLoading}
            className="w-full"
            style={{ minWidth: '200px' }}
            aria-label='Interests'
            aria-describedby={validMsg.interests ? 'interests-error' : undefined}
            aria-invalid={validMsg.interests ? 'true' : 'false'}
            placeholder="e.g., technology, music, sports"
            rows={3}
          />
        </Field>

        <Field
          label="Profession"
          validationMessage={validMsg.profession}
          validationState={validMsg.profession ? 'error' : 'none'}
          className="w-full"
        >
          <Input
            type="text"
            value={formData.profession}
            appearance="underline"
            onChange={(_: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => {
              setFormData((prev) => ({ ...prev, profession: data.value }));
            }}
            disabled={isLoading}
            className="w-full"
            style={{ minWidth: '200px' }}
            aria-label='Profession'
            aria-describedby={validMsg.profession ? 'profession-error' : undefined}
            aria-invalid={validMsg.profession ? 'true' : 'false'}
            required
            autoComplete="organization-title"
          />
        </Field>

        <Button
          type="submit"
          aria-label={isLoading ? "Completing onboarding, please wait" : "Complete onboarding"}
          className="w-full max-w-xs hover:shadow-md btn-primary"
          disabled={isLoading || !formData.location || !formData.profession}
          aria-describedby={isLoading ? "loading-spinner" : undefined}
        >
          {isLoading ? <Spinner size="extra-small" aria-label="Loading" id="loading-spinner" /> : 'Complete Onboarding'}
        </Button>
      </form>
    </div>
  )
};

export default OnboardForm;
