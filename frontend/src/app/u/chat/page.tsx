'use client'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@fluentui/react-components'

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
    <div className='flex-1 flex flex-col'>
      <div ref={listRef} className='flex-1 overflow-y-auto pr-2 space-y-3'>
        {messages.map(m => (
          <div key={m.id} className={`flex items-start ${m.self ? 'justify-end' : 'justify-start'}`}>
            {!m.self && (
              <div className='mr-3'>
                <div className='w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-sm text-ui-muted'>{m.author[0]}</div>
              </div>
            )}

            <div className={`${m.self ? 'bg-brand text-white self-end' : 'bg-white text-ui-heading'} max-w-[70%] p-3 rounded-lg shadow-sm`}>
              <div className='text-xs mb-1 opacity-90'>{m.author}</div>
              <div className='whitespace-pre-wrap'>
                {m.text || (!m.self && isSending ? (
                  <span className='opacity-60 italic'>Typing...</span>
                ) : m.text)}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className='mt-4'>
        <div className='flex gap-3 items-start'>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder='Enter text to chat with AI'
            className='flex-1 p-3 rounded-lg border border-slate-200 min-h-12 resize-vertical'
          />

          <div className='flex gap-2 items-center'>
            <Button appearance={isRecording ? 'primary' : 'outline'} onClick={toggleMic}>{isRecording ? 'Recording…' : '🎤'}</Button>
            <Button appearance='primary' onClick={handleSend} disabled={isSending || !input.trim()}>{isSending ? 'Sending…' : 'Send'}</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
