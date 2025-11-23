'use client'

import { Avatar, Button, Textarea, Tooltip } from '@fluentui/react-components'
import { atom, useAtom } from 'jotai'
import { useEffect, useRef } from 'react'

import { ChatData } from '@/lib/types'
import { DeleteFilled, MicFilled, MicRegular, SendFilled } from '@fluentui/react-icons'

type MessageWithId = ChatData & { id: number }

// Jotai atom with Sample Messages for testing
const messagesAtom = atom<MessageWithId[]>([
  //   {
  //     id: 1,
  //     role: 'bot',
  //     content: 'Hello! I\'m your AI assistant. How can I help you today?'
  //   },
  //   {
  //     id: 2,
  //     role: 'user',
  //     content: 'Hi there! Can you help me understand how machine learning works?'
  //   },
  //   {
  //     id: 3,
  //     role: 'bot',
  //     content: 'Of course! Machine learning is a subset of artificial intelligence where computers learn to make predictions or decisions by finding patterns in data, rather than being explicitly programmed for every scenario.\n\nThink of it like teaching a child to recognize animals - instead of describing every detail of what makes a cat a cat, you show them many pictures of cats until they learn to identify the patterns themselves.'
  //   },
  //   {
  //     id: 4,
  //     role: 'user',
  //     content: 'That\'s a great analogy! What are the main types of machine learning?'
  //   },
  //   {
  //     id: 5,
  //     role: 'bot',
  //     content: 'There are three main types:\n\n1. **Supervised Learning**: Learning with examples and correct answers (like studying for a test with an answer key)\n\n2. **Unsupervised Learning**: Finding hidden patterns in data without knowing the "right" answer (like grouping customers by shopping habits)\n\n3. **Reinforcement Learning**: Learning through trial and error with rewards and penalties (like training a game-playing AI)\n\nEach type is useful for different kinds of problems!'
  //   },
  //   {
  //     id: 6,
  //     role: 'user',
  //     content: 'This is really helpful! Can you give me a practical example of how supervised learning is used in real life?'
  //   },
  //   {
  //     id: 7,
  //     role: 'bot',
  //     content: 'Absolutely! One great example is email spam detection. The system is trained on thousands of emails that are already labeled as "spam" or "not spam" by humans.\n\nThe algorithm learns to identify patterns like:\n- Certain keywords ("FREE", "URGENT", etc.)\n- Sender reputation\n- Email formatting\n- Links and attachments\n\nOnce trained, it can automatically classify new emails with high accuracy. Gmail, Outlook, and other email services use this technology to protect your inbox!'
  //   },
  //   {
  //     id: 8,
  //     role: 'user',
  //     content: 'That makes sense! What about unsupervised learning? Do you have a good example for that too?'
  //   },
  //   {
  //     id: 9,
  //     role: 'bot',
  //     content: 'Perfect question! A classic example is customer segmentation for marketing.\n\nImagine an online retailer with millions of customers. They feed the algorithm purchase history, browsing behavior, and demographics - but WITHOUT telling it what groups to look for.\n\nThe algorithm might discover patterns like:\n- "Budget-conscious families" who buy in bulk during sales\n- "Tech enthusiasts" who purchase the latest gadgets\n- "Eco-conscious shoppers" who prefer sustainable products\n\nThe company never defined these segments - the algorithm found these hidden patterns on its own! This helps them create targeted marketing campaigns and personalized recommendations.'
  //   }
])

const chatStateAtom = atom({
  input: '',
  isRecording: false,
  isWaiting: false
})

