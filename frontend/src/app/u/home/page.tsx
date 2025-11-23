'use client'
import { Feeds } from '@/components/Feeds';
import { feedAtom, loadableFeedAtom, userAtom } from '@/lib/store';
import { getFeeds } from '@/lib/utils';
import { Button } from '@fluentui/react-components';
import { ArrowClockwiseFilled } from '@fluentui/react-icons';
import { useAtomValue, useSetAtom } from 'jotai';

export default function Page() {
  const { username } = useAtomValue(userAtom)
  const feeds = useAtomValue(loadableFeedAtom)
  const setFeeds = useSetAtom(feedAtom)

  return (
    <>
      <div className='flex flex-col items-center justify-between'>
        <div className='min-w-dvw lg:min-w-5xl border'>
          <div className='mx-auto border p-3 md:p-5 lg:p-8 flex flex-col'>
            <p className='text-lg lg:text-xl'>Welcome back!</p>
            <h1 className='text-4xl lg:text-5xl font-bold'>
              Hello, {username ? username : "Dummy Name"}!
            </h1>
            <div className='flex items-center gap-3 mt-2'>
              <Button
                appearance='primary'
                shape='circular'
                size='small'
                onClick={() => {
                  setFeeds(getFeeds())
                }}
                aria-label='Refresh feeds'
                icon={
                  <ArrowClockwiseFilled />}
              />
              <p className='text-sm'>Want to have new feed?</p>
            </div>
          </div>
          <div
            id='feeds-container'
            className='min-h-[70vh] max-h-[90dvh] border overflow-auto'
          >
            {(() => {
              switch (feeds.state) {
                case 'loading':
                  return <div>Loading feeds...</div>
                case 'hasError':
                  return (
                    <>
                      <div>Error loading feeds: {String(feeds.error)}</div>
                      <Feeds />
                    </>
                  )
                case 'hasData':
                  return (
                    <Feeds posts={feeds.data} />
                  )
              }
            })()}
          </div>
        </div>
      </div>
    </>
  )
}
