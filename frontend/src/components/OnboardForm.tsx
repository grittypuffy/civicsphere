'use client'
import { LANGS } from "@/lib/consts";
import { OnboardFormSchema } from '@/lib/schema';
import { LangCode, ToastFunc, UserPreferencesRequest } from "@/lib/types";
import { Button, Checkbox, Dropdown, Field, Input, InputOnChangeData, Option, Spinner } from "@fluentui/react-components";
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
  addressGuidance: string;
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
    addressGuidance: t('addressGuidance'),
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

  // Interest options: key -> label
  const INTEREST_OPTIONS: { key: string; label: string }[] = [
    { key: 'affordable-housing', label: 'Affordable Housing' },
    { key: 'artificial-intelligence', label: 'Artificial Intelligence' },
    { key: 'arts-and-culture', label: 'Arts And Culture' },
    { key: 'asian-voices', label: 'Asian Voices' },
    { key: 'atheist-voices', label: 'Atheist Voices' },
    { key: 'ballot-questions', label: 'Ballot Questions' },
    { key: 'baptist-voices', label: 'Baptist Voices' },
    { key: 'bipoc-voices', label: 'Bipoc Voices' },
    { key: 'black-voices', label: 'Black Voices' },
    { key: 'buddhist-voices', label: 'Buddhist Voices' },
    { key: 'catholic-voices', label: 'Catholic Voices' },
    { key: 'civic-education', label: 'Civic Education' },
    { key: 'civic-participation', label: 'Civic Participation' },
    { key: 'civil-rights', label: 'Civil Rights' },
    { key: 'climate-action', label: 'Climate Action' },
    { key: 'clothing-and-fashion', label: 'Clothing And Fashion' },
    { key: 'colored-voices', label: 'Colored Voices' },
    { key: 'community-development', label: 'Community Development' },
    { key: 'community-initiatives', label: 'Community Initiatives' },
    { key: 'cultural-diversity', label: 'Cultural Diversity' },
    { key: 'cultural-representation', label: 'Cultural Representation' },
    { key: 'digital-access', label: 'Digital Access' },
    { key: 'disability-rights', label: 'Disability Rights' },
    { key: 'disease-prevention', label: 'Disease Prevention' },
    { key: 'economic-justice', label: 'Economic Justice' },
    { key: 'economics', label: 'Economics' },
    { key: 'education', label: 'Education' },
    { key: 'education-access', label: 'Education Access' },
    { key: 'education-for-all', label: 'Education For All' },
    { key: 'elections-and-voting', label: 'Elections And Voting' },
    { key: 'emergency-preparedness', label: 'Emergency Preparedness' },
    { key: 'environmental-rights', label: 'Environmental Rights' },
    { key: 'financial-literacy', label: 'Financial Literacy' },
    { key: 'food-security', label: 'Food Security' },
    { key: 'future-of-work', label: 'Future Of Work' },
    { key: 'gender-equality', label: 'Gender Equality' },
    { key: 'gender-justice', label: 'Gender Justice' },
    { key: 'government-policy', label: 'Government Policy' },
    { key: 'health-equity', label: 'Health Equity' },
    { key: 'healthcare-access', label: 'Healthcare Access' },
    { key: 'housing-rights', label: 'Housing Rights' },
    { key: 'human-rights', label: 'Human Rights' },
    { key: 'indigenous-voices', label: 'Indigenous Voices' },
    { key: 'immigrant-voices', label: 'Immigrant Voices' },
    { key: 'income-inequality', label: 'Income Inequality' },
    { key: 'interfaith-dialogue', label: 'Interfaith Dialogue' },
    { key: 'infrastructure', label: 'Infrastructure' },
    { key: 'interracial-relationships', label: 'Interracial Relationships' },
    { key: 'lgbtq-voices', label: 'Lgbtq Voices' },
    { key: 'local-economies', label: 'Local Economies' },
    { key: 'media-literacy', label: 'Media Literacy' },
    { key: 'mental-health', label: 'Mental Health' },
    { key: 'migrant-rights', label: 'Migrant Rights' },
    { key: 'mothers-rights', label: 'Mothers Rights' },
    { key: 'native-american-voices', label: 'Native American Voices' },
    { key: 'national-security', label: 'National Security' },
    { key: 'natural-disasters', label: 'Natural Disasters' },
    { key: 'neighborhoods', label: 'Neighborhoods' },
    { key: 'nuclear-disarmament', label: 'Nuclear Disarmament' },
    { key: 'pagan-voices', label: 'Pagan Voices' },
    { key: 'pandemic-response', label: 'Pandemic Response' },
    { key: 'parenting-rights', label: 'Parenting Rights' },
    { key: 'personal-finance', label: 'Personal Finance' },
    { key: 'philanthropy', label: 'Philanthropy' },
    { key: 'prison-reform', label: 'Prison Reform' },
    { key: 'progressive-values', label: 'Progressive Values' },
    { key: 'public-health', label: 'Public Health' },
    { key: 'racial-justice', label: 'Racial Justice' },
    { key: 'refugee-rights', label: 'Refugee Rights' },
    { key: 'religious-freedom', label: 'Religious Freedom' },
    { key: 'reproductive-rights', label: 'Reproductive Rights' },
    { key: 'school-safety', label: 'School Safety' },
    { key: 'social-justice', label: 'Social Justice' },
    { key: 'sports-and-recreation', label: 'Sports And Recreation' },
    { key: 'sustainability', label: 'Sustainability' },
    { key: 'technology-access', label: 'Technology Access' },
    { key: 'veteran-rights', label: 'Veteran Rights' },
    { key: 'violence-prevention', label: 'Violence Prevention' },
    { key: 'voter-rights', label: 'Voter Rights' },
    { key: 'water-rights', label: 'Water Rights' },
    { key: 'women-empowerment', label: 'Women Empowerment' },
  ];
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

  const handleInterestsToggle = (key: string, checked: boolean) => {
    setFormData((prev) => {
      const next = new Set(prev.interests || []);
      if (checked) next.add(key); else next.delete(key);
      return { ...prev, interests: Array.from(next) };
    });
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
              // Try to parse response body to provide a better error message for known cases
              let bodyText = '';
              try {
                const json = await res.json();
                if (json) bodyText = (json.detail || json.message || JSON.stringify(json)).toString();
              } catch (e) {
                try {
                  bodyText = await res.text();
                } catch (e) {
                  bodyText = '';
                }
              }

              // If backend returned an address-specific error, show the localized guidance to the user
              const isUsAddressError = res.status === 500 && /address/i.test(bodyText) && /improper/i.test(bodyText);
              if (isUsAddressError) {
                // Show guidance under the address field and via toast
                setValidMsg((prev) => ({ ...prev, address: s.addressGuidance }));
                ToastMessage({ message: s.onboardingFailTitle, description: s.addressGuidance }, 'error');
              } else {
                throw new Error('Network response was not ok: ' + (bodyText || res.statusText));
              }
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
          label={s.interestsLabel.replace(/\(.*\)$/, '').trim()}
          validationMessage={validMsg.interests}
          validationState={validMsg.interests ? 'error' : 'none'}
          className="w-full"
        >
          <div
            className="grid grid-cols-2 gap-x-4 gap-y-2 max-h-48 overflow-y-auto pr-2"
            role="group"
            aria-label={s.ariaInterests}
            aria-describedby={validMsg.interests ? 'interests-error' : undefined}
          >
            {INTEREST_OPTIONS.map((opt) => (
              <div key={opt.key} className="flex items-center">
                <Checkbox
                  label={opt.label}
                  disabled={isLoading}
                  checked={(formData.interests || []).includes(opt.key)}
                  onChange={(_: React.ChangeEvent<HTMLInputElement>, data) => {
                    handleInterestsToggle(opt.key, !!data.checked);
                  }}
                />
              </div>
            ))}
          </div>
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
