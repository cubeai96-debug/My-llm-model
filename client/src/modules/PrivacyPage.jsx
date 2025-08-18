import { useEffect, useState } from 'react'
import { api } from '../services/api.js'

export default function PrivacyPage() {
  const [policy, setPolicy] = useState(null)
  useEffect(() => { api.getPrivacy().then(setPolicy) }, [])
  if (!policy) return <div className="mt-4">Yükleniyor...</div>
  return (
    <div className="mt-4 space-y-2">
      <h2 className="text-xl font-semibold">Gizlilik</h2>
      <p className="text-gray-300">{policy.policy}</p>
      <pre className="bg-neutral-800 p-3 rounded text-sm overflow-auto">{JSON.stringify(policy.data, null, 2)}</pre>
    </div>
  )
}

