import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowLeft, ExternalLink, Plus } from 'lucide-react'
import { projectService } from '../services/projectService'
import { bugService } from '../services/bugService'
import { developerService } from '../services/developerService'
import { extractApiError } from '../api/axiosClient'
import type { Bug, BugPayload, BugStatusUpdatePayload, Developer, Project } from '../types'
import { Modal } from '../components/Modal'
import { BugForm } from '../components/BugForm'
import { StatusUpdateForm } from '../components/StatusUpdateForm'
import { BugTable } from '../components/BugTable'
import { PriorityBadge, ProjectStatusBadge } from '../components/Badges'

type ModalState = { mode: 'create' } | { mode: 'edit'; bug: Bug } | { mode: 'status'; bug: Bug } | null

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const projectId = Number(id)

  const [project, setProject] = useState<Project | null>(null)
  const [bugs, setBugs] = useState<Bug[]>([])
  const [allProjects, setAllProjects] = useState<Project[]>([])
  const [developers, setDevelopers] = useState<Developer[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [modal, setModal] = useState<ModalState>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const [proj, bugList, projects, devs] = await Promise.all([
        projectService.get(projectId),
        bugService.list(),
        projectService.list(),
        developerService.list(),
      ])
      setProject(proj)
      setBugs(bugList.filter((b) => b.project === projectId))
      setAllProjects(projects)
      setDevelopers(devs)
    } catch (err) {
      if ((err as { response?: { status?: number } })?.response?.status === 404) {
        setNotFound(true)
      } else {
        setError(extractApiError(err))
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!Number.isNaN(projectId)) load()
  }, [projectId])

  if (Number.isNaN(projectId) || notFound) {
    return <Navigate to="/projects" replace />
  }

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

  if (loading || !project) {
    return (
      <div className="page">
        <div className="center-loader">
          <span className="spinner spinner-dark" />
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <Link to="/projects" className="btn btn-ghost btn-sm" style={{ marginBottom: 12, paddingLeft: 0 }}>
        <ArrowLeft size={14} />
        All projects
      </Link>

      <div className="page-header">
        <div>
          <span className="page-eyebrow">Project</span>
          <h1>{project.name}</h1>
          <p className="page-subtitle">{project.description || 'No description provided.'}</p>
          <div className="project-card-meta" style={{ marginTop: 12 }}>
            <ProjectStatusBadge value={project.status} />
            <PriorityBadge value={project.priority} />
            {project.repository_url && (
              <a href={project.repository_url} target="_blank" rel="noreferrer" className="badge badge-neutral">
                <ExternalLink size={11} />
                repository
              </a>
            )}
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => setModal({ mode: 'create' })}>
          <Plus size={16} />
          Report bug
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <h2 className="section-title">Bugs in this project</h2>
      <BugTable
        bugs={bugs}
        projects={allProjects}
        developers={developers}
        showProjectColumn={false}
        onEdit={(bug) => setModal({ mode: 'edit', bug })}
        onDelete={handleDelete}
        onUpdateStatus={(bug) => setModal({ mode: 'status', bug })}
      />

      {modal && modal.mode !== 'status' && (
        <Modal title={modal.mode === 'edit' ? 'Edit bug' : 'Report a bug'} onClose={() => setModal(null)}>
          <BugForm
            initial={modal.mode === 'edit' ? modal.bug : undefined}
            projects={allProjects}
            developers={developers}
            defaultProjectId={projectId}
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