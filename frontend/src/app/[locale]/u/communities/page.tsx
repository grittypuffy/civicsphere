'use client'
import CreateIssue from '@/components/CreateIssue'
import CreatePost from '@/components/CreatePost'
import { Feeds } from '@/components/Feeds'
import { Community, Issue, PostData } from '@/lib/types'

import {
  getCommunities,
  getCommunityIssues,
  getCommunityPosts,
  getTags
} from '@/lib/utils'
import {
  Button,
  Dialog,
  DialogTrigger,
  Dropdown,
  Option,
  SelectTabData,
  SelectTabEvent,
  Tab,
  TabList
} from '@fluentui/react-components'
import {
  AddSquareRegular,
  ArrowClockwiseFilled
} from '@fluentui/react-icons'
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { loadable } from 'jotai/utils'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { useEffect, useState } from 'react'

// Atoms for state management
const communitiesAtom = atom<Promise<Community[]>>(getCommunities())
const selectedCommunityAtom = atom('')
const selectedCommunityIdAtom = atom('')
const communityPostsAtom = atom<Promise<PostData[]>>(Promise.resolve([]))
const communityIssuesAtom = atom<Promise<Issue[]>>(Promise.resolve([]))
const tagsAtom = atom<Promise<Record<string, string>>>(getTags())
const selectedTagAtom = atom('')
const loadableCommunitiesAtom = loadable(communitiesAtom)
const loadablePostsAtom = loadable(communityPostsAtom)
const loadableIssuesAtom = loadable(communityIssuesAtom)
const loadableTagsAtom = loadable(tagsAtom)

