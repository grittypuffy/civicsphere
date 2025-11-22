"use client"
import { FluentProvider, webLightTheme, Avatar, Hamburger, Tooltip } from "@fluentui/react-components";
import SideBar from './SideBar'
import Link from 'next/link'
import { useState } from 'react'

const AppContainer = (
  { children, }: Readonly<{ children: React.ReactNode }>
) => {
  const [isNavOpen, setNavOpen] = useState(false)
  const userName = 'You'

  return (
    <FluentProvider theme={webLightTheme}>
      <div className="page-bg min-h-screen flex flex-col w-full mx-auto overflow-x-hidden">
        <SideBar isNavOpen={isNavOpen} setNavOpen={setNavOpen} />

        <header className='flex justify-between items-center p-3 lg:p-5 xl:p-8 border-b bg-navbar text-white'>
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

        <main className='mx-auto w-full lg:w-3/4 p-4 flex-1'>
          {children}
        </main>
      </div>
    </FluentProvider>
  )
}

export default AppContainer
