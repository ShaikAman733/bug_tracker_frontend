import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, ExternalLink, ArrowRight } from 'lucide-react'
import { projectService } from '../services/projectService'
import { extractApiError } from '../api/axiosClient'
import type { Project, ProjectPayload } from '../types'
import { Modal } from '../components/Modal'
import { ProjectForm } from '../components/ProjectForm'
import { PriorityBadge, ProjectStatusBadge } from '../components/Badges'

type ModalState = { mode: 'create' } | { mode: 'edit'; project: Project } | null

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modal, setModal] = useState<ModalState>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      setProjects(await projectService.list())
    } catch (err) {
      setError(extractApiError(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleSubmit = async (payload: ProjectPayload) => {
    setSubmitting(true)
    setFormError(null)
    try {
      if (modal?.mode === 'edit') {
        await projectService.update(modal.project.id, payload)
      } else {
        await projectService.create(payload)
      }
      setModal(null)
      await load()
    } catch (err) {
      setFormError(extractApiError(err))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (project: Project) => {
    if (!window.confirm(`Delete "${project.name}"? This also deletes its bugs.`)) return
    try {
      await projectService.remove(project.id)
      await load()
    } catch (err) {
      window.alert(extractApiError(err))
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <span className="page-eyebrow">Workspace</span>
          <h1>Projects</h1>
          <p className="page-subtitle">Everything being built, and what state it's in.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal({ mode: 'create' })}>
          <Plus size={16} />
          New project
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="center-loader">
          <span className="spinner spinner-dark" />
        </div>
      ) : projects.length === 0 ? (
        <div className="card card-pad empty-state">
          <span className="empty-state-glyph">$ projects --list → empty</span>
          No projects yet. Create one to start tracking bugs against it.
        </div>
      ) : (
        <div className="project-grid">
          {projects.map((project) => (
            <div className="project-card" key={project.id}>
              <div className="project-card-top">
                <h3>{project.name}</h3>
                <ProjectStatusBadge value={project.status} />
              </div>
              {project.description && <p className="project-card-desc">{project.description}</p>}
              <div className="project-card-meta">
                <PriorityBadge value={project.priority} />
                {project.repository_url && (
                  <a
                    href={project.repository_url}
                    target="_blank"
                    rel="noreferrer"
                    className="badge badge-neutral"
                  >
                    <ExternalLink size={11} />
                    repo
                  </a>
                )}
              </div>
              <div className="project-card-footer">
                <span>Created {new Date(project.created_at).toLocaleDateString()}</span>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button
                    className="btn btn-ghost btn-icon"
                    onClick={() => setModal({ mode: 'edit', project })}
                    aria-label="Edit project"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    className="btn btn-ghost btn-icon"
                    onClick={() => handleDelete(project)}
                    aria-label="Delete project"
                  >
                    <Trash2 size={14} />
                  </button>
                  <Link
                    to={`/projects/${project.id}`}
                    className="btn btn-ghost btn-icon"
                    aria-label="View bugs for this project"
                  >
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <Modal
          title={modal.mode === 'edit' ? 'Edit project' : 'New project'}
          onClose={() => setModal(null)}
        >
          <ProjectForm
            initial={modal.mode === 'edit' ? modal.project : undefined}
            submitting={submitting}
            errorMessage={formError}
            onSubmit={handleSubmit}
            onCancel={() => setModal(null)}
          />
        </Modal>
      )}
    </div>
  )
}