'use client'
import { Avatar } from '@fluentui/react-components'
import { useEffect, useState } from 'react'

type Props = {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { text: string, tags: string[], files: File[] }) => void
  userName?: string
}

const ALL_TAGS = [
  'local-politics','government-policy','elections-and-voting','ballot-questions','civic-participation','public-services','local-governance','community-initiatives','public-policy','lgbtqia-rights','womens-rights','mens-rights','minority-rights','civil-rights','disability-rights','environmental-rights','human-rights','indigenous-rights','immigrant-rights','colored-voices','asian-voices','hispanic-voices','indigenous-voices','black-voices','bipoc-voices','lgbtqia-voices','women-voices','religious-voices','muslim-voices','hindu-voices','baptist-voices','catholic-voices','protestant-voices','jewish-voices','buddhist-voices','sikh-voices','jain-voices','atheist-voices','sustainability','climate-action','economic-justice','education-for-all','social-justice','healthcare-for-all','affordable-housing','racial-justice','gender-equality','mental-health-awareness','gender-justice','economics','technology-policy','future-of-work','artificial-intelligence','digital-access','tech-for-good','financial-literacy','job-creation','income-inequality','tech-regulation','public-health','medical-ethics','pandemic-response','health-equity','disease-prevention','public-safety','emergency-preparedness','community-development','local-events','volunteer-opportunities','public-transportation','local-business-support','food-security','healthcare-access','education-access','job-opportunities','education','history-and-heritage','arts-and-culture','public-libraries','civic-education','cultural-diversity','history-and-museums','cultural-representation','media-and-pharma','music-and-bands','clothing-and-fashion','sports-and-fitness','physical-health','mental-health','wellness-programs'
]

export default function CreatePost({ isOpen, onClose, onSubmit, userName = 'You' }: Props) {
  const [text, setText] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<{ url: string, type: 'image' | 'video' | 'file', name: string }[]>([])
  const [filter, setFilter] = useState('')

  useEffect(() => {
    // cleanup previews when closed
    if (!isOpen) {
      setText('')
      setSelected([])
      setFiles([])
      previews.forEach(p => URL.revokeObjectURL(p.url))
      setPreviews([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const list = e.target.files
    if (!list) return
    const arr = Array.from(list)
    setFiles(prev => [...prev, ...arr])
    const newPreviews = arr.map(f => {
      const url = URL.createObjectURL(f)
      const t = f.type.startsWith('image') ? 'image' : f.type.startsWith('video') ? 'video' : 'file'
      return { url, type: t as any, name: f.name }
    })
    setPreviews(prev => [...prev, ...newPreviews])
    e.currentTarget.value = ''
  }

  function toggleTag(tag: string) {
    setSelected(s => s.includes(tag) ? s.filter(x => x !== tag) : [...s, tag])
  }

  function doSubmit() {
    onSubmit({ text, tags: selected, files })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 z-50 bg-black bg-opacity-50 flex items-start justify-center p-4 overflow-auto'>
      <div className='bg-white w-full max-w-3xl rounded-lg shadow-lg p-6 mt-8 mb-8'>
        <header className='flex items-center gap-4'>
          <Avatar name={userName} />
          <div>
            <div className='font-semibold'>{userName}</div>
            <div className='text-sm text-gray-500'>Create a post</div>
          </div>
          <div className='ml-auto'>
            <button onClick={onClose} className='text-sm text-gray-600 px-3 py-1 rounded hover:bg-gray-100'>Close</button>
          </div>
        </header>

        <main className='mt-4'>
          <textarea value={text} onChange={e => setText(e.target.value)} placeholder='Share something about local politics or community issues...' className='w-full p-3 border rounded min-h-[120px] resize-vertical' />

          <div className='mt-3 flex items-center gap-3'>
            <label className='px-3 py-2 bg-slate-100 rounded cursor-pointer'>
              Add media
              <input onChange={onFileChange} type='file' multiple className='hidden' />
            </label>
            <div className='text-sm text-gray-600'>You can upload images, videos or documents.</div>
          </div>

          {previews.length > 0 && (
            <div className='mt-3 grid grid-cols-3 gap-2'>
              {previews.map((p, idx) => (
                <div key={idx} className='border rounded p-1 text-sm'>
                  {p.type === 'image' && <img src={p.url} alt={p.name} className='w-full h-28 object-cover rounded' />}
                  {p.type === 'video' && <video src={p.url} className='w-full h-28 object-cover rounded' />}
                  {p.type === 'file' && <div className='p-2'>{p.name}</div>}
                </div>
              ))}
            </div>
          )}

          <div className='mt-4'>
            <div className='flex items-center justify-between'>
              <div className='font-semibold'>Select tags</div>
              <input value={filter} onChange={e => setFilter(e.target.value)} placeholder='Filter tags' className='text-sm p-1 border rounded' />
            </div>
            <div className='mt-2 max-h-48 overflow-auto border rounded p-2 grid grid-cols-2 gap-2'>
              {ALL_TAGS.filter(t => t.includes(filter)).map(tag => (
                <label key={tag} className='flex items-center gap-2 text-sm'>
                  <input type='checkbox' checked={selected.includes(tag)} onChange={() => toggleTag(tag)} />
                  <span className='truncate'>{tag}</span>
                </label>
              ))}
            </div>
          </div>
        </main>

        <footer className='mt-4 flex items-center justify-end gap-3'>
          <button onClick={onClose} className='px-4 py-2 rounded border'>Cancel</button>
          <button onClick={doSubmit} className='px-4 py-2 rounded bg-blue-600 text-white'>Post</button>
        </footer>
      </div>
    </div>
  )
}
