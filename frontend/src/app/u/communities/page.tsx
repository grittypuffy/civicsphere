'use client'
import CreatePost from '@/components/CreatePost'
import { CreateIssueRequest, Issue, PostData } from '@/lib/types'
import {
  createIssue,
  createPost,
  downvotePost,
  getCommunityIssues,
  getCommunityPosts,
  upvoteIssue,
  upvotePost
} from '@/lib/utils'
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardHeader,
  Input,
  SelectTabData,
  SelectTabEvent,
  Tab,
  TabList,
  Text,
  Textarea
} from '@fluentui/react-components'
import {
  ArrowUpRegular,
  EditRegular,
  ImageRegular,
  ThumbDislikeRegular,
  ThumbLikeRegular
} from '@fluentui/react-icons'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { loadable } from 'jotai/utils'
import { useEffect, useState } from 'react'

// Local constants
const COMMUNITIES = ['NewYork', 'LosAngeles', 'Chicago', 'Houston', 'Phoenix']

// Atoms for state management
const selectedCommunityAtom = atom('NewYork')
const communityPostsAtom = atom<Promise<PostData[]>>(Promise.resolve([]))
const communityIssuesAtom = atom<Promise<Issue[]>>(Promise.resolve([]))
const loadablePostsAtom = loadable(communityPostsAtom)
const loadableIssuesAtom = loadable(communityIssuesAtom)

