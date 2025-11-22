'use client'
import SideBar from '@/components/SideBar'
import { Avatar, Hamburger, Tooltip } from '@fluentui/react-components'
import Link from 'next/link'
import { SetStateAction, useState } from 'react'

type Trend = { id: number; tag: string; score: number }

export default function TrendingPage() {
  const [isNavOpen, setNavOpen] = useState(false)
  // sample static list; backend will replace this later
  const initial: Trend[] = [
    { id: 1, tag: '#sports', score: 1245 },
    { id: 2, tag: '#education', score: 980 },
    { id: 3, tag: '#science', score: 876 },
    { id: 4, tag: '#politics', score: 760 },
    { id: 5, tag: '#tech', score: 654 },
    { id: 6, tag: '#climate-action', score: 432 },
    { id: 7, tag: '#public-health', score: 389 },
    { id: 8, tag: '#local-politics', score: 312 },
    { id: 9, tag: '#community-development', score: 298 },
    { id: 10, tag: '#education-for-all', score: 210 }
  ]

  const [trends] = useState<Trend[]>(initial)
  const [sortBy, setSortBy] = useState<'rank' | 'score'>('rank')

  const sorted = [...trends].sort((a, b) => sortBy === 'rank' ? a.id - b.id : b.score - a.score)

  return (
    <div className='bg-gray-200 min-h-screen flex flex-col'>
      <SideBar isNavOpen={isNavOpen} setNavOpen={setNavOpen} />
      <header className='flex justify-between p-3 lg:p-5 xl:p-8 border'>
        <Tooltip
          content="Open Navigation bar"
          relationship="label"
          positioning="after"
        >
          <Hamburger
            onClick={() => setNavOpen(true)}
            aria-label="Open Navigation bar"
          />
        </Tooltip>
        <Link href='/u/settings'>
          <Avatar
            name={'You'}
            activeAppearance='ring-shadow'
            active='active'
            color='platinum'
            aria-label={`User avatar for You`}
            className='cursor-pointer'
          />
        </Link>
      </header>

      <main className='mx-auto w-full lg:w-3/4 p-4 flex-1'>
        <div className='flex items-center justify-between mb-4'>
          <h1 className='text-2xl font-semibold'>Trending Topics</h1>
          <div className='flex items-center gap-3'>
            <label className='text-sm text-gray-600'>Sort</label>
            <select value={sortBy} onChange={e => setSortBy(e.target.value as SetStateAction<'rank' | 'score'>)} className='p-2 border rounded'>
              <option value='rank'>Top by Rank</option>
              <option value='score'>Top by Activity</option>
            </select>
          </div>
        </div>

        <section className='bg-white rounded shadow-sm divide-y'>
          {sorted.map((t, idx) => (
            <div key={t.id} className='flex items-center justify-between p-4'>
              <div className='flex items-center gap-4'>
                <div className='w-8 text-center font-semibold text-gray-700'>{idx + 1}</div>
                <div>
                  <Link href={`/tag/${encodeURIComponent(t.tag.replace('#', ''))}`} className='text-lg font-medium text-sky-600'>{t.tag}</Link>
                  <div className='text-xs text-gray-500'>Trending topic</div>
                </div>
              </div>
              <div className='text-sm text-gray-600'>{t.score} mentions</div>
            </div>
          ))}
        </section>
      </main>
    </div>
  )
}
