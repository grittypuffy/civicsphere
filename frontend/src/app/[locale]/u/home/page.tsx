'use client'
import { Feeds } from '@/components/Feeds';
import { userIssueUpvotesAtom, userNameAtom, userPostDownvotesAtom, userPostUpvotesAtom, userPrefsAtom } from '@/lib/store';
import { getFeeds, getUserIssueUpvotes, getUserPostDownvotes, getUserPostUpvotes, getUserPreferences } from '@/lib/utils';
import { Button } from '@fluentui/react-components';
import { ArrowClockwiseFilled } from '@fluentui/react-icons';
import { atom, useAtomValue, useSetAtom } from 'jotai';
import { loadable } from 'jotai/utils';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';

const feedAtom = atom(getFeeds());
const loadableFeedAtom = loadable(feedAtom);

export default function Page() {
  const t = useTranslations('homePage');
  const username = useAtomValue(userNameAtom)
  const feeds = useAtomValue(loadableFeedAtom)
  const setFeeds = useSetAtom(feedAtom)
  const setPostUpvotes = useSetAtom(userPostUpvotesAtom)
  const setPostDownvotes = useSetAtom(userPostDownvotesAtom)
  const setIssueUpvotes = useSetAtom(userIssueUpvotesAtom)
  const setUserPrefs = useSetAtom(userPrefsAtom)

  useEffect(() => {
    setFeeds(getFeeds())
    setPostUpvotes(getUserPostUpvotes())
    setPostDownvotes(getUserPostDownvotes())
    setIssueUpvotes(getUserIssueUpvotes())
    setUserPrefs(getUserPreferences())
  }, [])
  return (
    <>
      <div className='flex flex-col items-center justify-between'>
        <div className='min-w-dvw lg:min-w-5xl'>
          <div className='mx-auto  p-3 md:p-5 lg:p-8 flex flex-col'>
            <p className='text-lg lg:text-xl'>{t('welcomeBack')}</p>
            <h1 className='text-4xl lg:text-5xl font-bold'>
              {t('greeting', { name: username || t('placeholderName') })}
            </h1>
            <div className='flex items-center gap-3 mt-2'>
              <Button
                appearance='primary'
                shape='circular'
                size='small'
                onClick={() => {
                  setFeeds(getFeeds())
                }}
                aria-label={t('refreshAria')}
                icon={
                  <ArrowClockwiseFilled />}
              />
              <p className='text-sm'>{t('refreshHint')}</p>
            </div>
          </div>
          <div
            id='feeds-container'
            className='min-h-[70vh] max-h-[90dvh] overflow-auto'
          >
            {(() => {
              switch (feeds.state) {
                case 'loading':
                  return <div>{t('loadingFeeds')}</div>
                case 'hasError':
                  return (
                    <div className='p-4'>
                      <div className='mb-4 text-red-600 px-5'>
                        <span>
                          {t('errorLoading', { message: String(feeds.error) })}
                        </span>
                        <span> {t('fallbackNotice')}</span>
                      </div>
                      <Feeds />
                    </div>
                  )
                case 'hasData':
                  return (
                    <Feeds posts={feeds.data} showVoted={true} />
                  )
              }
            })()}
          </div>
        </div>
      </div>
    </>
  )
}
