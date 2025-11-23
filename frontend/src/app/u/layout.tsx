'use client'
import SideBar from '@/components/SideBar'
import { navStateAtom } from '@/lib/store'
import { Avatar, Hamburger, Link, Tooltip } from '@fluentui/react-components'
import { useSetAtom } from 'jotai'

export default function Layout({ children }: { children: React.ReactNode }) {
  const setNavOpen = useSetAtom(navStateAtom)
  const userName = 'You'
  return (
    <div className='flex flex-col h-full flex-1'>
      <div>
        <SideBar />
        <header className='sticky top-0 z-10 flex justify-between items-center p-3 lg:p-5 border-b bg-navbar text-white'>
          <Tooltip
            content="Open Navigation bar"
            relationship="label"
            positioning="after"
          >
            <Hamburger
              onClick={() => setNavOpen(true)}
              className='text-white'
              aria-label="Open Navigation bar"
            />
          </Tooltip>

          <div className='flex items-center gap-4'>
            <h1 className='font-semibold text-lg ml-2'>CivicSphere</h1>
          </div>

          <Link href='/u/settings'>
            <Avatar
              name={userName}
              activeAppearance='ring-shadow'
              active='active'
              color='platinum'
              aria-label={`User avatar for ${userName}`}
              className='cursor-pointer'
            />
          </Link>
        </header>
      </div>
      <div className='flex flex-col w-full flex-1 overflow-hidden h-full'>
        {children}
      </div>
    </div>
  )
}
