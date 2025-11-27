'use client'
import LocaleSwitcher from '@/components/LocaleSwitcher'
import SideBar from '@/components/SideBar'
import { navStateAtom, userNameAtom } from '@/lib/store'
import { Avatar, Hamburger, Link, Tooltip } from '@fluentui/react-components'
import { useAtomValue, useSetAtom } from 'jotai'

export default function Layout({ children }: { children: React.ReactNode }) {
  const setNavOpen = useSetAtom(navStateAtom)
  const userName = useAtomValue(userNameAtom)
  return (
    <div className='flex flex-col h-full flex-1'>
      <div>
        <SideBar />
        <header className='sticky top-0 z-10 grid grid-cols-3 items-center p-3 lg:p-5 rounded-3xl border-b shadow-xl bg-sky-200 text-black'>
          <div className='justify-self-start p-2 lg:p-0'>
            <Tooltip
              content="Open Navigation bar"
              relationship="label"
              positioning="after"
            >
              <Hamburger
                onClick={() => setNavOpen(true)}
                aria-label="Open Navigation bar"
                style={{ color: 'black' }}
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