export default function CommunitiesPage() {
  const selectedCommunity = useAtomValue(selectedCommunityAtom)
  const setSelectedCommunity = useSetAtom(selectedCommunityAtom)
  const posts = useAtomValue(loadablePostsAtom)
  const issues = useAtomValue(loadableIssuesAtom)
  const setPosts = useSetAtom(communityPostsAtom)
  const setIssues = useSetAtom(communityIssuesAtom)

  const [tab, setTab] = useState<'posts' | 'issues'>('posts')
  const [isCreateOpen, setCreateOpen] = useState(false)
  const [newIssueTitle, setNewIssueTitle] = useState('')
  const [newIssueDescription, setNewIssueDescription] = useState('')
  const [newIssueAssignees, setNewIssueAssignees] = useState('')

  // Load initial data
  useEffect(() => {
    if (selectedCommunity) {
      setPosts(getCommunityPosts(selectedCommunity.toLowerCase()))
      setIssues(getCommunityIssues(selectedCommunity.toLowerCase()))
    }
  }, [selectedCommunity, setPosts, setIssues])

  const handleTabSelect = (event: SelectTabEvent, data: SelectTabData) => {
    setTab(data.value as 'posts' | 'issues')
  }

  async function handleVotePost(postId: string, communityId: string, type: 'up' | 'down') {
    try {
      if (type === 'up') {
        await upvotePost(communityId, postId)
      } else {
        await downvotePost(communityId, postId)
      }
      // Refresh posts data
      setPosts(getCommunityPosts(communityId))
    } catch (error) {
      console.error('Failed to vote on post:', error)
    }
  }

  async function handleUpvoteIssue(issueId: string, communityId: string) {
    try {
      await upvoteIssue(communityId, issueId)
      // Refresh issues data
      setIssues(getCommunityIssues(communityId))
    } catch (error) {
      console.error('Failed to vote on issue:', error)
    }
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

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Open': return 'warning'
      case 'Closed': return 'brand'
      case 'Resolved': return 'success'
      default: return 'subtle'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className='flex gap-4'>
      {/* Left topics list */}
      <aside className='w-56 bg-pink-50 p-3 rounded-md h-[calc(100vh-40px)] overflow-auto'>
        <Text size={500} weight="semibold" className='mb-3 block'>List of Topics</Text>
        <ul className='space-y-2'>
          {COMMUNITIES.map((community: string) => (
            <li key={community}>
              <Button
                appearance={selectedCommunity === community ? 'primary' : 'subtle'}
                onClick={() => setSelectedCommunity(community)}
                className='w-full justify-start'
              >
                {community}
              </Button>
            </li>
          ))}
        </ul>
      </aside>

      {/* Center column */}
      <main className='flex-1 max-w-5xl mx-auto p-3 lg:p-5 flex flex-col'>
        <div className='flex items-center justify-between mb-3'>
          <Text size={600} weight="semibold">Community: {selectedCommunity}</Text>
          <TabList selectedValue={tab} onTabSelect={handleTabSelect}>
            <Tab value="posts">Posts</Tab>
            <Tab value="issues">Issues</Tab>
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
                      <Avatar name="You" color="brand" />
                      <div className='flex-1'>
                        <Button
                          appearance='outline'
                          onClick={() => setCreateOpen(true)}
                          className='w-full h-20 justify-start'
                        >
                          Start a post in {selectedCommunity}
                        </Button>
                        <div className='mt-3 flex items-center justify-between'>
                          <div className='flex gap-2'>
                            <Button
                              appearance='subtle'
                              size='small'
                              icon={<ImageRegular />}
                              onClick={() => setCreateOpen(true)}
                            >
                              Photo
                            </Button>
                            <Button
                              appearance='subtle'
                              size='small'
                              icon={<EditRegular />}
                              onClick={() => setCreateOpen(true)}
                            >
                              Write
                            </Button>
                          </div>
                          <Button
                            appearance='primary'
                            onClick={() => setCreateOpen(true)}
                          >
                            Post
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
                    return <Text>Loading posts...</Text>
                  case 'hasError':
                    return <Text>Error loading posts: {String(posts.error)}</Text>
                  case 'hasData':
                    return posts.data.map((post: PostData) => (
                      <Card key={post.post_id} className='mb-4'>
                        <CardHeader
                          header={
                            <div className='flex items-start justify-between w-full'>
                              <div className='flex items-center gap-3'>
                                <Avatar name={post.user_id} />
                                <div>
                                  <Text weight="semibold">{post.title}</Text>
                                  <Text size={200} className='text-gray-500 block'>
                                    {formatDate(post.created_at)}
                                  </Text>
                                </div>
                              </div>
                              <div className='flex items-center gap-2'>
                                <Button
                                  appearance='subtle'
                                  icon={<ThumbLikeRegular />}
                                  onClick={() => handleVotePost(post.post_id, selectedCommunity.toLowerCase(), 'up')}
                                >
                                  {post.upvote}
                                </Button>
                                <Button
                                  appearance='subtle'
                                  icon={<ThumbDislikeRegular />}
                                  onClick={() => handleVotePost(post.post_id, selectedCommunity.toLowerCase(), 'down')}
                                >
                                  {post.downvote}
                                </Button>
                              </div>
                            </div>
                          }
                          description={
                            <div className='space-y-2'>
                              <Text>{post.description}</Text>
                              <div className='flex flex-wrap gap-1'>
                                {post.tags.map((tag, index) => (
                                  <Badge key={index} appearance="tint" size="small">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          }
                        />
                      </Card>
                    ))
                }
              })()}
            </section>
          )}

          {tab === 'issues' && (
            <section>
              <div className='mb-4'>
                <Text size={500} weight="semibold" className='mb-2 block'>Raise an issue</Text>
                <Text size={300} className='text-gray-600 mb-3 block'>
                  People and authorities can respond; community members can upvote if they have the same problem.
                </Text>

                {/* Inline raise form */}
                <Card className='p-3 mb-4'>
                  <div className='grid gap-3'>
                    <Input
                      placeholder='Short title (e.g. Broken street light on 5th Ave)'
                      value={newIssueTitle}
                      onChange={(e) => setNewIssueTitle(e.target.value)}
                    />
                    <Textarea
                      placeholder='Describe the issue and any details (where, when, impact)...'
                      value={newIssueDescription}
                      onChange={(e) => setNewIssueDescription(e.target.value)}
                      rows={3}
                    />
                    <Input
                      placeholder='Who should take action? (e.g. Sanitation Dept, Local Councilor)'
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
                        Clear
                      </Button>
                      <Button
                        appearance='primary'
                        disabled={!newIssueTitle.trim()}
                        onClick={() => handleRaiseIssue(
                          newIssueTitle.trim(),
                          newIssueDescription.trim(),
                        )}
                      >
                        Raise
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>

              {(() => {
                switch (issues.state) {
                  case 'loading':
                    return <Text>Loading issues...</Text>
                  case 'hasError':
                    return <Text>Error loading issues: {String(issues.error)}</Text>
                  case 'hasData':
                    return (
                      <div className='grid gap-4'>
                        {issues.data.map((issue: Issue) => (
                          <Card key={issue.issue_id} className='p-4'>
                            <div className='flex items-start justify-between'>
                              <div className='flex-1'>
                                <div className='flex items-start gap-3'>
                                  <Avatar name={issue.user_id} />
                                  <div className='flex-1'>
                                    <Text weight="semibold" className='block'>{issue.title}</Text>
                                    <Text size={300} className='text-gray-600 block mt-1'>
                                      {issue.description}
                                    </Text>
                                    <div className='mt-2'>
                                      <Badge
                                        appearance="filled"
                                        color={getStatusBadgeColor(issue.status)}
                                        size="small"
                                      >
                                        {issue.status}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className='flex flex-col items-center gap-2 ml-4'>
                                <Button
                                  appearance='subtle'
                                  shape='circular'
                                  icon={<ArrowUpRegular />}
                                  onClick={() => handleUpvoteIssue(issue.issue_id, selectedCommunity.toLowerCase())}
                                />
                                <Text size={200}>{issue.upvote}</Text>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )
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
        userName={'You'}
      />
    </div>
  )
}
