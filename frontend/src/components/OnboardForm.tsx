'use client'
import { LANGS } from "@/lib/consts";
import { OnboardFormSchema } from '@/lib/schema';
import { LangCode, ToastFunc, UserPreferencesRequest } from "@/lib/types";
import { Button, Dropdown, Field, Input, InputOnChangeData, Option, Spinner, Textarea } from "@fluentui/react-components";
import { useRouter } from 'next/navigation';
import { useState } from "react";
import * as v from 'valibot';
import { useTranslations } from 'next-intl';

/**
 * Localizable keys for the onboarding form
 * Keys mirror the JSON you will append under the `onboard` namespace.
 */
type OnboardStrings = {
  locationLabel: string;
  addressLabel: string;
  languageLabel: string;
  languagePlaceholder: string;
  interestsLabel: string;
  interestsPlaceholder: string;
  interestsExample: string;
  professionLabel: string;
  buttonComplete: string;
  loadingAria: string;
  onboardingFailTitle: string;
  onboardingFailDescInvalid: string;
  completingOnboarding: string;
  onboardingCompleteTitle: string;
  onboardingCompleteDesc: string;
  invalidDataTitle: string;
  invalidDataDesc: string;
  onboardingFailedGenericTitle: string;
  onboardingFailedGenericDesc: string;
  ariaFormLabel: string;
  ariaLocation: string;
  ariaAddress: string;
  ariaLanguage: string;
  ariaInterests: string;
  ariaProfession: string;
}

/**
 * Props
 * - ToastMessage: same as before
 * - strings?: optional overrides for keys (useful for testing or programmatic overrides)
 */
const OnboardForm = ({ ToastMessage, strings: stringsOverride }: { ToastMessage: ToastFunc; strings?: Partial<OnboardStrings> }) => {
  const router = useRouter();
  const t = useTranslations('onboard');

  // Merge next-intl translations with optional overrides
  const s: OnboardStrings = {
    locationLabel: t('locationLabel'),
    addressLabel: t('addressLabel'),
    languageLabel: t('languageLabel'),
    languagePlaceholder: t('languagePlaceholder'),
    interestsLabel: t('interestsLabel'),
    interestsPlaceholder: t('interestsPlaceholder'),
    interestsExample: t('interestsExample'),
    professionLabel: t('professionLabel'),
    buttonComplete: t('buttonComplete'),
    loadingAria: t('loadingAria'),
    onboardingFailTitle: t('onboardingFailTitle'),
    onboardingFailDescInvalid: t('onboardingFailDescInvalid'),
    completingOnboarding: t('completingOnboarding'),
    onboardingCompleteTitle: t('onboardingCompleteTitle'),
    onboardingCompleteDesc: t('onboardingCompleteDesc'),
    invalidDataTitle: t('invalidDataTitle'),
    invalidDataDesc: t('invalidDataDesc'),
    onboardingFailedGenericTitle: t('onboardingFailedGenericTitle'),
    onboardingFailedGenericDesc: t('onboardingFailedGenericDesc'),
    ariaFormLabel: t('ariaFormLabel'),
    ariaLocation: t('ariaLocation'),
    ariaAddress: t('ariaAddress'),
    ariaLanguage: t('ariaLanguage'),
    ariaInterests: t('ariaInterests'),
    ariaProfession: t('ariaProfession'),
    ...(stringsOverride || {}),
  } as OnboardStrings;

  const [formData, setFormData] = useState<UserPreferencesRequest>({
    location: '',
    address: '',
    language: 'en',
    interests: [],
    profession: '',
  });

  const [validMsg, setValidMsg] = useState<{ [key: string]: string }>({
    location: '',
    language: '',
    address: '',
    interests: '',
    profession: '',
  });

  const [interestsInput, setInterestsInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateFormData = () => {
    const res = v.safeParse(OnboardFormSchema, formData);
    const newValidMsg: { [key: string]: string } = {
      location: '',
      address: '',
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
          message: s.onboardingFailTitle,
          description: s.onboardingFailDescInvalid,
        },
        'error'
      );
      return;
    }

    // keep the small delay/UX behavior from the original
    setTimeout(async () => {
      ToastMessage({ message: s.completingOnboarding, description: '' }, 'info');
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
              { message: s.onboardingCompleteTitle, description: s.onboardingCompleteDesc },
              'success'
            );
            setTimeout(() => {
              router.push('/u/home');
            }, 400);
            break;
          case 422:
            ToastMessage(
              { message: s.invalidDataTitle, description: s.invalidDataDesc },
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
          { message: s.onboardingFailedGenericTitle, description: s.onboardingFailedGenericDesc },
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

  return (
    <div className="flex flex-col w-full max-w-md">
      <form
        onSubmit={handleOnboarding}
        className="flex flex-col gap-y-3 w-full items-center"
        role="form"
        aria-label={s.ariaFormLabel}
        noValidate
      >
        <Field
          label={s.locationLabel}
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
            aria-label={s.ariaLocation}
            aria-describedby={validMsg.location ? 'location-error' : undefined}
            aria-invalid={validMsg.location ? 'true' : 'false'}
            required
            autoComplete="address-level2"
          />
        </Field>

        <Field
          label={s.addressLabel}
          validationMessage={validMsg.address}
          validationState={validMsg.address ? 'error' : 'none'}
          className="w-full"
        >
          <Input
            type="text"
            value={formData.address}
            appearance="underline"
            onChange={(_: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => {
              setFormData((prev) => ({ ...prev, address: data.value }));
            }}
            disabled={isLoading}
            className="w-full"
            style={{ minWidth: '200px' }}
            aria-label={s.ariaAddress}
            aria-describedby={validMsg.address ? 'address-error' : undefined}
            aria-invalid={validMsg.address ? 'true' : 'false'}
            required
            autoComplete="address-line1"
          />
        </Field>

        <Field
          label={s.languageLabel}
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
            placeholder={s.languagePlaceholder}
            aria-label={s.ariaLanguage}
            aria-describedby={validMsg.language ? 'language-error' : undefined}
            aria-invalid={validMsg.language ? 'true' : 'false'}
          >
            {LANGS.map((lang, i) => (
              <Option key={i} text={lang.name} value={lang.code}>
                {lang.name}
              </Option>
            ))}
          </Dropdown>
        </Field>

        <Field
          label={s.interestsLabel}
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
            resize='none'
            disabled={isLoading}
            className="w-full"
            style={{ minWidth: '200px' }}
            aria-label={s.ariaInterests}
            aria-describedby={validMsg.interests ? 'interests-error' : undefined}
            aria-invalid={validMsg.interests ? 'true' : 'false'}
            placeholder={s.interestsPlaceholder}
            rows={3}
          />
        </Field>

        <Field
          label={s.professionLabel}
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
            aria-label={s.ariaProfession}
            aria-describedby={validMsg.profession ? 'profession-error' : undefined}
            aria-invalid={validMsg.profession ? 'true' : 'false'}
            required
            autoComplete="organization-title"
          />
        </Field>

        <Button
          type="submit"
          aria-label={isLoading ? s.loadingAria : s.buttonComplete}
          className="w-full max-w-xs hover:shadow-md btn-primary"
          disabled={isLoading || !formData.location || !formData.profession}
          aria-describedby={isLoading ? "loading-spinner" : undefined}
        >
          {isLoading ? <Spinner size="extra-small" aria-label="Loading" id="loading-spinner" /> : s.buttonComplete}
        </Button>
      </form>
    </div>
  )
};

export default OnboardForm;
