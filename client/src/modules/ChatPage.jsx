import { useEffect, useRef, useState } from 'react'
import { api } from '../services/api.js'

export default function ChatPage() {
  const [conversationId, setConversationId] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const textareaRef = useRef(null)

  useEffect(() => {
    async function bootstrap() {
      const { conversations } = await api.getConversations()
      let conv = conversations[0]
      if (!conv) {
        const { conversation } = await api.createConversation('Yeni Sohbet')
        conv = conversation
      }
      setConversationId(conv.id)
      const { messages } = await api.getMessages(conv.id)
      setMessages(messages)
    }
    bootstrap()
  }, [])

  useEffect(() => {
    if (!textareaRef.current) return
    const el = textareaRef.current
    el.style.height = 'auto'
    const lineHeight = parseInt(getComputedStyle(el).lineHeight) || 24
    el.style.height = Math.min(el.scrollHeight, lineHeight * 5 + 16) + 'px'
  }, [input])

  async function onSend(e) {
    e.preventDefault()
    if (!input.trim() || !conversationId) return
    const text = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: text }])
    setLoading(true)
    try {
      const { reply } = await api.postMessage(conversationId, text)
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2 mt-4">
      <p className="text-center font-semibold text-xl">nasıl başlamak istersin?</p>
      <div className="space-y-2 max-h-[60vh] overflow-y-auto p-2 bg-neutral-800 rounded">
        {messages.map((m, idx) => (
          <div key={idx} className={m.role === 'user' ? 'text-right' : 'text-left'}>
            <span className={`inline-block px-3 py-2 rounded ${m.role === 'user' ? 'bg-green-600 text-white' : 'bg-neutral-700 text-gray-100'}`}>{m.content}</span>
          </div>
        ))}
        {loading && <div className="text-left text-gray-400">yazıyor...</div>}
      </div>
      <form onSubmit={onSend} className="relative">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Mesajınızı yazın..."
          className="w-full border border-neutral-700 rounded pr-14 pl-3 py-2 bg-neutral-800 text-gray-200 resize-none"
          rows={1}
        />
        <button type="submit" aria-label="Mesaj gönder" className="absolute top-0 right-0 h-full px-4 bg-white text-black rounded-r">
          <i className="fas fa-paper-plane" />
        </button>
      </form>
    </div>
  )
}

