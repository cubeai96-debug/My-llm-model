import { useEffect, useState } from 'react'
import { api } from '../services/api.js'

export default function HistoryPage() {
  const [conversations, setConversations] = useState([])

  useEffect(() => {
    api.getConversations().then(({ conversations }) => setConversations(conversations))
  }, [])

  return (
    <div className="mt-4">
      <h2 className="text-xl font-semibold mb-3">Sohbet Geçmişi</h2>
      <ul className="space-y-2">
        {conversations.map(c => (
          <li key={c.id} className="p-3 rounded bg-neutral-800 flex items-center justify-between">
            <span>{c.title}</span>
            <span className="text-sm text-gray-400">{new Date(c.created_at).toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