export default function CommunitiesPage() {
  const t = useTranslations('communities')
  const [selectedCommunity, setSelectedCommunity] = useAtom(selectedCommunityAtom)
  const [selectedCommunityId, setSelectedCommunityId] = useAtom(selectedCommunityIdAtom)
  const posts = useAtomValue(loadablePostsAtom)
  const issues = useAtomValue(loadableIssuesAtom)
  const setPosts = useSetAtom(communityPostsAtom)
  const setIssues = useSetAtom(communityIssuesAtom)
  const communities = useAtomValue(loadableCommunitiesAtom)
  const tags = useAtomValue(loadableTagsAtom)
  const [selectedTag, setSelectedTag] = useAtom(selectedTagAtom)

  const [tab, setTab] = useState<'posts' | 'issues'>('posts')

  // Load initial data
  useEffect(() => {
    if (selectedCommunityId) {
      setPosts(getCommunityPosts(selectedCommunityId))
      setIssues(getCommunityIssues(selectedCommunityId))
    }
  }, [selectedCommunityId, setPosts, setIssues])

  const handleTabSelect = (_: SelectTabEvent, data: SelectTabData) => {
    setTab(data.value as 'posts' | 'issues')
  }

  const handleRefresh = () => {
    if (selectedCommunityId) {
      setPosts(getCommunityPosts(selectedCommunityId))
      setIssues(getCommunityIssues(selectedCommunityId))
    }
  }

  return (
    <>
      <div className='flex flex-col items-center justify-between'>
        <div className='min-w-dvw lg:min-w-5xl'>
          <div className='mx-auto p-5 md:p-8 lg:px-12 flex flex-col'>
            <p className='text-lg lg:text-xl'>Explore the </p>
            <h1 className='text-4xl lg:text-5xl font-bold'>
              Communities!
            </h1>
            <div className='flex flex-col lg:flex-row items-start lg:items-center gap-3 mt-4'>
              <Dropdown
                value={selectedCommunity ?? ''}
                onOptionSelect={(_, data) => {
                  setSelectedCommunity(data.optionText || '')
                  setSelectedCommunityId(data.optionValue || '')
                }}
                placeholder="Choose a community"
                className="w-full lg:w-auto"
              >
                {(() => {
                  switch (communities.state) {
                    case 'loading':
                      return <Option key="loading" disabled>Loading...</Option>
                    case 'hasError':
                      return <Option key="error">Error loading communities</Option>
                    case 'hasData':
                      return communities.data.map((community: Community) => (
                        <Option key={community._id} value={community._id} text={community.community_name}>
                          {community.community_name}
                        </Option>
                      ))
                  }
                })()}
              </Dropdown>

              {tab === 'posts' && (
                <Dropdown
                  value={selectedTag ?? ''}
                  onOptionSelect={(_, data) => setSelectedTag(data.optionValue || '')}
                  placeholder="Filter by tag"
                  multiselect={true}
                  positioning={'below'}
                  className='w-full lg:w-auto'
                >
                  {(() => {
                    switch (tags.state) {
                      case 'loading':
                        return <Option key="loading" disabled>Loading...</Option>
                      case 'hasError':
                        return <Option key="error">Error loading tags</Option>
                      case 'hasData':
                        return Object.entries(tags.data).map(([key, value]) => (
                          <Option key={key} value={key}>
                            {value}
                          </Option>
                        ))
                    }
                  })()}
                </Dropdown>
              )}

              <div className='flex items-center gap-3'>
                <Button
                  appearance='primary'
                  shape='circular'
                  size='small'
                  onClick={handleRefresh}
                  aria-label="Refresh community content"
                  icon={<ArrowClockwiseFilled />}
                  disabled={!selectedCommunityId}
                />
                <p className='text-sm'>Want fresh community updates?</p>
              </div>
            </div>
          </div>

          <div className='p-x5 md:p-x8 lg:px-12 flex justify-between'>
            <TabList selectedValue={tab} onTabSelect={handleTabSelect}>
              <Tab value="posts">{t('tabPosts')}</Tab>
              <Tab value="issues">{t('tabIssues')}</Tab>
            </TabList>
            <div className='p-3'>
              <Dialog>
                <DialogTrigger>
                  <Button
                    appearance='primary'
                    icon={<AddSquareRegular />}
                    shape='circular'
                    size='medium'
                    aria-label="Create new post or issue in a community"
                    disabled={!selectedCommunityId}
                  >
                    Create
                  </Button>
                </DialogTrigger>
                {tab === 'posts' ?
                  <CreatePost communityId={selectedCommunityId} /> :
                  <CreateIssue communityId={selectedCommunityId} />
                }
              </Dialog>
            </div>
          </div>

          <div
            id='communities-container'
            className='min-h-[70vh] max-h-[90dvh] overflow-auto'
          >
            {tab === 'posts' && (
              <>
                {(() => {
                  if (selectedCommunity === '') {
                    return (
                      <div className='p-8 flex flex-col items-center justify-center text-center min-h-[50vh] gap-3'>
                        <Image
                          src='/images/choose.svg'
                          alt='Choose a community'
                          width={300}
                          height={300}
                          className='mx-auto mb-4'
                        />
                        <p className='text-gray-600 text-sm lg:text-lg'>Please select a community to view posts.</p>
                      </div>)
                  }
                  switch (posts.state) {
                    case 'loading':
                      return <div className='p-4'>{t('loadingPosts')}</div>
                    case 'hasError':
                      return (
                        <div className='p-4'>
                          <div className='mb-4 text-red-600 px-5'>
                            <span>
                              {t('errorPosts', { message: String(posts.error) })}
                            </span>
                            <span> Showing fallback data instead.</span>
                          </div>
                          <Feeds />
                        </div>
                      )
                    case 'hasData':
                      const filteredPosts = selectedTag
                        ? posts.data.filter((post: PostData) => post.tags.includes(selectedTag))
                        : posts.data

                      return <Feeds posts={filteredPosts} />
                  }
                })()}
              </>
            )}

            {tab === 'issues' && (
              <>
                {(() => {
                  if (selectedCommunity === '') {
                    return (
                      <div className='p-8 flex flex-col items-center justify-center text-center min-h-[50vh] gap-3'>
                        <Image
                          src='/images/choose.svg'
                          alt='Choose a community'
                          width={300}
                          height={300}
                          className='mx-auto mb-4'
                        />
                        <p className='text-gray-600 text-sm lg:text-lg'>Please select a community to view posts.</p>
                      </div>
                    )
                  }
                  switch (issues.state) {
                    case 'loading':
                      return <div className='p-4'>{t('loadingIssues')}</div>
                    case 'hasError':
                      return (
                        <div className='p-4'>
                          <div className='mb-4 text-red-600 px-5'>
                            <span>
                              {t('errorIssues', { message: String(issues.error) })}
                            </span>
                            <span> Showing fallback data instead.</span>
                          </div>
                          <Feeds />
                        </div>
                      )
                    case 'hasData':
                      return <Feeds issues={issues.data} />
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
