'use client'
import { useEffect, useState } from 'react'
import { Avatar } from '@fluentui/react-components'

type Settings = {
  username: string
  email: string
  location?: string
  language?: string
  interests?: string[]
}

const ALL_TAGS = [
  'local-politics','government-policy','elections-and-voting','ballot-questions','civic-participation','public-services','local-governance','community-initiatives','public-policy','lgbtqia-rights','womens-rights','mens-rights','minority-rights','civil-rights','disability-rights','environmental-rights','human-rights','indigenous-rights','immigrant-rights','colored-voices','asian-voices','hispanic-voices','indigenous-voices','black-voices','bipoc-voices','lgbtqia-voices','women-voices','religious-voices','muslim-voices','hindu-voices','baptist-voices','catholic-voices','protestant-voices','jewish-voices','buddhist-voices','sikh-voices','jain-voices','atheist-voices','sustainability','climate-action','economic-justice','education-for-all','social-justice','healthcare-for-all','affordable-housing','racial-justice','gender-equality','mental-health-awareness','gender-justice','economics','technology-policy','future-of-work','artificial-intelligence','digital-access','tech-for-good','financial-literacy','job-creation','income-inequality','tech-regulation','public-health','medical-ethics','pandemic-response','health-equity','disease-prevention','public-safety','emergency-preparedness','community-development','local-events','volunteer-opportunities','public-transportation','local-business-support','food-security','healthcare-access','education-access','job-opportunities','education','history-and-heritage','arts-and-culture','public-libraries','civic-education','cultural-diversity','history-and-museums','cultural-representation','media-and-pharma','music-and-bands','clothing-and-fashion','sports-and-fitness','physical-health','mental-health','wellness-programs'
]

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({ username: 'Dummy Name', email: 'user@example.com' })
  const [editing, setEditing] = useState({ location: false, language: false, interests: false })
  const [filter, setFilter] = useState('')

  // load saved settings from localStorage as a placeholder for backend
  useEffect(() => {
    try {
      const raw = localStorage.getItem('userSettings')
      if (raw) setSettings(JSON.parse(raw))
    } catch (e) {
      // ignore
    }
  }, [])

  function onChange<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  function save() {
    // placeholder for backend call; for now persist to localStorage
    try {
      localStorage.setItem('userSettings', JSON.stringify(settings))
      alert('Settings saved (local only). Backend integration coming later.')
    } catch (e) {
      alert('Could not save settings locally')
    }
  }

  function toggleInterest(tag: string) {
    const existing = settings.interests || []
    const next = existing.includes(tag) ? existing.filter(t => t !== tag) : [...existing, tag]
    onChange('interests', next)
  }

  return (
    <div className='p-6 max-w-3xl mx-auto'>
      <div className='flex items-center gap-4 mb-6'>
        <Avatar name={settings.username} />
        <div>
          <div className='font-semibold text-lg'>{settings.username}</div>
          <div className='text-sm text-gray-500'>{settings.email}</div>
        </div>
      </div>

      <div className='space-y-4'>
        <div className='bg-white p-4 rounded shadow-sm'>
          <div className='font-semibold mb-2'>Location</div>
          {!editing.location ? (
            <div className='flex items-center justify-between'>
              <div>{settings.location || 'Not set'}</div>
              <button onClick={() => setEditing(e => ({ ...e, location: true }))} className='text-sm text-blue-600'>Edit</button>
            </div>
          ) : (
            <div className='flex gap-2'>
              <input value={settings.location || ''} onChange={e => onChange('location', e.target.value)} className='flex-1 p-2 border rounded' />
              <button onClick={() => setEditing(e => ({ ...e, location: false }))} className='px-3 py-2 bg-slate-100 rounded'>Done</button>
            </div>
          )}
        </div>

        <div className='bg-white p-4 rounded shadow-sm'>
          <div className='font-semibold mb-2'>Language Preference</div>
          {!editing.language ? (
            <div className='flex items-center justify-between'>
              <div>{settings.language || 'en'}</div>
              <button onClick={() => setEditing(e => ({ ...e, language: true }))} className='text-sm text-blue-600'>Edit</button>
            </div>
          ) : (
            <div className='flex gap-2 items-center'>
              <select value={settings.language || 'en'} onChange={e => onChange('language', e.target.value)} className='p-2 border rounded'>
                <option value='en'>en</option>
                <option value='hi'>hi</option>
                <option value='es'>es</option>
                <option value='fr'>fr</option>
              </select>
              <button onClick={() => setEditing(e => ({ ...e, language: false }))} className='px-3 py-2 bg-slate-100 rounded'>Done</button>
            </div>
          )}
        </div>

        <div className='bg-white p-4 rounded shadow-sm'>
          <div className='flex items-center justify-between'>
            <div className='font-semibold'>Interests</div>
            <div className='flex items-center gap-2'>
              <input value={filter} onChange={e => setFilter(e.target.value)} placeholder='Filter tags' className='text-sm p-1 border rounded' />
              <button onClick={() => setEditing(e => ({ ...e, interests: !e.interests }))} className='text-sm text-blue-600'>{editing.interests ? 'Done' : 'Edit'}</button>
            </div>
          </div>

          <div className='mt-3'>
            <div className='text-sm text-gray-600 mb-2'>Select the topics you are interested in — these will be suggested when posting.</div>
            <div className='grid grid-cols-2 gap-2 max-h-64 overflow-auto border rounded p-2'>
              {ALL_TAGS.filter(t => t.includes(filter)).map(tag => (
                <label key={tag} className='flex items-center gap-2 text-sm'>
                  <input type='checkbox' checked={(settings.interests || []).includes(tag)} disabled={!editing.interests} onChange={() => toggleInterest(tag)} />
                  <span className='truncate'>{tag}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className='flex justify-end gap-3'>
          <button onClick={save} className='px-4 py-2 bg-blue-600 text-white rounded'>Save Settings</button>
        </div>
      </div>
    </div>
  )
}
