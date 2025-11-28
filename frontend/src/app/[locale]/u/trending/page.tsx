'use client'
import { Feeds } from '@/components/Feeds';
import { getTrendingPosts, getTrendingTopics } from '@/lib/utils';
import { Button, Tab, TabList, TabValue, Text } from '@fluentui/react-components';
import { ArrowClockwiseFilled } from '@fluentui/react-icons';
import { atom, useAtomValue, useSetAtom } from 'jotai';
import { loadable } from 'jotai/utils';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useState } from 'react';

const trendingPostsAtom = atom(getTrendingPosts());
const loadableTrendingPostsAtom = loadable(trendingPostsAtom);
const trendingTopicsAtom = atom(getTrendingTopics());
const loadableTrendingTopicsAtom = loadable(trendingTopicsAtom);

export default function TrendingPage() {
  const t = useTranslations('trending');
  const trendingPosts = useAtomValue(loadableTrendingPostsAtom);
  const trendingTopics = useAtomValue(loadableTrendingTopicsAtom);
  const setTrendingPosts = useSetAtom(trendingPostsAtom);
  const setTrendingTopics = useSetAtom(trendingTopicsAtom);
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
                  if (selectedTab === 'trending-posts') {
                    setTrendingPosts(getTrendingPosts())
                  } else {
                    setTrendingTopics(getTrendingTopics())
                  }
                }}
                aria-label={t('refreshAria')}
                icon={
                  <ArrowClockwiseFilled />}
              />
              <p className='text-sm'>{t('refreshHint')}</p>
            </div>
          </div>

          <div className='px-3 md:px-5 lg:px-8'>
            <TabList selectedValue={selectedTab ?? 'rank'} onTabSelect={(_, data) => setSelectedTab(data.value)}>
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
                      return (
                        <div className='flex flex-col items-center justify-center gap-3 p-8 min-h-[50vh]'>
                          <Image
                            src='/images/trending.svg'
                            alt='Loading'
                            width={300}
                            height={300}
                          />
                          <Text size={400} className="text-gray-600">
                            {t('loadingPosts')}
                          </Text>
                        </div>
                      )
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
                      return (
                        <div className='flex flex-col items-center justify-center gap-3 p-8 min-h-[50vh]'>
                          <Image
                            src='/images/trending_topic.svg'
                            alt='Loading'
                            width={300}
                            height={300}
                          />
                          <Text size={400} className="text-gray-600">
                            {t('loadingTopics')}
                          </Text>
                        </div>
                      )
                    case 'hasError':
                      return (
                        <div className='p-4'>
                          <div className='text-red-600'>
                            {t('errorTopics')} {String(trendingTopics.error)}
                          </div>
                        </div>
                      )
                    case 'hasData': return (
                      <div className='space-y-4 p-3 md:p-5 lg:p-8'>
                        {trendingTopics.data.map((topic, i) => (
                          <div key={i} className='bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow'>
                            <div className='flex items-center justify-between'>
                              <div className='flex items-center gap-4'>
                                <div className='w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center'>
                                  <span className='text-sm font-semibold text-blue-600'>#{i + 1}</span>
                                </div>
                                <div>
                                  <a
                                    href={`/tag/${encodeURIComponent(topic.tag.replace('#', ''))}`}
                                    className='text-lg font-medium text-blue-600 hover:text-blue-800 hover:underline'
                                  >
                                    {topic.tag}
                                  </a>
                                  <div className='text-xs text-gray-500 mt-1'>{t('trendingTopic')}</div>
                                </div>
                              </div>
                              <div className='text-sm font-medium text-gray-600'>
                                {topic.count} {t('mentions')}
                              </div>
                            </div>
                          </div>
                        ))}
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
