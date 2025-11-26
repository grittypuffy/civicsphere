'use client'
import LocaleSwitcher from '@/components/LocaleSwitcher'
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
        <header className='sticky top-0 z-10 grid grid-cols-3 items-center p-3 lg:p-5 border-b bg-navbar text-white'>
          <div className='justify-self-start'>
            <Tooltip
              content="Open Navigation bar"
              relationship="label"
              positioning="after"
            >
              <Hamburger
                onClick={() => setNavOpen(true)}
                className='text-white fill-white'
                aria-label="Open Navigation bar"
                style={{ color: 'white' }}
              />
            </Tooltip>
          </div>

          <div className='justify-self-center'>
            <h1 className='font-semibold text-lg'>CivicSphere</h1>
          </div>

          <div className='justify-self-end flex items-center gap-2'>
            <LocaleSwitcher variant="navbar" />
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
          </div>
        </header>
      </div>
      <div className='flex flex-col w-full flex-1 overflow-hidden h-full min-w-dvw lg:max-w-5xl mx-auto'>
        {children}
      </div>
    </div>
  )
}
