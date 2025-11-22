'use client'
import CreatePost from '@/components/CreatePost';
import SideBar from '@/components/SideBar';
import { Avatar, Hamburger, Tooltip } from '@fluentui/react-components';
import Link from 'next/link';
import { useState } from 'react';

export default function Page() {
  const userName = 'Dummy Name'
  const [isNavOpen, setNavOpen] = useState(false)

  // language variable (frontend only) - will be used by translate UI
  const [language] = useState('en')

  type PostItem = {
    id: number
    author: string
    avatarColor?: string
    contentText?: string
    image?: string
    video?: string
    votesUp: number
    votesDown: number
    flagged: boolean
    verification: 'unsure' | 'verified' | 'unverified'
    userVote: 'none' | 'up' | 'down'
    comments: string[]
  }

  // create 10 default posts (mixed types)
  const samplePosts: PostItem[] = Array.from({ length: 10 }).map((_, i) => {
    const base: PostItem = {
      id: i + 1,
      author: `User ${i + 1}`,
      avatarColor: ['emerald', 'violet', 'amber', 'sky', 'rose'][i % 5],
      contentText: i % 3 === 0 ? `This is a short post text number ${i + 1}. Discussing local politics and community issues.` : `Here is a longer piece of text for post ${i + 1}. It demonstrates how text-only or text+media posts will appear in the feed.`,
      image: i % 4 === 1 ? `https://picsum.photos/seed/${i + 1}/800/450` : undefined,
      video: i % 4 === 2 ? `https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4` : undefined,
      // deterministic sample vote counts to avoid SSR/client hydration mismatch
      votesUp: (i * 13 + 7) % 50,
      votesDown: (i * 5 + 2) % 10,
      userVote: 'none',
      flagged: false,
      verification: 'unsure',
      comments: [`Nice post ${i + 1}`, 'Thanks for sharing']
    }
    if (i % 4 === 3) base.contentText = undefined // image-only or video-only
    return base
  })

  const [posts, setPosts] = useState<PostItem[]>(samplePosts)

  // create post modal state
  const [isCreateOpen, setCreateOpen] = useState(false)

  function handleCreatePost(content: string, tags: string[] = [], files: File[] = []) {
    if (!content.trim() && files.length === 0) return
    let imageUrl: string | undefined = undefined
    let videoUrl: string | undefined = undefined
    // prefer first image or video file as preview
    const imgFile = files.find(f => f.type.startsWith('image'))
    const vidFile = files.find(f => f.type.startsWith('video'))
    if (imgFile) imageUrl = URL.createObjectURL(imgFile)
    else if (vidFile) videoUrl = URL.createObjectURL(vidFile)

    const newPost: PostItem = {
      id: posts.length + 1,
      author: 'You',
      avatarColor: 'sky',
      contentText: content || undefined,
      image: imageUrl,
      video: videoUrl,
      votesUp: 0,
      votesDown: 0,
      flagged: false,
      verification: 'unsure',
      userVote: 'none',
      comments: []
    }
    setPosts([newPost, ...posts])
    setCreateOpen(false)
  }

  // helpers for interactions
  function toggleFlag(id: number) {
    setPosts(posts.map(p => p.id === id ? { ...p, flagged: !p.flagged } : p))
  }
  function cycleVerification(id: number) {
    setPosts(posts.map(p => {
      if (p.id !== id) return p
      const next = p.verification === 'unsure' ? 'verified' : p.verification === 'verified' ? 'unverified' : 'unsure'
      return { ...p, verification: next }
    }))
  }
  // voting logic: exclusive up/down. toggles and prevents double-vote.
  function vote(id: number, type: 'up' | 'down') {
    setPosts(posts.map(p => {
      if (p.id !== id) return p
      // copy
      let votesUp = p.votesUp
      let votesDown = p.votesDown
      let userVote = p.userVote || 'none'

      if (type === 'up') {
        if (userVote === 'up') {
          // undo upvote
          votesUp = Math.max(0, votesUp - 1)
          userVote = 'none'
        } else if (userVote === 'down') {
          // switch down -> up
          votesDown = Math.max(0, votesDown - 1)
          votesUp = votesUp + 1
          userVote = 'up'
        } else {
          // fresh upvote
          votesUp = votesUp + 1
          userVote = 'up'
        }
      } else {
        if (userVote === 'down') {
          // undo downvote
          votesDown = Math.max(0, votesDown - 1)
          userVote = 'none'
        } else if (userVote === 'up') {
          // switch up -> down
          votesUp = Math.max(0, votesUp - 1)
          votesDown = votesDown + 1
          userVote = 'down'
        } else {
          // fresh downvote
          votesDown = votesDown + 1
          userVote = 'down'
        }
      }

      return { ...p, votesUp, votesDown, userVote }
    }))
  }
  function addComment(id: number, text: string) {
    if (!text.trim()) return
    setPosts(posts.map(p => p.id === id ? { ...p, comments: [...p.comments, text] } : p))
  }

  // small Post component scoped locally
  function PostCard({ post }: { post: PostItem }) {
    const [showTranslate, setShowTranslate] = useState(false)
    const [showExplain, setShowExplain] = useState(false)
    const [commentText, setCommentText] = useState('')
    return (
      <article className='bg-white rounded-lg shadow-sm p-4 mb-4'>
        <header className='flex items-start justify-between'>
          <div className='flex items-center gap-3'>
            <div className={`w-12 h-12 rounded-full bg-${post.avatarColor}-400 flex items-center justify-center text-white`}>{post.author.split(' ')[0][0]}</div>
            <div>
              <div className='font-semibold'>{post.author}</div>
              <div className='text-xs text-gray-500'>Posted just now</div>
            </div>
          </div>
          <div className='flex gap-2 items-center'>
            <button
              className={`px-3 py-1 text-sm rounded ${post.flagged ? 'bg-red-100 text-red-700' : 'bg-yellow-50 text-yellow-800'}`}
              onClick={() => toggleFlag(post.id)}
              title='Flag for moderation'
            >
              {post.flagged ? 'Flagged' : 'Yet to check'}
            </button>
            <button
              className='px-3 py-1 text-sm rounded bg-slate-50'
              onClick={() => cycleVerification(post.id)}
              title='Toggle verification state'
            >
              {post.verification}
            </button>
          </div>
        </header>

        <div className='mt-4'>
          {post.contentText && <p className='mb-3 text-gray-800'>{post.contentText}</p>}
          {post.image && <img src={post.image} alt='post image' className='w-full max-h-96 object-cover rounded' />}
          {post.video && (
            <video controls className='w-full rounded'>
              <source src={post.video} />
              Your browser does not support the video tag.
            </video>
          )}
        </div>

        <div className='mt-3 flex items-center gap-3'>
          <button className='px-3 py-1 rounded bg-slate-100' onClick={() => setShowTranslate(s => !s)}>Translate ({language})</button>
          <button className='px-3 py-1 rounded bg-slate-100' onClick={() => setShowExplain(s => !s)}>Explain</button>
          <div className='ml-auto flex items-center gap-2'>
            <button
              onClick={() => vote(post.id, 'up')}
              className={`px-2 py-1 rounded ${post.userVote === 'up' ? 'bg-green-200 text-green-900' : 'bg-green-50'}`}
            >
              ▲ {post.votesUp}
            </button>
            <button
              onClick={() => vote(post.id, 'down')}
              className={`px-2 py-1 rounded ${post.userVote === 'down' ? 'bg-red-200 text-red-900' : 'bg-red-50'}`}
            >
              ▼ {post.votesDown}
            </button>
          </div>
        </div>

        {showTranslate && (
          <div className='mt-2 p-3 bg-gray-50 text-sm text-gray-700 rounded'>
            <strong>Translation ({language}):</strong> This is a placeholder translation for the post. Backend will provide real translations later.
          </div>
        )}
        {showExplain && (
          <div className='mt-2 p-3 bg-gray-50 text-sm text-gray-700 rounded'>
            <strong>Explanation:</strong> This is a frontend-only explanation placeholder to help users understand the post.
          </div>
        )}

        <div className='mt-3 border-t pt-3'>
          <div className='mb-2'>
            {post.comments.map((c, idx) => (
              <div key={idx} className='text-sm text-gray-700 mb-1'>
                <span className='font-semibold mr-2'>Commenter:</span>{c}
              </div>
            ))}
          </div>
          <div className='flex gap-2'>
            <input value={commentText} onChange={e => setCommentText(e.target.value)} placeholder='Write a comment...' className='flex-1 p-2 border rounded' />
            <button onClick={() => { addComment(post.id, commentText); setCommentText('') }} className='px-3 py-2 bg-blue-600 text-white rounded'>Comment</button>
          </div>
        </div>
      </article>
    )
  }

  return (
    <div className='bg-gray-200 min-h-screen flex flex-col'>
      <SideBar isNavOpen={isNavOpen} setNavOpen={setNavOpen} />
      <header className='flex justify-between p-3 lg:p-5 xl:p-8 border'>
        <Tooltip
          content="Open Navigation bar"
          relationship="label"
          positioning="after"
        >
          <Hamburger
            onClick={() => setNavOpen(true)}
            aria-label="Open Navigation bar"
          />
        </Tooltip>
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

      <main className='mx-auto w-full lg:w-3/4 p-4'>
        <div className='flex flex-col gap-4'>
          {/* Create Post Box */}
          <section className='bg-white rounded-lg p-4 shadow-sm'>
            <div className='flex items-start gap-3'>
              <Avatar name={userName} color='brand' />
              <div className='flex-1'>
                <div onClick={() => setCreateOpen(true)} role='button' tabIndex={0} className='w-full p-3 border rounded h-20 text-gray-600 flex items-center'>
                  Start a post, ask a doubt related to your local politics
                </div>
                <div className='mt-3 flex items-center justify-between'>
                  <div className='flex gap-2 text-sm text-gray-600'>
                    <button onClick={() => setCreateOpen(true)} className='px-3 py-1 rounded bg-green-50'>🎥 Video</button>
                    <button onClick={() => setCreateOpen(true)} className='px-3 py-1 rounded bg-sky-50'>🖼️ Photo</button>
                    <button onClick={() => setCreateOpen(true)} className='px-3 py-1 rounded bg-rose-50'>✍️ Write</button>
                    <button onClick={() => setCreateOpen(true)} className='px-3 py-1 rounded bg-yellow-50'>😊 Emoji</button>
                  </div>
                  <div className='flex gap-2'>
                    <button onClick={() => setCreateOpen(true)} className='bg-blue-600 text-white px-4 py-2 rounded'>Post</button>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <CreatePost isOpen={isCreateOpen} onClose={() => setCreateOpen(false)} onSubmit={({ text, tags, files }) => handleCreatePost(text, tags, files)} userName={userName} />

          {/* Feed (no internal scroll) */}
          <section>
            {posts.map(p => <PostCard key={p.id} post={p} />)}
          </section>
        </div>
      </main>
    </div>
  )
}
