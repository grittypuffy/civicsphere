'use client'
import { LANGS, TAGS } from '@/lib/consts'
import { userNameAtom, userPrefsAtom, userPrefsAtom_loadable } from '@/lib/store'
import { LangCode, UserPreferences, UserPreferencesUpdateRequest } from '@/lib/types'
import { getUserPreferences, updateUserPreferences } from '@/lib/utils'
import {
  Avatar,
  Body1,
  Button,
  Caption1,
  Checkbox,
  Dropdown,
  Input,
  Option,
  Subtitle1,
  Text,
  Title3
} from '@fluentui/react-components'
import { CheckmarkRegular, EditRegular, SearchRegular } from '@fluentui/react-icons'
import { useAtomValue, useSetAtom } from 'jotai'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

export default function SettingsPage() {
  const t = useTranslations('settings')
  const username = useAtomValue(userNameAtom)
  const setUserPrefs = useSetAtom(userPrefsAtom)
  const userPrefs = useAtomValue(userPrefsAtom_loadable)
  const [editing, setEditing] = useState({ location: false, address: false, language: false, interests: false })
  const [filter, setFilter] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Local state for editable fields
  const [localLocation, setLocalLocation] = useState('')
  const [localAddress, setLocalAddress] = useState('')
  const [localLanguage, setLocalLanguage] = useState<string>('en')
  const [localInterests, setLocalInterests] = useState<string[]>([])

  // Initialize local state when editing starts
  const startEditing = (field: keyof typeof editing, currentPrefs: UserPreferences) => {
    if (field === 'location') {
      setLocalLocation(currentPrefs?.location || '')
    } else if (field === 'address') {
      setLocalAddress(currentPrefs?.address || '')
    } else if (field === 'language') {
      setLocalLanguage(currentPrefs?.language || 'en')
    } else if (field === 'interests') {
      setLocalInterests([...(currentPrefs?.interests || [])])
    }
    setEditing(prev => ({ ...prev, [field]: true }))
  }

  // Save changes to backend and update atom
  const saveChanges = async (field: keyof typeof editing) => {
    setIsLoading(true)
    try {
      const updateData: UserPreferencesUpdateRequest = {}

      if (field === 'location') {
        updateData.location = localLocation || null
      } else if (field === 'address') {
        updateData.address = localAddress || null
      } else if (field === 'language') {
        updateData.language = localLanguage || null
      } else if (field === 'interests') {
        updateData.interests = localInterests.length > 0 ? localInterests : null
      }

      await updateUserPreferences(updateData)

      // Refresh the preferences atom
      setUserPrefs(getUserPreferences())

      setEditing(prev => ({ ...prev, [field]: false }))
    } catch (error) {
      console.error('Failed to save preferences:', error)
      alert(t('saveError'))
    } finally {
      setIsLoading(false)
    }
  }

  const toggleInterest = (tag: string) => {
    const updated = localInterests.includes(tag)
      ? localInterests.filter(t => t !== tag)
      : [...localInterests, tag]
    setLocalInterests(updated)
  }

  useEffect(() => {
    setUserPrefs(getUserPreferences())
  }, [])

  return (
    <main className="flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-5xl bg-white rounded-xl shadow-[0_12px_40px_rgba(3,52,94,0.08)] p-8 flex flex-col gap-3">
        <Title3>{t('title')}</Title3>

        <div className='flex items-center gap-4'>
          <Avatar name={username || 'User'} size={64} />
          <div>
            <Subtitle1>{username || 'User'}</Subtitle1>
          </div>
        </div>

        {(() => {
          switch (userPrefs.state) {
            case 'loading':
              return (
                <div className='grid grid-cols-1 gap-6'>
                  <div className="p-5 rounded-lg border border-[rgba(10,102,194,0.06)] shadow-sm bg-linear-to-b from-[#f7fbff] to-white">
                    <div className='flex items-center justify-between mb-4'>
                      <Body1 className="text-[#0369a1] font-semibold">{t('locationTitle')}</Body1>
                      <Button appearance="subtle" size="small" disabled icon={<EditRegular />} className="text-[#0369a1]">
                        {t('edit')}
                      </Button>
                    </div>
                    <Text className="text-[#274c6f]">{t('loadingGeneric')}</Text>
                  </div>

                  <div className="p-5 rounded-lg border border-[rgba(10,102,194,0.06)] shadow-sm bg-linear-to-b from-[#f7fbff] to-white">
                    <div className='flex items-center justify-between mb-4'>
                      <Body1 className="text-[#0369a1] font-semibold">Address</Body1>
                      <Button appearance="subtle" size="small" disabled icon={<EditRegular />} className="text-[#0369a1]">
                        {t('edit')}
                      </Button>
                    </div>
                    <Text className="text-[#274c6f]">{t('loadingGeneric')}</Text>
                  </div>


                  <div className="p-5 rounded-lg border border-[rgba(10,102,194,0.06)] shadow-sm bg-linear-to-b from-[#f7fbff] to-white">
                    <div className='flex items-center justify-between mb-4'>
                      <Body1 className="text-[#0369a1] font-semibold">{t('languageTitle')}</Body1>
                      <Button appearance="subtle" size="small" disabled icon={<EditRegular />} className="text-[#0369a1]">
                        {t('edit')}
                      </Button>
                    </div>
                    <Text className="text-[#274c6f]">{t('loadingGeneric')}</Text>
                  </div>

                  <div className="p-5 rounded-lg border border-[rgba(10,102,194,0.06)] shadow-sm bg-linear-to-b from-[#f7fbff] to-white">
                    <div className='flex items-center justify-between mb-4'>
                      <Body1 className="text-[#0369a1] font-semibold">{t('interestsTitle')}</Body1>
                      <div className='flex items-center gap-2'>
                        <Input
                          size="small"
                          disabled
                          value={filter}
                          onChange={(_, data) => setFilter(data.value)}
                          placeholder={t('filterPlaceholder')}
                          contentBefore={<SearchRegular />}
                        />
                        <Button appearance="subtle" size="small" disabled icon={<EditRegular />} className="text-[#0369a1]">
                          {t('edit')}
                        </Button>
                      </div>
                    </div>
                    <Text className="text-[#274c6f]">{t('loadingInterests')}</Text>
                  </div>
                </div>
              )
            case 'hasError':
              return (
                <div className="p-5 rounded-lg border border-red-200 bg-red-50 text-red-700">
                  <Body1 className="font-semibold mb-2">{t('errorTitle')}</Body1>
                  <Text>{t('errorDescription')}</Text>
                  <Button
                    appearance="primary"
                    size="small"
                    className="mt-3"
                    onClick={() => setUserPrefs(getUserPreferences())}
                  >
                    {t('retry')}
                  </Button>
                </div>
              )
            case 'hasData':
              const currentPrefs = userPrefs.data as UserPreferences
              const location = currentPrefs.location || ''
              const address = currentPrefs.address || ''
              const language = currentPrefs.language || 'en'
              const interests = currentPrefs.interests || []

              return (
                <div className='grid grid-cols-1 gap-6'>
                  <div className="p-5 rounded-lg border border-[rgba(10,102,194,0.06)] shadow-sm bg-linear-to-b from-[#f7fbff] to-white">
                    <div className='flex items-center justify-between mb-4'>
                      <Body1 className="text-[#0369a1] font-semibold">{t('locationTitle')}</Body1>
                      <Button
                        appearance="subtle"
                        size="small"
                        disabled={isLoading}
                        icon={editing.location ? <CheckmarkRegular /> : <EditRegular />}
                        onClick={() => editing.location ? saveChanges('location') : startEditing('location', currentPrefs)}
                        className="text-[#0369a1]"
                      >
                        {editing.location ? t('done') : t('edit')}
                      </Button>
                    </div>
                    {!editing.location ? (
                      <Text className="text-[#274c6f]">{location || t('notSet')}</Text>
                    ) : (
                      <Input
                        value={localLocation}
                        onChange={(_, data) => setLocalLocation(data.value)}
                        placeholder={t('locationPlaceholder')}
                        disabled={isLoading}
                      />
                    )}
                  </div>

                  <div className="p-5 rounded-lg border border-[rgba(10,102,194,0.06)] shadow-sm bg-linear-to-b from-[#f7fbff] to-white">
                    <div className='flex items-center justify-between mb-4'>
                      <Body1 className="text-[#0369a1] font-semibold">Address</Body1>
                      <Button
                        appearance="subtle"
                        size="small"
                        disabled={isLoading}
                        icon={editing.address ? <CheckmarkRegular /> : <EditRegular />}
                        onClick={() => editing.address ? saveChanges('address') : startEditing('address', currentPrefs)}
                        className="text-[#0369a1]"
                      >
                        {editing.address ? 'Done' : 'Edit'}
                      </Button>
                    </div>
                    {!editing.address ? (
                      <Text className="text-[#274c6f]">{address || 'Not set'}</Text>
                    ) : (
                      <Input
                        value={localAddress}
                        onChange={(_, data) => setLocalAddress(data.value)}
                        placeholder="Enter your address, make sure it's proper address. Eg: [Street Number], [Street Name], [Apt/Suite/Unit (if any)], [City], [State], [ZIP Code], [Country]"
                        disabled={isLoading}
                      />
                    )}
                  </div>

                  <div className="p-5 rounded-lg border border-[rgba(10,102,194,0.06)] shadow-sm bg-linear-to-b from-[#f7fbff] to-white">
                    <div className='flex items-center justify-between mb-4'>
                      <Body1 className="text-[#0369a1] font-semibold">{t('languageTitle')}</Body1>
                      <Button
                        appearance="subtle"
                        size="small"
                        disabled={isLoading}
                        icon={editing.language ? <CheckmarkRegular /> : <EditRegular />}
                        onClick={() => editing.language ? saveChanges('language') : startEditing('language', currentPrefs)}
                        className="text-[#0369a1]"
                      >
                        {editing.language ? t('done') : t('edit')}
                      </Button>
                    </div>
                    {!editing.language ? (
                      <Text className="text-[#274c6f]">{LANGS.find(lang => lang.code === language)?.name || t('languageFallback')} ({language})</Text>
                    ) : (
                      <Dropdown
                        value={localLanguage}
                        onOptionSelect={(_, data) => setLocalLanguage(data.optionValue as LangCode)}
                        disabled={isLoading}
                      >
                        {LANGS.map((lang, i) => (
                          <Option key={i} text={lang.name} value={lang.code}>
                            {lang.name}
                          </Option>
                        ))}
                      </Dropdown>
                    )}
                  </div>

                  <div className="p-5 rounded-lg border border-[rgba(10,102,194,0.06)] shadow-sm bg-linear-to-b from-[#f7fbff] to-white">
                    <div className='flex items-center justify-between mb-4'>
                      <Body1 className="text-[#0369a1] font-semibold">{t('interestsTitle')}</Body1>
                      <div className='flex items-center gap-2'>
                        <Input
                          size="small"
                          value={filter}
                          onChange={(_, data) => setFilter(data.value)}
                          placeholder={t('filterPlaceholder')}
                          contentBefore={<SearchRegular />}
                          disabled={isLoading}
                        />
                        <Button
                          appearance="subtle"
                          size="small"
                          disabled={isLoading}
                          icon={editing.interests ? <CheckmarkRegular /> : <EditRegular />}
                          onClick={() => editing.interests ? saveChanges('interests') : startEditing('interests', currentPrefs)}
                          className="text-[#0369a1]"
                        >
                          {editing.interests ? t('done') : t('edit')}
                        </Button>
                      </div>
                    </div>
                    <Caption1 className='mb-2 text-[#274c6f]'>
                      {t('interestsHint')}
                    </Caption1>
                    <div className='grid grid-cols-2 gap-2 max-h-64 overflow-auto border rounded p-2'>
                      {TAGS.filter(t => t.includes(filter)).map(tag => (
                        <label key={tag} className='flex items-center gap-2 text-sm text-[#274c6f]'>
                          <Checkbox
                            checked={editing.interests ? localInterests.includes(tag) : interests.includes(tag)}
                            disabled={!editing.interests || isLoading}
                            onChange={() => editing.interests && toggleInterest(tag)}
                          />
                          <span className='truncate'>{tag}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )
            default:
              return null
          }
        })()}
      </div>
    </main>
  )
}
