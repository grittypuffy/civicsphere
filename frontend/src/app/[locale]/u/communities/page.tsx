'use client'
import CreatePost from '@/components/CreatePost'
import { Feeds } from '@/components/Feeds'
import { Community, CreateIssueRequest, Issue, PostData } from '@/lib/types'
import {
  createIssue,
  createPost,
  getCommunities,
  getCommunityIssues,
  getCommunityPosts,
  getTags
} from '@/lib/utils'
import {
  Avatar,
  Button,
  Card,
  CardHeader,
  Dropdown,
  Input,
  Option,
  SelectTabData,
  SelectTabEvent,
  Tab,
  TabList,
  Text,
  Textarea
} from '@fluentui/react-components'
import {
  EditRegular,
  ImageRegular
} from '@fluentui/react-icons'
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { loadable } from 'jotai/utils'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

// Local constants
const COMMUNITIES = ['NewYork', 'LosAngeles', 'Chicago', 'Houston', 'Phoenix']

// Atoms for state management
const communitiesAtom = atom<Promise<Community[]>>(getCommunities())
const selectedCommunityAtom = atom('')
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
  const selectedCommunity = useAtomValue(selectedCommunityAtom)
  const setSelectedCommunity = useSetAtom(selectedCommunityAtom)
  const posts = useAtomValue(loadablePostsAtom)
  const issues = useAtomValue(loadableIssuesAtom)
  const setPosts = useSetAtom(communityPostsAtom)
  const setIssues = useSetAtom(communityIssuesAtom)
  const communities = useAtomValue(loadableCommunitiesAtom)
  const tags = useAtomValue(loadableTagsAtom)
  const [selectedTag, setSelectedTag] = useAtom(selectedTagAtom)

  const [tab, setTab] = useState<'posts' | 'issues'>('posts')
  const [isCreateOpen, setCreateOpen] = useState(false)
  const [newIssueTitle, setNewIssueTitle] = useState('')
  const [newIssueDescription, setNewIssueDescription] = useState('')
  const [newIssueAssignees, setNewIssueAssignees] = useState('')

  // Load initial data
  useEffect(() => {
    if (selectedCommunity) {
      setPosts(getCommunityPosts(selectedCommunity))
      setIssues(getCommunityIssues(selectedCommunity))
    }
  }, [selectedCommunity, setPosts, setIssues])

  const handleTabSelect = (_: SelectTabEvent, data: SelectTabData) => {
    setTab(data.value as 'posts' | 'issues')
  }

  async function handleRaiseIssue(title: string, description = '') {
    try {
      const communityId = selectedCommunity.toLowerCase()
      const payload: CreateIssueRequest = {
        title,
        description,
        status: 'Open',
      }
      await createIssue(communityId, payload)
      // Refresh issues data
      setIssues(getCommunityIssues(communityId))
      // Clear form
      setNewIssueTitle('')
      setNewIssueDescription('')
      setNewIssueAssignees('')
    } catch (error) {
      console.error('Failed to create issue:', error)
    }
  }

  async function handleCreatePost(content: string) {
    if (!content.trim()) return
    try {
      const communityId = selectedCommunity.toLowerCase()
      const formData = new FormData()
      await createPost(communityId, 'Post Title', content, formData)
      // Refresh posts data
      setPosts(getCommunityPosts(communityId))
      setCreateOpen(false)
    } catch (error) {
      console.error('Failed to create post:', error)
    }
  }

  return (
    <div className='flex gap-4'>
      {/* Left topics list */}
      <aside className='w-1/6 bg-pink-50 p-3 rounded-md h-[calc(100vh-40px)] overflow-auto'>
        <Dropdown
          value={selectedCommunity}
          onOptionSelect={(_, data) => setSelectedCommunity(data.optionValue || 'New York City')}
          placeholder="Choose a community"
        >
          {(() => {
            switch (communities.state) {
              case 'loading':
                return <Option key="loading" disabled>Loading...</Option>
              case 'hasError':
                return <Option key="error">Error loading communities</Option>
              case 'hasData':
                return communities.data.map((community: Community) => (
                  <Option key={community._id} value={community._id}>
                    {community.community_name}
                  </Option>
                ))
              default:
                return COMMUNITIES.map((community) => (
                  <Option key={community} value={community}>
                    {community}
                  </Option>
                ))
            }
          })()}
        </Dropdown>

        <div className='mt-4'>
          <Text size={400} weight="semibold" className='mb-2 block'>Filter by tag</Text>
          <Dropdown
            value={selectedTag}
            onOptionSelect={(_, data) => setSelectedTag(data.optionValue || '')}
            placeholder="Select a tag"
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
                default:
                  return null
              }
            })()}
          </Dropdown>
        </div>
      </aside>

      {/* Center column */}
      <main className='flex-1 max-w-5xl mx-auto p-3 lg:p-5 flex flex-col'>
        <div className='flex items-center justify-between mb-3'>
          <Text size={600} weight="semibold">{t('communityHeading', { community: selectedCommunity })}</Text>
          <TabList selectedValue={tab} onTabSelect={handleTabSelect}>
            <Tab value="posts">{t('tabPosts')}</Tab>
            <Tab value="issues">{t('tabIssues')}</Tab>
          </TabList>
        </div>

        {/* make center scrollable independently */}
        <div className='max-h-[calc(100vh-140px)] overflow-auto pr-2'>
          {tab === 'posts' && (
            <section>
              <Card className='mb-4'>
                <CardHeader
                  header={
                    <div className='flex items-start gap-3 w-full'>
                      <Avatar name={t('youLabel')} color="brand" />
                      <div className='flex-1'>
                        <Button
                          appearance='outline'
                          onClick={() => setCreateOpen(true)}
                          className='w-full h-20 justify-start'
                        >
                          {t('startPost', { community: selectedCommunity })}
                        </Button>
                        <div className='mt-3 flex items-center justify-between'>
                          <div className='flex gap-2'>
                            <Button
                              appearance='subtle'
                              size='small'
                              icon={<ImageRegular />}
                              onClick={() => setCreateOpen(true)}
                            >
                              {t('photo')}
                            </Button>
                            <Button
                              appearance='subtle'
                              size='small'
                              icon={<EditRegular />}
                              onClick={() => setCreateOpen(true)}
                            >
                              {t('write')}
                            </Button>
                          </div>
                          <Button
                            appearance='primary'
                            onClick={() => setCreateOpen(true)}
                          >
                            {t('postButton')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  }
                />
              </Card>

              {(() => {
                switch (posts.state) {
                  case 'loading':
                    return <Text>{t('loadingPosts')}</Text>
                  case 'hasError':
                    return <Text>{t('errorPosts', { message: String(posts.error) })}</Text>
                  case 'hasData':
                    const filteredPosts = selectedTag
                      ? posts.data.filter((post: PostData) => post.tags.includes(selectedTag))
                      : posts.data

                    return <Feeds posts={filteredPosts} />
                }
              })()}
            </section>
          )}

          {tab === 'issues' && (
            <section>
              <div className='mb-4'>
                <Text size={500} weight="semibold" className='mb-2 block'>{t('raiseIssueTitle')}</Text>
                <Text size={300} className='text-gray-600 mb-3 block'>
                  {t('raiseIssueSubtitle')}
                </Text>

                {/* Inline raise form */}
                <Card className='p-3 mb-4'>
                  <div className='grid gap-3'>
                    <Input
                      placeholder={t('issueTitlePlaceholder')}
                      value={newIssueTitle}
                      onChange={(e) => setNewIssueTitle(e.target.value)}
                    />
                    <Textarea
                      placeholder={t('issueDescriptionPlaceholder')}
                      value={newIssueDescription}
                      onChange={(e) => setNewIssueDescription(e.target.value)}
                      rows={3}
                    />
                    <Input
                      placeholder={t('issueAssigneesPlaceholder')}
                      value={newIssueAssignees}
                      onChange={(e) => setNewIssueAssignees(e.target.value)}
                    />
                    <div className='flex items-center justify-end gap-2'>
                      <Button
                        appearance='secondary'
                        onClick={() => {
                          setNewIssueTitle('')
                          setNewIssueDescription('')
                          setNewIssueAssignees('')
                        }}
                      >
                        {t('clearButton')}
                      </Button>
                      <Button
                        appearance='primary'
                        disabled={!newIssueTitle.trim()}
                        onClick={() => handleRaiseIssue(
                          newIssueTitle.trim(),
                          newIssueDescription.trim(),
                        )}
                      >
                        {t('submitIssueButton')}
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>

              {(() => {
                switch (issues.state) {
                  case 'loading':
                    return <Text>{t('loadingIssues')}</Text>
                  case 'hasError':
                    return <Text>{t('errorIssues', { message: String(issues.error) })}</Text>
                  case 'hasData':
                    return <Feeds issues={issues.data} />
                }
              })()}
            </section>
          )}
        </div>
      </main>

      {/* Right spacer / info column */}
      <aside className='w-6 bg-emerald-50 rounded-md' />

      <CreatePost
        isOpen={isCreateOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={({ text }) => handleCreatePost(text)}
        userName={t('youLabel')}
      />
    </div>
  )
}
