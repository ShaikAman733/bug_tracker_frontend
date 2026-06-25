import { useState, type FormEvent } from 'react'
import type { Project, ProjectPayload, ProjectPriority, ProjectStatus } from '../types'

interface ProjectFormProps {
  initial?: Project
  submitting: boolean
  errorMessage: string | null
  onSubmit: (payload: ProjectPayload) => void
  onCancel: () => void
}

const PRIORITIES: ProjectPriority[] = ['Low', 'Medium', 'High']
const STATUSES: ProjectStatus[] = ['Planning', 'Active', 'Completed']

export function ProjectForm({ initial, submitting, errorMessage, onSubmit, onCancel }: ProjectFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [repositoryUrl, setRepositoryUrl] = useState(initial?.repository_url ?? '')
  const [priority, setPriority] = useState<ProjectPriority>(initial?.priority ?? 'Medium')
  const [status, setStatus] = useState<ProjectStatus>(initial?.status ?? 'Planning')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onSubmit({
      name,
      description: description || null,
      repository_url: repositoryUrl || null,
      priority,
      status,
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

      <div className="form-grid">
        <div className="field field-full">
          <label htmlFor="proj-name">Project name</label>
          <input
            id="proj-name"
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g. Campus Mate"
          />
        </div>

        <div className="field field-full">
          <label htmlFor="proj-desc">Description</label>
          <textarea
            id="proj-desc"
            className="textarea"
            value={description ?? ''}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this project about?"
          />
        </div>

        <div className="field field-full">
          <label htmlFor="proj-repo">Repository URL</label>
          <input
            id="proj-repo"
            className="input"
            type="url"
            value={repositoryUrl ?? ''}
            onChange={(e) => setRepositoryUrl(e.target.value)}
            placeholder="https://github.com/org/repo"
          />
        </div>

        <div className="field">
          <label htmlFor="proj-priority">Priority</label>
          <select
            id="proj-priority"
            className="select"
            value={priority}
            onChange={(e) => setPriority(e.target.value as ProjectPriority)}
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="proj-status">Status</label>
          <select
            id="proj-status"
            className="select"
            value={status}
            onChange={(e) => setStatus(e.target.value as ProjectStatus)}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? <span className="spinner" /> : initial ? 'Save changes' : 'Create project'}
        </button>
      </div>
    </form>
  )
}