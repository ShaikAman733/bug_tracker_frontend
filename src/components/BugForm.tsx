import { useState, type FormEvent } from 'react'
import type {
  Bug,
  BugPayload,
  BugPriority,
  BugSeverity,
  BugStatus,
  Developer,
  Project,
} from '../types'

interface BugFormProps {
  initial?: Bug
  projects: Project[]
  developers: Developer[]
  defaultProjectId?: number
  submitting: boolean
  errorMessage: string | null
  onSubmit: (payload: BugPayload) => void
  onCancel: () => void
}

const SEVERITIES: BugSeverity[] = ['Low', 'Medium', 'High', 'Critical']
const PRIORITIES: BugPriority[] = ['Low', 'Medium', 'High']
const STATUSES: BugStatus[] = ['Open', 'In Progress', 'Resolved', 'Closed']

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

export function BugForm({
  initial,
  projects,
  developers,
  defaultProjectId,
  submitting,
  errorMessage,
  onSubmit,
  onCancel,
}: BugFormProps) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [project, setProject] = useState<number | ''>(
    initial?.project ?? defaultProjectId ?? projects[0]?.id ?? '',
  )
  const [developer, setDeveloper] = useState<number | ''>(initial?.developer ?? '')
  const [severity, setSeverity] = useState<BugSeverity>(initial?.severity ?? 'Medium')
  const [priority, setPriority] = useState<BugPriority>(initial?.priority ?? 'Medium')
  const [status, setStatus] = useState<BugStatus>(initial?.status ?? 'Open')
  const [dueDate, setDueDate] = useState(initial?.due_date ?? '')
  const [resolutionComment, setResolutionComment] = useState(initial?.resolution_comment ?? '')
  const [localError, setLocalError] = useState<string | null>(null)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setLocalError(null)

    // Mirrors BugSerializer.validate() in tracker/serializers.py
    if (dueDate && dueDate < todayIso()) {
      setLocalError('Due date cannot be in the past.')
      return
    }
    if (status === 'Closed' && !resolutionComment.trim()) {
      setLocalError('Closed bugs must contain a resolution comment.')
      return
    }
    if (!project) {
      setLocalError('Please select a project.')
      return
    }

    onSubmit({
      title,
      description: description || null,
      project: project as number,
      developer: developer === '' ? null : (developer as number),
      severity,
      priority,
      status,
      due_date: dueDate || null,
      resolution_comment: resolutionComment || null,
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      {(localError || errorMessage) && (
        <div className="alert alert-danger">{localError ?? errorMessage}</div>
      )}

      <div className="form-grid">
        <div className="field field-full">
          <label htmlFor="bug-title">Title</label>
          <input
            id="bug-title"
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="e.g. Login fails with valid credentials"
          />
        </div>

        <div className="field field-full">
          <label htmlFor="bug-desc">Description</label>
          <textarea
            id="bug-desc"
            className="textarea"
            value={description ?? ''}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Steps to reproduce, expected vs. actual behavior..."
          />
        </div>

        <div className="field">
          <label htmlFor="bug-project">Project</label>
          <select
            id="bug-project"
            className="select"
            value={project}
            onChange={(e) => setProject(e.target.value ? Number(e.target.value) : '')}
            required
          >
            <option value="" disabled>
              Select a project
            </option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="bug-developer">Assigned developer</label>
          <select
            id="bug-developer"
            className="select"
            value={developer}
            onChange={(e) => setDeveloper(e.target.value ? Number(e.target.value) : '')}
          >
            <option value="">Unassigned</option>
            {developers.map((d) => (
              <option key={d.id} value={d.id}>
                {d.username}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="bug-severity">Severity</label>
          <select
            id="bug-severity"
            className="select"
            value={severity}
            onChange={(e) => setSeverity(e.target.value as BugSeverity)}
          >
            {SEVERITIES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="bug-priority">Priority</label>
          <select
            id="bug-priority"
            className="select"
            value={priority}
            onChange={(e) => setPriority(e.target.value as BugPriority)}
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="bug-status">Status</label>
          <select
            id="bug-status"
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
          <label htmlFor="bug-due">Due date</label>
          <input
            id="bug-due"
            type="date"
            className="input"
            value={dueDate ?? ''}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        <div className="field field-full">
          <label htmlFor="bug-resolution">
            Resolution comment{status === 'Closed' && ' (required to close)'}
          </label>
          <textarea
            id="bug-resolution"
            className="textarea"
            value={resolutionComment ?? ''}
            onChange={(e) => setResolutionComment(e.target.value)}
            placeholder="How was this resolved?"
          />
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? <span className="spinner" /> : initial ? 'Save changes' : 'Report bug'}
        </button>
      </div>
    </form>
  )
}