import { useEffect, useState } from 'react'
import { Routes, Route, NavLink, useNavigate, useLocation } from 'react-router-dom'
import ChatPage from './ChatPage.jsx'
import HistoryPage from './HistoryPage.jsx'
import SettingsPage from './SettingsPage.jsx'
import AccountPage from './AccountPage.jsx'
import PrivacyPage from './PrivacyPage.jsx'
import TwitterPage from './TwitterPage.jsx'

function NavBar() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  useEffect(() => { setOpen(false) }, [location])
  return (
    <nav className="fixed top-0 left-0 right-0 h-14 bg-neutral-800 flex items-center px-4 shadow z-50">
      <button aria-label="Menüyü aç" className="text-gray-300 md:hidden mr-3" onClick={() => setOpen(true)}>
        <i className="fas fa-bars" />
      </button>
      <span className="text-white font-semibold text-xl select-none">qube</span>
      {open && (
        <div className="fixed inset-0 bg-black/40 md:hidden" onClick={() => setOpen(false)} />
      )}
      <aside className={`fixed top-0 left-0 h-screen w-64 bg-neutral-800 p-6 shadow-lg z-50 transform transition-transform ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:h-auto md:w-64`}>
        <div className="text-gray-200 text-2xl font-bold mb-6 hidden md:block">qube</div>
        <button aria-label="Menüyü kapat" className="text-gray-300 mb-6 md:hidden" onClick={() => setOpen(false)}>
          <i className="fas fa-times" />
        </button>
        <ul className="space-y-4 text-gray-300">
          <li><NavLink to="/" className={({isActive}) => `block hover:text-green-500 transition ${isActive ? 'text-green-500' : ''}`}>Sohbet</NavLink></li>
          <li><NavLink to="/mini-twitter" className={({isActive}) => `block hover:text-green-500 transition ${isActive ? 'text-green-500' : ''}`}>MiniTwitter</NavLink></li>
          <li><NavLink to="/history" className={({isActive}) => `block hover:text-green-500 transition ${isActive ? 'text-green-500' : ''}`}>Geçmiş</NavLink></li>
          <li><NavLink to="/settings" className={({isActive}) => `block hover:text-green-500 transition ${isActive ? 'text-green-500' : ''}`}>Ayarlar</NavLink></li>
          <li><NavLink to="/account" className={({isActive}) => `block hover:text-green-500 transition ${isActive ? 'text-green-500' : ''}`}>Hesap</NavLink></li>
          <li><NavLink to="/privacy" className={({isActive}) => `block hover:text-green-500 transition ${isActive ? 'text-green-500' : ''}`}>Gizlilik</NavLink></li>
        </ul>
      </aside>
    </nav>
  )
}

export default function App() {
  return (
    <div className="min-h-screen bg-neutral-900 text-gray-200">
      <NavBar />
      <main className="pt-14 md:pl-64 flex flex-col items-center">
        <div className="w-full max-w-2xl px-4">
          <Routes>
            <Route path="/" element={<ChatPage />} />
            <Route path="/mini-twitter" element={<TwitterPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}

