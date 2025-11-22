'use client'
import { useState } from 'react'
import CreatePost from '@/components/CreatePost'

type PostItem = {
  id: number
  author: string
  avatarColor?: string
  contentText?: string
  image?: string
  votesUp: number
  votesDown: number
  userVote: 'none' | 'up' | 'down'
}

type IssueItem = {
  id: number
  title: string
  description?: string
  assignees?: string
  status: 'open' | 'in-progress' | 'resolved'
  votes: number
}

export default function CommunitiesPage() {
  const [selectedCommunity, setSelectedCommunity] = useState('NewYork - Agri')
  const [tab, setTab] = useState<'posts' | 'issues'>('posts')
  const [isCreateOpen, setCreateOpen] = useState(false)
  const [newIssueTitle, setNewIssueTitle] = useState('')
  const [newIssueDescription, setNewIssueDescription] = useState('')
  const [newIssueAssignees, setNewIssueAssignees] = useState('')

  const communities = [
    'NewYork',
    'Agri',
    'Pharma',
    'LGBTQ',
    'Sustainability',
    'Local Business',
    'Housing',
  ]

  const samplePosts: PostItem[] = Array.from({ length: 6 }).map((_, i) => ({
    id: i + 1,
    author: `User ${i + 1}`,
    avatarColor: ['emerald', 'violet', 'amber', 'sky'][i % 4],
    contentText: `Sample community post ${i + 1} for ${selectedCommunity}. This demonstrates the posts view in the community.`,
    votesUp: (i * 7 + 3) % 30,
    votesDown: (i * 2 + 1) % 8,
    userVote: 'none'
  }))

  const [posts, setPosts] = useState<PostItem[]>(samplePosts)

  const sampleIssues: IssueItem[] = [
    { id: 1, title: 'Street light broken at 5th Ave', description: 'The light has been out for 3 weeks.', status: 'open', votes: 12 },
    { id: 2, title: 'Garbage pickup missed', description: 'No pickup last Tuesday', status: 'in-progress', votes: 7 },
    { id: 3, title: 'Pothole near school', description: 'Large pothole by the crosswalk', status: 'open', votes: 21 }
  ]
  const [issues, setIssues] = useState<IssueItem[]>(sampleIssues)

  function votePost(id: number, type: 'up' | 'down') {
    setPosts(posts.map(p => {
      if (p.id !== id) return p
      let votesUp = p.votesUp
      let votesDown = p.votesDown
      let userVote = p.userVote
      if (type === 'up') {
        if (userVote === 'up') { votesUp = Math.max(0, votesUp - 1); userVote = 'none' }
        else if (userVote === 'down') { votesDown = Math.max(0, votesDown - 1); votesUp = votesUp + 1; userVote = 'up' }
        else { votesUp = votesUp + 1; userVote = 'up' }
      } else {
        if (userVote === 'down') { votesDown = Math.max(0, votesDown - 1); userVote = 'none' }
        else if (userVote === 'up') { votesUp = Math.max(0, votesUp - 1); votesDown = votesDown + 1; userVote = 'down' }
        else { votesDown = votesDown + 1; userVote = 'down' }
      }
      return { ...p, votesUp, votesDown, userVote }
    }))
  }

  function upvoteIssue(id: number) {
    setIssues(issues.map(i => i.id === id ? { ...i, votes: i.votes + 1 } : i))
  }

  // raise issue with optional assignees (who should take action)
  function raiseIssue(title: string, description = '', assignees = '') {
    const next: IssueItem = { id: issues.length + 1, title, description, assignees: assignees || undefined, status: 'open', votes: 0 }
    setIssues([next, ...issues])
  }

  function handleCreatePost(content: string) {
    if (!content.trim()) return
    const newPost: PostItem = { id: posts.length + 1, author: 'You', avatarColor: 'sky', contentText: content, votesUp: 0, votesDown: 0, userVote: 'none' }
    setPosts([newPost, ...posts])
    setCreateOpen(false)
  }

  return (
    <div className='flex gap-4'>
      {/* Left topics list */}
      <aside className='w-56 bg-pink-50 p-3 rounded-md h-[calc(100vh-40px)] overflow-auto'>
        <div className='font-semibold mb-3'>List of Topics</div>
        <ul className='space-y-2'>
          {communities.map(c => (
            <li key={c}>
              <button onClick={() => setSelectedCommunity(`${c} - ${c === 'NewYork' ? 'Agri' : 'General'}`)} className={`w-full text-left p-2 rounded ${selectedCommunity.includes(c) ? 'bg-sky-100' : 'hover:bg-slate-50'}`}>
                {c}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* Center column */}
      <main className='flex-1'>
        <div className='flex items-center justify-between mb-3'>
          <h2 className='text-xl font-semibold text-ui-heading'>Community: {selectedCommunity}</h2>
          <div className='flex gap-2'>
            <button className={`px-4 py-2 rounded ${tab === 'posts' ? 'bg-sky-100' : 'bg-white'}`} onClick={() => setTab('posts')}>Posts</button>
            <button className={`px-4 py-2 rounded ${tab === 'issues' ? 'bg-sky-100' : 'bg-white'}`} onClick={() => setTab('issues')}>Issues</button>
          </div>
        </div>

        {/* make center scrollable independently */}
        <div className='max-h-[calc(100vh-140px)] overflow-auto pr-2'>
          {tab === 'posts' && (
            <section>
              <div className='card p-4 mb-4'>
                <div className='flex items-start gap-3'>
                  <div className='w-12 h-12 rounded-full bg-brand flex items-center justify-center text-white'>Y</div>
                  <div className='flex-1'>
                    <div onClick={() => setCreateOpen(true)} role='button' tabIndex={0} className='w-full p-3 border rounded h-20 text-ui-muted flex items-center'>
                      Start a post in {selectedCommunity}
                    </div>
                    <div className='mt-3 flex items-center justify-between'>
                      <div className='flex gap-2 text-sm text-gray-600'>
                        <button onClick={() => setCreateOpen(true)} className='px-3 py-1 rounded bg-green-50'>🖼️ Photo</button>
                        <button onClick={() => setCreateOpen(true)} className='px-3 py-1 rounded bg-sky-50'>✍️ Write</button>
                      </div>
                      <div className='flex gap-2'>
                        <button onClick={() => setCreateOpen(true)} className='btn-primary'>Post</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {posts.map(p => (
                <article key={p.id} className='card p-4 mb-4'>
                  <header className='flex items-start justify-between'>
                    <div className='flex items-center gap-3'>
                      <div className={`w-12 h-12 rounded-full bg-${p.avatarColor}-400 flex items-center justify-center text-white`}>{p.author[0]}</div>
                      <div>
                        <div className='font-semibold'>{p.author}</div>
                        <div className='text-xs text-gray-500'>Posted just now</div>
                      </div>
                    </div>
                    <div className='ml-auto flex items-center gap-2'>
                      <button onClick={() => votePost(p.id, 'up')} className={`px-2 py-1 rounded ${p.userVote === 'up' ? 'bg-green-200' : 'bg-green-50'}`}>▲ {p.votesUp}</button>
                      <button onClick={() => votePost(p.id, 'down')} className={`px-2 py-1 rounded ${p.userVote === 'down' ? 'bg-red-200' : 'bg-red-50'}`}>▼ {p.votesDown}</button>
                    </div>
                  </header>
                  <div className='mt-3'>
                    <p className='text-ui-heading'>{p.contentText}</p>
                  </div>
                </article>
              ))}
            </section>
          )}

          {tab === 'issues' && (
            <section>
              <div className='mb-4'>
                <h3 className='text-lg font-semibold mb-2'>Raise an issue</h3>
                <div className='text-sm text-gray-600 mb-3'>People and authorities can respond; community members can upvote if they have the same problem.</div>

                {/* Inline raise form: title, description, assignees */}
                <div className='card p-3 mb-4'>
                  <div className='grid gap-2'>
                    <input aria-label='Issue title' value={newIssueTitle} onChange={e => setNewIssueTitle(e.target.value)} placeholder='Short title (e.g. Broken street light on 5th Ave)' className='p-2 border rounded' />
                    <textarea aria-label='Issue description' value={newIssueDescription} onChange={e => setNewIssueDescription(e.target.value)} placeholder='Describe the issue and any details (where, when, impact)...' className='p-2 border rounded min-h-20'></textarea>
                    <input aria-label='Assigned to' value={newIssueAssignees} onChange={e => setNewIssueAssignees(e.target.value)} placeholder='Who should take action? (e.g. Sanitation Dept, Local Councilor)' className='p-2 border rounded' />
                    <div className='flex items-center justify-end gap-2'>
                      <button onClick={() => { setNewIssueTitle(''); setNewIssueDescription(''); setNewIssueAssignees('') }} className='px-3 py-2 rounded border text-ui-muted hover:bg-slate-50'>Clear</button>
                      <button disabled={!newIssueTitle.trim()} onClick={() => { raiseIssue(newIssueTitle.trim(), newIssueDescription.trim(), newIssueAssignees.trim()); setNewIssueTitle(''); setNewIssueDescription(''); setNewIssueAssignees('') }} className='px-3 py-2 rounded btn-primary disabled:opacity-50'>Raise</button>
                    </div>
                  </div>
                </div>
              </div>

              <div className='grid gap-4'>
                {issues.map(issue => (
                  <div key={issue.id} className='card p-4 flex items-start justify-between'>
                    <div>
                      <div className='flex items-center gap-2'>
                        <div className='w-10 h-10 rounded-full bg-sky-200' />
                        <div>
                          <div className='font-semibold'>{issue.title}</div>
                          <div className='text-sm text-gray-600'>{issue.description}</div>
                          {issue.assignees && <div className='text-sm text-gray-700 mt-1'><strong>Assigned to:</strong> {issue.assignees}</div>}
                        </div>
                      </div>
                      <div className='mt-2'>
                        <span className={`px-2 py-1 rounded text-sm ${issue.status === 'open' ? 'bg-yellow-50 text-yellow-800' : issue.status === 'in-progress' ? 'bg-sky-50 text-sky-800' : 'bg-green-50 text-green-800'}`}>{issue.status}</span>
                      </div>
                    </div>
                    <div className='flex flex-col items-center gap-2'>
                      <button onClick={() => upvoteIssue(issue.id)} className='w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center text-lg'>▲</button>
                      <div className='text-sm text-gray-700'>{issue.votes}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Right spacer / info column */}
      <aside className='w-6 bg-emerald-50 rounded-md' />

      <CreatePost isOpen={isCreateOpen} onClose={() => setCreateOpen(false)} onSubmit={({ text, tags, files }) => handleCreatePost(text)} userName={'You'} />
    </div>
  )
}
