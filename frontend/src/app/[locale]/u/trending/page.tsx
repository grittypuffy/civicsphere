'use client'
import { Feeds } from '@/components/Feeds';
import { getTrendingPosts, getTrendingTopics } from '@/lib/utils';
import { Button, Tab, TabList, TabValue } from '@fluentui/react-components';
import { ArrowClockwiseFilled } from '@fluentui/react-icons';
import { atom, useAtomValue, useSetAtom } from 'jotai';
import { loadable } from 'jotai/utils';
import { SetStateAction, useState } from 'react';
import { useTranslations } from 'next-intl';

const trendingPostsAtom = atom(getTrendingPosts());
const loadableTrendingPostsAtom = loadable(trendingPostsAtom);
const trendingTopicsAtom = atom(getTrendingTopics());
const loadableTrendingTopicsAtom = loadable(trendingTopicsAtom);

export default function TrendingPage() {
  const t = useTranslations('trending');
  const trendingPosts = useAtomValue(loadableTrendingPostsAtom);
  const trendingTopics = useAtomValue(loadableTrendingTopicsAtom);
  const setTrendingPosts = useSetAtom(trendingPostsAtom);
  const [selectedTab, setSelectedTab] = useState<TabValue>('trending-posts');

  const [sortBy, setSortBy] = useState<'rank' | 'score'>('rank')

  return (
    <>
      <div className='flex flex-col items-center justify-between'>
        <div className='min-w-dvw lg:min-w-5xl'>
          <div className='mx-auto  p-3 md:p-5 lg:p-8 flex flex-col'>
            <p className='text-lg lg:text-xl'>{t('discoverWhat')}</p>
            <h1 className='text-4xl lg:text-5xl font-bold'>
              {t('trendingNow')}
            </h1>
            <div className='flex items-center gap-3 mt-2'>
              <Button
                appearance='primary'
                shape='circular'
                size='small'
                onClick={() => {
                  setTrendingPosts(getTrendingPosts())
                }}
                aria-label={t('refreshAria')}
                icon={
                  <ArrowClockwiseFilled />}
              />
              <p className='text-sm'>{t('refreshHint')}</p>
            </div>
          </div>

          <div className='px-3 md:px-5 lg:px-8'>
            <TabList selectedValue={selectedTab} onTabSelect={(_, data) => setSelectedTab(data.value)}>
              <Tab value="trending-posts">{t('tabPosts')}</Tab>
              <Tab value="trending-topics">{t('tabTopics')}</Tab>
            </TabList>
          </div>

          <div
            id='trending-container'
            className='min-h-[70vh] max-h-[90dvh] overflow-auto'
          >
            {selectedTab === 'trending-posts' && (
              <>
                {(() => {
                  switch (trendingPosts.state) {
                    case 'loading':
                      return <div className='p-4'>{t('loadingPosts')}</div>
                    case 'hasError':
                      return (
                        <div className='p-4'>
                          <div className='mb-4 text-red-600 px-5'>
                            <span>
                              {t('errorPosts')} {String(trendingPosts.error)}
                            </span>
                            <span> {t('fallbackNotice')}</span>
                          </div>
                          <Feeds />
                        </div>
                      )
                    case 'hasData':
                      return (
                        <Feeds posts={trendingPosts.data} />
                      )
                  }
                })()}
              </>
            )}

            {selectedTab === 'trending-topics' && (
              <>
                {(() => {
                  switch (trendingTopics.state) {
                    case 'loading':
                      return <div className='p-4'>{t('loadingTopics')}</div>
                    case 'hasError':
                      return (
                        <div className='p-4'>
                          <div className='text-red-600'>
                            {t('errorTopics')} {String(trendingTopics.error)}
                          </div>
                        </div>
                      )
                    case 'hasData':
                      const sortedTopics = [...trendingTopics.data].sort((a, b) =>
                        sortBy === 'rank' ? a.count - b.count : b.count - a.count
                      )
                      return (
                        <div className='p-4'>
                          <div className='flex items-center justify-between mb-4'>
                            <div className='flex items-center gap-3'>
                              <label className='text-sm'>{t('sortLabel')}</label>
                              <select value={sortBy} onChange={e => setSortBy(e.target.value as SetStateAction<'rank' | 'score'>)} className='p-2  rounded'>
                                <option value='rank'>{t('sortByRank')}</option>
                                <option value='score'>{t('sortByActivity')}</option>
                              </select>
                            </div>
                          </div>

                          <section className='bg-white rounded shadow-sm divide-y'>
                            {sortedTopics.map((topic, i) => (
                              <div key={i} className='flex items-center justify-between p-4'>
                                <div className='flex items-center gap-4'>
                                  <div className='w-8 text-center font-semibold text-gray-700'>{i + 1}</div>
                                  <div>
                                    <a href={`/tag/${encodeURIComponent(topic.tag.replace('#', ''))}`} className='text-lg font-medium text-brand'>{topic.tag}</a>
                                    <div className='text-xs text-gray-500'>{t('trendingTopic')}</div>
                                  </div>
                                </div>
                                <div className='text-sm text-gray-600'>{topic.count} {t('mentions')}</div>
                              </div>
                            ))}
                          </section>
                        </div>
                      )
                  }
                })()}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
