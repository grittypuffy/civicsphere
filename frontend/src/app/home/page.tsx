'use client'
import SideBar from '@/lib/components/SideBar';
import { Avatar, Hamburger, Tooltip } from '@fluentui/react-components';
import { useState } from 'react';

export default function Page() {
  const userName = 'Dummy Name'
  const [isNavOpen, setNavOpen] = useState(false)
  return (
    <div className='bg-gray-200 min-h-screen flex flex-col'>
      <SideBar isNavOpen={isNavOpen} setNavOpen={setNavOpen} />
      <div className='flex justify-between p-3 lg:p-5 xl:p-8 border'>
        <Tooltip
          content="Open Navigation bar"
          relationship="label"
          positioning="after"
        >
          <Hamburger onClick={() => setNavOpen(true)} />
        </Tooltip>
        <Avatar name={userName} activeAppearance='ring-shadow' active='active' color='platinum' />
      </div>
      <div className='border mx-auto min-w-4xl h-full'>
        <div className='flex flex-col p-3 lg:p-5 xl:p-8'>
          <h1 className='text-xl lg:text-2xl font-semibold'>Welcome back!</h1>
          <div className='bg-radial bg-clip-text from-blue-500 to-green-500'>
            <p className='font-extrabold text-2xl lg:text-4xl text-transparent text-clip'>{userName}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
