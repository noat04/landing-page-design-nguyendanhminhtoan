import { useEffect, useRef, useState } from 'react'
import { apiFetch } from '../lib/api.js'

const welcomeMessage = {
  id: 'welcome',
  role: 'assistant',
  content: 'Hi, I can help with pricing, availability, and product details. Which product are you interested in?',
}

const quickQuestions = [
  'Which products are in stock?',
  'Recommend options under 20 million VND',
  'Which model is best for photography?',
]

function createMessage(role, content) {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    role,
    content,
  }
}

function buildHistory(messages) {
  return messages
    .filter((message) => message.id !== welcomeMessage.id)
    .slice(-8)
    .map(({ role, content }) => ({ role, content }))
}

function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([welcomeMessage])
  const [draft, setDraft] = useState('')
  const [isSending, setIsSending] = useState(false)
  const inputRef = useRef(null)
  const messagesRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      window.setTimeout(() => inputRef.current?.focus(), 80)
    }
  }, [isOpen])

  useEffect(() => {
    messagesRef.current?.scrollTo({
      top: messagesRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages, isSending])

  const sendMessage = async (text) => {
    const message = text.trim()

    if (!message || isSending) {
      return
    }

    const userMessage = createMessage('user', message)
    const nextMessages = [...messages, userMessage]

    setMessages(nextMessages)
    setDraft('')
    setIsSending(true)

    try {
      const data = await apiFetch('/api/chatbot/message', {
        method: 'POST',
        body: {
          message,
          history: buildHistory(nextMessages),
        },
      })
      const reply = data?.reply || 'I do not have a suitable answer yet. Could you share more about what you need?'
      setMessages((currentMessages) => [...currentMessages, createMessage('assistant', reply)])
    } catch (error) {
      setMessages((currentMessages) => [
        ...currentMessages,
        createMessage(
          'assistant',
          error?.status === 404
            ? 'The chatbot API is not connected yet. Please check backend /api/chatbot/message.'
            : 'The chatbot connection is temporarily unavailable. Please try again later.',
        ),
      ])
    } finally {
      setIsSending(false)
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    sendMessage(draft)
  }

  return (
    <section className={`chatbot-widget ${isOpen ? 'is-open' : ''}`} aria-label="Product consultant chatbot">
      <button
        className="chatbot-toggle"
        type="button"
        aria-expanded={isOpen}
        aria-controls="chatbot-panel"
        aria-label={isOpen ? 'Close product chatbot' : 'Open product chatbot'}
        onClick={() => setIsOpen((currentValue) => !currentValue)}
      >
        {isOpen ? 'x' : '?'}
      </button>

      <div className="chatbot-panel" id="chatbot-panel" hidden={!isOpen}>
        <header className="chatbot-header">
          <div>
            <p>Online</p>
            <h2>Product advisor</h2>
          </div>
          <button type="button" aria-label="Minimize chatbot" onClick={() => setIsOpen(false)}>
            x
          </button>
        </header>

        <div className="chatbot-messages" ref={messagesRef} aria-live="polite">
          {messages.map((message) => (
            <div className={`chatbot-bubble ${message.role}`} key={message.id}>
              {message.content}
            </div>
          ))}
          {isSending ? <div className="chatbot-bubble assistant typing">Typing...</div> : null}
        </div>

        <div className="chatbot-quick-actions" aria-label="Suggested questions">
          {quickQuestions.map((question) => (
            <button type="button" key={question} onClick={() => sendMessage(question)} disabled={isSending}>
              {question}
            </button>
          ))}
        </div>

        <form className="chatbot-form" onSubmit={handleSubmit}>
          <label>
            <span>Your question</span>
            <input
              ref={inputRef}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Ask a product question..."
              autoComplete="off"
              maxLength={1000}
            />
          </label>
          <button type="submit" disabled={!draft.trim() || isSending}>
            Send
          </button>
        </form>
      </div>
    </section>
  )
}

export default ChatbotWidget