export default function ChatPage() {
  const [messages, setMessages] = useAtom(messagesAtom)
  const [chatState, setChatState] = useAtom(chatStateAtom)
  const { input, isRecording, isWaiting } = chatState
  const listRef = useRef<HTMLDivElement | null>(null)
  
  // Default suggestion prompts to help users start conversations quickly
  const suggestions: string[] = [
    "What's the current situation with housing prices and trends in New York City neighborhoods (e.g., Manhattan) and nearby suburbs?",
    'When are my local elections, how do I cast a ballot, and who is contesting in my area?',
    'What is the role of a federal judge and how does it differ from other political or judicial positions?'
  ]

  useEffect(() => {
    // scroll to bottom when messages change
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [messages])

  function simulateTyping(fullText: string, messageId: number, delay: number = 5) {
    let currentIndex = 0

    const typeNextChar = () => {
      if (currentIndex < fullText.length) {
        const currentText = fullText.substring(0, currentIndex + 1)

        setMessages((m: MessageWithId[]) =>
          m.map((msg: MessageWithId) =>
            msg.id === messageId
              ? { ...msg, content: currentText }
              : msg
          )
        )

        currentIndex++
        setTimeout(typeNextChar, delay)
      } else {
        setChatState(prev => ({ ...prev, isWaiting: false }))
      }
    }

    typeNextChar()
  }

  async function handleSend() {
    const text = input.trim()
    if (!text) return
    setChatState(prev => ({ ...prev, isWaiting: true, input: '' }))
    const userMessage: MessageWithId = { id: Date.now(), role: 'user', content: '' }
    setMessages((m: MessageWithId[]) => [...m, userMessage])

    simulateTyping(text, userMessage.id)

    const botMessageId = Date.now() + 1
    const botMessage: MessageWithId = { id: botMessageId, role: 'bot', content: '' }
    setMessages((m: MessageWithId[]) => [...m, botMessage])

    try {
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

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('Response body is not readable')
      }

      let accumulatedText = ''

      while (true) {
        const { done, value } = await reader.read()

        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        accumulatedText += chunk
      }

      simulateTyping(accumulatedText, botMessageId)
    } catch (error) {
      console.error('Error sending message:', error)
      // Update bot message with error
      simulateTyping('Sorry, there was an error processing your request. Please try again.', botMessageId)
      setChatState(prev => ({ ...prev, isWaiting: false }))
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // simple mic toggle (simulated) — in future wire to Web Speech or audio capture
  function toggleMic() {
    if (isRecording) {
      // stop recording and simulate a captured phrase
      const captured = 'This is a simulated voice message transcribed.'
      setChatState(prev => ({
        ...prev,
        isRecording: false,
        input: prev.input ? prev.input + ' ' + captured : captured
      }))
    } else {
      setChatState(prev => ({ ...prev, isRecording: true }))
    }
  }

  return (
    <div className='min-w-dvw max-w-5xl mx-auto flex flex-col flex-1'>
      <div className='flex flex-col flex-1 min-h-0 items-center w-full'>
        <div ref={listRef} className='w-full max-w-5xl overflow-y-auto pr-2 space-y-3 flex-1 min-h-[70dvh] max-h-[70dvh] p-3 lg:p-6 '>
          {messages.map(m => (
            <div key={m.id} className={`flex items-start ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role !== 'user' && (
                <div className='mr-3'>
                  <Avatar />
                </div>
              )}

              <div className={`${m.role === 'user' ? 'bg-brand text-white self-end' : 'bg-white text-ui-heading'} max-w-[70%] p-3 rounded-lg shadow-sm`}>
                <div className='text-xs mb-1 opacity-90'>{m.role === 'user' ? 'You' : 'Bot'}</div>
                <div className='whitespace-pre-wrap'>
                  {m.content || (m.role !== 'user' && isWaiting ? (
                    <span className='opacity-60 italic'>Typing...</span>
                  ) : m.content)}
                </div>
              </div>

              {m.role === 'user' && (
                <div className='ml-3'>
                  <Avatar />
                </div>
              )}
            </div>
          ))}
        </div>
        <div className='flex grow max-w-4xl w-full'>
          <form className='flex flex-col gap-3 items-start w-full justify-between grow'>
            <div className='flex flex-col w-full p-3 h-full gap-3'>
              <Textarea
                value={input}
                onChange={(_, data) => setChatState(prev => ({ ...prev, input: data.value }))}
                onKeyDown={handleKeyDown}
                placeholder='Enter text to chat with AI'
                className='flex-1 w-full px-24'
                resize='none'
                rows={2}
              />
              <div className='flex justify-between'>
                <Button
                  appearance={isRecording ? 'primary' : 'subtle'}
                  onClick={toggleMic}
                  shape='circular'
                  icon={isRecording ?
                    (<MicFilled />) :
                    (<MicRegular />)
                  }
                />
                <div className='flex gap-2 items-center'>
                  <Tooltip
                    content="Clear chat history"
                    relationship='label'
                    positioning='above'
                  >
                    <Button
                      icon={<DeleteFilled />}
                      appearance='subtle'
                      shape='circular'
                      onClick={() => setMessages([])}
                      disabled={isWaiting || messages.length === 0}
                    />
                  </Tooltip>
                  <Button
                    appearance='subtle'
                    onClick={handleSend}
                    disabled={isWaiting || !input.trim()}
                    shape='circular'
                    icon={
                      <SendFilled />
                    }
                  />
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
