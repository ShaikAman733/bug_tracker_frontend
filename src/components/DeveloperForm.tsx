import { useState, type FormEvent } from 'react'
import type { Developer, DeveloperPayload } from '../types'

interface DeveloperFormProps {
  initial?: Developer
  submitting: boolean
  errorMessage: string | null
  onSubmit: (payload: DeveloperPayload) => void
  onCancel: () => void
}

export function DeveloperForm({ initial, submitting, errorMessage, onSubmit, onCancel }: DeveloperFormProps) {
  const [username, setUsername] = useState(initial?.username ?? '')
  const [email, setEmail] = useState(initial?.email ?? '')
  const [designation, setDesignation] = useState(initial?.designation ?? '')
  const [isActive, setIsActive] = useState(initial?.is_active ?? true)
  const [password, setPassword] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onSubmit({
      username,
      email,
      designation: designation || null,
      is_active: isActive,
      role: 'DEVELOPER',
      ...(password ? { password } : {}),
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

      {!initial && (
        <div className="alert alert-info">
          Set a password here — the account can log in with it immediately.
        </div>
      )}

      <div className="form-grid">
        <div className="field field-full">
          <label htmlFor="dev-username">Username</label>
          <input
            id="dev-username"
            className="input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="field field-full">
          <label htmlFor="dev-email">Email</label>
          <input
            id="dev-email"
            type="email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="field field-full">
          <label htmlFor="dev-password">
            {initial ? 'Reset password (leave blank to keep current)' : 'Password'}
          </label>
          <input
            id="dev-password"
            type="password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={initial ? '••••••••' : 'Set a login password'}
            required={!initial}
            autoComplete="new-password"
          />
        </div>

        <div className="field field-full">
          <label htmlFor="dev-designation">Designation</label>
          <input
            id="dev-designation"
            className="input"
            value={designation ?? ''}
            onChange={(e) => setDesignation(e.target.value)}
            placeholder="e.g. SDE Intern"
          />
        </div>

        <div className="field field-full">
          <label htmlFor="dev-active">
            <input
              id="dev-active"
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              style={{ marginRight: 8 }}
            />
            Active account
          </label>
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? <span className="spinner" /> : initial ? 'Save changes' : 'Add developer'}
        </button>
      </div>
    </form>
  )
}