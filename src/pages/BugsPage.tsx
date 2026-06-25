import { useEffect, useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { bugService } from '../services/bugService'
import { projectService } from '../services/projectService'
import { developerService } from '../services/developerService'
import { extractApiError } from '../api/axiosClient'
import type { Bug, BugPayload, BugStatus, BugStatusUpdatePayload, Developer, Project } from '../types'
import { Modal } from '../components/Modal'
import { BugForm } from '../components/BugForm'
import { StatusUpdateForm } from '../components/StatusUpdateForm'
import { BugTable } from '../components/BugTable'

type ModalState =
  | { mode: 'create' }
  | { mode: 'edit'; bug: Bug }
  | { mode: 'status'; bug: Bug }
  | null

const STATUS_FILTERS: Array<'All' | BugStatus> = ['All', 'Open', 'In Progress', 'Resolved', 'Closed']

export function BugsPage() {
  const [bugs, setBugs] = useState<Bug[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [developers, setDevelopers] = useState<Developer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modal, setModal] = useState<ModalState>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const [statusFilter, setStatusFilter] = useState<'All' | BugStatus>('All')
  const [projectFilter, setProjectFilter] = useState<'All' | number>('All')

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const [b, p, d] = await Promise.all([
        bugService.list(),
        projectService.list(),
        developerService.list(),
      ])
      setBugs(b)
      setProjects(p)
      setDevelopers(d)
    } catch (err) {
      setError(extractApiError(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filteredBugs = useMemo(() => {
    return bugs.filter((bug) => {
      if (statusFilter !== 'All' && bug.status !== statusFilter) return false
      if (projectFilter !== 'All' && bug.project !== projectFilter) return false
      return true
    })
  }, [bugs, statusFilter, projectFilter])

  const handleCreateOrEdit = async (payload: BugPayload) => {
    setSubmitting(true)
    setFormError(null)
    try {
      if (modal?.mode === 'edit') {
        await bugService.update(modal.bug.id, payload)
      } else {
        await bugService.create(payload)
      }
      setModal(null)
      await load()
    } catch (err) {
      setFormError(extractApiError(err))
    } finally {
      setSubmitting(false)
    }
  }

  const handleStatusUpdate = async (payload: BugStatusUpdatePayload) => {
    if (modal?.mode !== 'status') return
    setSubmitting(true)
    setFormError(null)
    try {
      await bugService.updateStatus(modal.bug.id, payload)
      setModal(null)
      await load()
    } catch (err) {
      setFormError(extractApiError(err))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (bug: Bug) => {
    if (!window.confirm(`Delete bug "${bug.title}"?`)) return
    try {
      await bugService.remove(bug.id)
      await load()
    } catch (err) {
      window.alert(extractApiError(err))
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <span className="page-eyebrow">Triage</span>
          <h1>Bugs</h1>
          <p className="page-subtitle">Every reported bug across every project.</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setModal({ mode: 'create' })}
          disabled={projects.length === 0}
          title={projects.length === 0 ? 'Create a project first' : undefined}
        >
          <Plus size={16} />
          Report bug
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="toolbar">
        <select
          className="select"
          style={{ width: 'auto' }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'All' | BugStatus)}
        >
          {STATUS_FILTERS.map((s) => (
            <option key={s} value={s}>
              {s === 'All' ? 'All statuses' : s}
            </option>
          ))}
        </select>
        <select
          className="select"
          style={{ width: 'auto' }}
          value={projectFilter}
          onChange={(e) => setProjectFilter(e.target.value === 'All' ? 'All' : Number(e.target.value))}
        >
          <option value="All">All projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="center-loader">
          <span className="spinner spinner-dark" />
        </div>
      ) : (
        <BugTable
          bugs={filteredBugs}
          projects={projects}
          developers={developers}
          onEdit={(bug) => setModal({ mode: 'edit', bug })}
          onDelete={handleDelete}
          onUpdateStatus={(bug) => setModal({ mode: 'status', bug })}
        />
      )}

      {modal && modal.mode !== 'status' && (
        <Modal title={modal.mode === 'edit' ? 'Edit bug' : 'Report a bug'} onClose={() => setModal(null)}>
          <BugForm
            initial={modal.mode === 'edit' ? modal.bug : undefined}
            projects={projects}
            developers={developers}
            submitting={submitting}
            errorMessage={formError}
            onSubmit={handleCreateOrEdit}
            onCancel={() => setModal(null)}
          />
        </Modal>
      )}

      {modal && modal.mode === 'status' && (
        <Modal title="Update status" onClose={() => setModal(null)}>
          <StatusUpdateForm
            bug={modal.bug}
            submitting={submitting}
            errorMessage={formError}
            onSubmit={handleStatusUpdate}
            onCancel={() => setModal(null)}
          />
        </Modal>
      )}
    </div>
  )
}