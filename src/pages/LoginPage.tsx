import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Bug } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export function LoginPage() {
  const { isAuthenticated, login, loading, error } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  if (isAuthenticated) {
    const redirectTo = (location.state as { from?: Location })?.from?.pathname ?? '/'
    return <Navigate to={redirectTo} replace />
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const ok = await login({ username, password })
    if (ok) navigate('/', { replace: true })
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-mark">
          <div className="sidebar-brand-mark" style={{ background: '#0e6b5c' }}>
            <Bug size={15} color="white" />
          </div>
          <div>
            <h2 style={{ fontSize: 18 }}>BugTracker Lite</h2>
            <span className="page-eyebrow" style={{ marginBottom: 0 }}>
              Tika Solutions
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="alert alert-danger">{error}</div>}

          <div className="field" style={{ marginBottom: 14 }}>
            <label htmlFor="username">Username</label>
            <input
              id="username"
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              required
              autoComplete="username"
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', marginTop: 20, padding: '10px 14px' }}
          >
            {loading ? <span className="spinner" /> : 'Sign in'}
          </button>
        </form>

        <div className="login-terminal">authenticating against /api/login/ via JWT</div>
      </div>
    </div>
  )
}