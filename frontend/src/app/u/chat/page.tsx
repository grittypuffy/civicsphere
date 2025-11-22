'use client'
import { useEffect, useRef, useState } from 'react'
import { Avatar, Button, Hamburger, Tooltip } from '@fluentui/react-components'
import SideBar from '@/components/SideBar'
import Link from 'next/link'

type Message = {
  id: number
  author: string
  text: string
  self?: boolean
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, author: 'Bot', text: 'Hello — ask me about local civic issues.', self: false },
    { id: 2, author: 'You', text: 'Hi — how do I report a pothole?', self: true }
  ])

  const [isNavOpen, setNavOpen] = useState(false)

  const [input, setInput] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const listRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    // scroll to bottom when messages change
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [messages])

  async function handleSend() {
    const text = input.trim()
    if (!text) return
    setIsSending(true)
    const userMessage: Message = { id: Date.now(), author: 'You', text, self: true }
    setMessages(m => [...m, userMessage])
    setInput('')

    // Create a placeholder bot message that will be updated as chunks arrive
    const botMessageId = Date.now() + 1
    const botMessage: Message = { id: botMessageId, author: 'Bot', text: '', self: false }
    setMessages(m => [...m, botMessage])

    try {
      // Make API call to streaming endpoint
      const response = await fetch('/api/v1/chat/new', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: text }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // Read the streaming response
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('Response body is not readable')
      }

      let accumulatedText = ''

      while (true) {
        const { done, value } = await reader.read()

        if (done) break

        // Decode the chunk and append to accumulated text
        const chunk = decoder.decode(value, { stream: true })
        accumulatedText += chunk

        // Update the bot message with accumulated text
        setMessages(m =>
          m.map(msg =>
            msg.id === botMessageId
              ? { ...msg, text: accumulatedText }
              : msg
          )
        )
      }

      setIsSending(false)
    } catch (error) {
      console.error('Error sending message:', error)
      // Update bot message with error
      setMessages(m =>
        m.map(msg =>
          msg.id === botMessageId
            ? { ...msg, text: 'Sorry, there was an error processing your request. Please try again.' }
            : msg
        )
      )
      setIsSending(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // simple mic toggle (simulated) — in future wire to Web Speech or audio capture
  function toggleMic() {
    if (isRecording) {
      // stop recording and simulate a captured phrase
      setIsRecording(false)
      const captured = 'This is a simulated voice message transcribed.'
      setInput(prev => (prev ? prev + ' ' + captured : captured))
    } else {
      setIsRecording(true)
    }
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
            name={'You'}
            activeAppearance='ring-shadow'
            active='active'
            color='platinum'
            aria-label={`User avatar for You`}
            className='cursor-pointer'
          />
        </Link>
      </header>

      <main className='mx-auto w-full lg:w-3/4 p-4 flex-1 flex flex-col'>
        <div ref={listRef} style={{ flex: 1, overflowY: 'auto', paddingRight: 8 }}>
          {messages.map(m => (
            <div key={m.id} style={{ display: 'flex', marginBottom: 12, justifyContent: m.self ? 'flex-end' : 'flex-start' }}>
              {!m.self && (
                <div style={{ marginRight: 8 }}>
                  <Avatar name={m.author} />
                </div>
              )}
              <div style={{ maxWidth: '70%', background: m.self ? '#0369a1' : '#ffffff', color: m.self ? 'white' : 'black', padding: 12, borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize: 13, marginBottom: 6, opacity: 0.9 }}>{m.author}</div>
                <div style={{ whiteSpace: 'pre-wrap' }}>
                  {m.text || (!m.self && isSending ? (
                    <span style={{ opacity: 0.6, fontStyle: 'italic' }}>Typing...</span>
                  ) : m.text)}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder='Enter text to chat with AI'
              style={{ flex: 1, padding: 10, borderRadius: 8, border: '1px solid #e5e7eb', minHeight: 48, resize: 'vertical' }}
            />

            <div style={{ display: 'flex', gap: 8 }}>
              <Button appearance={isRecording ? 'primary' : 'outline'} onClick={toggleMic}>{isRecording ? 'Recording…' : '🎤'}</Button>
              <Button appearance='primary' onClick={handleSend} disabled={isSending || !input.trim()}>{isSending ? 'Sending…' : 'Send'}</Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
