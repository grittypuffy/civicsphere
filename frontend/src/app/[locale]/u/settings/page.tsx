'use client'
import { LANGS, TAGS } from '@/lib/consts'
import { userNameAtom, userPrefsAtom, userPrefsAtom_loadable } from '@/lib/store'
import { LangCode, UserPreferencesUpdateRequest } from '@/lib/types'
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
import { useState } from 'react'

export default function SettingsPage() {
  const username = useAtomValue(userNameAtom)
  const userPrefs = useAtomValue(userPrefsAtom_loadable)
  const setUserPrefs = useSetAtom(userPrefsAtom)
  const [editing, setEditing] = useState({ location: false, language: false, interests: false })
  const [filter, setFilter] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Get current preferences data
  const currentPrefs = userPrefs.state === 'hasData' ? userPrefs.data : null
  const location = currentPrefs?.location || ''
  const language = currentPrefs?.language || 'en'
  const interests = currentPrefs?.interests || []

  // Local state for editable fields
  const [localLocation, setLocalLocation] = useState('')
  const [localLanguage, setLocalLanguage] = useState<LangCode>('en')
  const [localInterests, setLocalInterests] = useState<string[]>([])

  // Initialize local state when editing starts
  const startEditing = (field: keyof typeof editing) => {
    if (field === 'location') {
      setLocalLocation(location)
    } else if (field === 'language') {
      setLocalLanguage(language as LangCode)
    } else if (field === 'interests') {
      setLocalInterests([...interests])
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
      alert('Failed to save preferences. Please try again.')
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

  return (
    <main className="flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-5xl bg-white rounded-xl shadow-[0_12px_40px_rgba(3,52,94,0.08)] p-8 flex flex-col gap-3">
        <Title3>Settings</Title3>

        <div className='flex items-center gap-4'>
          <Avatar name={username || 'Dummy Name'} size={64} />
          <div>
            <Subtitle1>{username || 'Dummy Name'}</Subtitle1>
          </div>
        </div>

        <div className='grid grid-cols-1 gap-6'>
          <div className="p-5 rounded-lg border border-[rgba(10,102,194,0.06)] shadow-sm bg-linear-to-b from-[#f7fbff] to-white">
            <div className='flex items-center justify-between mb-4'>
              <Body1 className="text-[#0369a1] font-semibold">Location</Body1>
              <Button
                appearance="subtle"
                size="small"
                disabled={isLoading}
                icon={editing.location ? <CheckmarkRegular /> : <EditRegular />}
                onClick={() => editing.location ? saveChanges('location') : startEditing('location')}
                className="text-[#0369a1]"
              >
                {editing.location ? 'Done' : 'Edit'}
              </Button>
            </div>
            {!editing.location ? (
              <Text className="text-[#274c6f]">{location || 'Not set'}</Text>
            ) : (
              <Input
                value={localLocation}
                onChange={(_, data) => setLocalLocation(data.value)}
                placeholder="Enter your location"
                disabled={isLoading}
              />
            )}
          </div>

          <div className="p-5 rounded-lg border border-[rgba(10,102,194,0.06)] shadow-sm bg-gradient-to-b from-[#f7fbff] to-white">
            <div className='flex items-center justify-between mb-4'>
              <Body1 className="text-[#0369a1] font-semibold">Language Preference</Body1>
              <Button
                appearance="subtle"
                size="small"
                disabled={isLoading}
                icon={editing.language ? <CheckmarkRegular /> : <EditRegular />}
                onClick={() => editing.language ? saveChanges('language') : startEditing('language')}
                className="text-[#0369a1]"
              >
                {editing.language ? 'Done' : 'Edit'}
              </Button>
            </div>
            {!editing.language ? (
              <Text className="text-[#274c6f]">{LANGS.find(lang => lang.code === language)?.name || 'English'} ({language})</Text>
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

          <div className="p-5 rounded-lg border border-[rgba(10,102,194,0.06)] shadow-sm bg-gradient-to-b from-[#f7fbff] to-white">
            <div className='flex items-center justify-between mb-4'>
              <Body1 className="text-[#0369a1] font-semibold">Interests</Body1>
              <div className='flex items-center gap-2'>
                <Input
                  size="small"
                  value={filter}
                  onChange={(_, data) => setFilter(data.value)}
                  placeholder='Filter tags'
                  contentBefore={<SearchRegular />}
                  disabled={isLoading}
                />
                <Button
                  appearance="subtle"
                  size="small"
                  disabled={isLoading}
                  icon={editing.interests ? <CheckmarkRegular /> : <EditRegular />}
                  onClick={() => editing.interests ? saveChanges('interests') : startEditing('interests')}
                  className="text-[#0369a1]"
                >
                  {editing.interests ? 'Done' : 'Edit'}
                </Button>
              </div>
            </div>
            <Caption1 className='mb-2 text-[#274c6f]'>
              Select the topics you are interested in — these will be suggested when posting.
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
      </div>
    </main>
  )
}
