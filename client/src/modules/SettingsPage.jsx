import { useEffect, useState } from 'react'
import { api } from '../services/api.js'

export default function SettingsPage() {
  const [settings, setSettings] = useState(null)
  const [saving, setSaving] = useState(false)
  const [mt, setMt] = useState({ theme: localStorage.getItem('mt-theme') || 'light', infinite: JSON.parse(localStorage.getItem('mt-infinite') || 'true'), optimistic: JSON.parse(localStorage.getItem('mt-optimistic') || 'true') })

  useEffect(() => { api.getSettings().then(({ settings }) => setSettings(settings)) }, [])

  async function onSave(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const { settings: updated } = await api.updateSettings(settings)
      setSettings(updated)
      localStorage.setItem('mt-theme', mt.theme)
      localStorage.setItem('mt-infinite', JSON.stringify(mt.infinite))
      localStorage.setItem('mt-optimistic', JSON.stringify(mt.optimistic))
    } finally {
      setSaving(false)
    }
  }

  if (!settings) return <div className="mt-4">Yükleniyor...</div>

  return (
    <form onSubmit={onSave} className="space-y-4 mt-4">
      <h2 className="text-xl font-semibold">Ayarlar</h2>
      <fieldset className="border border-neutral-700 rounded p-3">
        <legend className="px-2 text-sm">MiniTwitter</legend>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm mb-1">Tema</label>
            <select className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2" value={mt.theme} onChange={e => setMt({ ...mt, theme: e.target.value })}>
              <option value="light">Açık</option>
              <option value="dark">Koyu</option>
            </select>
          </div>
          <div className="flex items-center gap-2 mt-6">
            <input id="mt-infinite" type="checkbox" checked={mt.infinite} onChange={e => setMt({ ...mt, infinite: e.target.checked })} />
            <label htmlFor="mt-infinite" className="text-sm">Sonsuz kaydırma</label>
          </div>
          <div className="flex items-center gap-2 mt-6">
            <input id="mt-optimistic" type="checkbox" checked={mt.optimistic} onChange={e => setMt({ ...mt, optimistic: e.target.checked })} />
            <label htmlFor="mt-optimistic" className="text-sm">İyimser güncellemeler</label>
          </div>
        </div>
      </fieldset>
      <div>
        <label className="block text-sm mb-1">Model</label>
        <input className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2" value={settings.model} onChange={e => setSettings({ ...settings, model: e.target.value })} />
        <p className="text-xs text-gray-400 mt-1">Örnek: gemma3:latest</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm mb-1">Sıcaklık</label>
          <input type="number" step="0.1" min="0" max="2" className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2" value={settings.temperature} onChange={e => setSettings({ ...settings, temperature: Number(e.target.value) })} />
        </div>
        <div>
          <label className="block text-sm mb-1">Top-p</label>
          <input type="number" step="0.05" min="0" max="1" className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2" value={settings.top_p} onChange={e => setSettings({ ...settings, top_p: Number(e.target.value) })} />
        </div>
      </div>
      <div>
        <label className="block text-sm mb-1">Maksimum token</label>
        <input type="number" min="16" max="32768" className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2" value={settings.max_tokens} onChange={e => setSettings({ ...settings, max_tokens: Number(e.target.value) })} />
      </div>
      <div>
        <label className="block text-sm mb-1">Tema</label>
        <select className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2" value={settings.theme} onChange={e => setSettings({ ...settings, theme: e.target.value })}>
          <option value="dark">Koyu</option>
          <option value="light">Açık</option>
        </select>
      </div>
      <button type="submit" disabled={saving} className="px-4 py-2 rounded bg-green-600 text-white">
        {saving ? 'Kaydediliyor...' : 'Kaydet'}
      </button>
    </form>
  )
}

