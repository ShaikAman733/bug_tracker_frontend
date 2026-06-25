import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  FolderKanban,
  Bug,
  Users,
  LogOut,
  Sun,
  Moon
} from 'lucide-react'

import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/bugs', label: 'Bugs', icon: Bug },
  { to: '/developers', label: 'Developers', icon: Users },
]

const THEME_KEY = 'btl_theme' // 'dark' | 'light'

function getInitialDarkMode(): boolean {
  const saved = localStorage.getItem(THEME_KEY)
  if (saved === 'light') return false
  if (saved === 'dark') return true
  return true // default to dark when nothing saved yet
}

export function Layout() {
  // 1. Only extract 'user' and 'logout' from your context
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [darkMode, setDarkMode] = useState(getInitialDarkMode)

  useEffect(() => {
    document.body.classList.toggle('light-theme', !darkMode)
    localStorage.setItem(THEME_KEY, darkMode ? 'dark' : 'light')
  }, [darkMode])

  // 2. Safely grab the properties from the 'user' object
  const displayName = user?.username ?? 'User'
  const displayRole = user?.role === 'ADMINISTRATOR' ? 'Administrator' : 'Developer'
  const avatarLetter = displayName.charAt(0).toUpperCase()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="app-shell">
      <header className="topnav">

      <div className="topnav-brand">
        <div className="topnav-brand-mark">
          <Bug size={18} />
        </div>
        {/* 3. Added the missing class name here so your custom CSS applies */}
        <span className="topnav-brand-text">BugTracker Lite</span>
      </div>

        <nav className="topnav-links">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `topnav-link ${isActive ? 'active' : ''}`
              }
            >
              <Icon size={16} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="topnav-actions">

          <button
            className="icon-btn"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? (
              <Sun size={16} />
            ) : (
              <Moon size={16} />
            )}
          </button>

          <button className="icon-btn" onClick={handleLogout} title="Log out">
            <LogOut size={16} />
          </button>

          <div className="user-chip">
            <div className="user-chip-avatar">
              {avatarLetter}
            </div>

            <div className="user-chip-meta">
              {displayName}
              <small>{displayRole}</small>
            </div>
          </div>
        </div>
      </header>

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  )
}