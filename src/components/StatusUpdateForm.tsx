import { useState, type FormEvent } from 'react'
import type { Bug, BugStatus, BugStatusUpdatePayload } from '../types'

interface StatusUpdateFormProps {
  bug: Bug
  submitting: boolean
  errorMessage: string | null
  onSubmit: (payload: BugStatusUpdatePayload) => void
  onCancel: () => void
}

const STATUSES: BugStatus[] = ['Open', 'In Progress', 'Resolved', 'Closed']

export function StatusUpdateForm({ bug, submitting, errorMessage, onSubmit, onCancel }: StatusUpdateFormProps) {
  const [status, setStatus] = useState<BugStatus>(bug.status)
  const [resolutionComment, setResolutionComment] = useState(bug.resolution_comment ?? '')
  const [localError, setLocalError] = useState<string | null>(null)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setLocalError(null)

    if (status === 'Closed' && !resolutionComment.trim()) {
      setLocalError('Closed bugs must contain a resolution comment.')
      return
    }

    onSubmit({
      status,
      resolution_comment: resolutionComment || null,
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      {(localError || errorMessage) && (
        <div className="alert alert-danger">{localError ?? errorMessage}</div>
      )}

      <div className="field" style={{ marginBottom: 16 }}>
        <label htmlFor="status-select">Status</label>
        <select
          id="status-select"
          className="select"
          value={status}
          onChange={(e) => setStatus(e.target.value as BugStatus)}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="status-comment">
          Resolution comment{status === 'Closed' && ' (required to close)'}
        </label>
        <textarea
          id="status-comment"
          className="textarea"
          value={resolutionComment}
          onChange={(e) => setResolutionComment(e.target.value)}
          placeholder="Optional notes..."
        />
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? <span className="spinner" /> : 'Update status'}
        </button>
      </div>
    </form>
  )
}