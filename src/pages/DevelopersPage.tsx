import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { developerService } from '../services/developerService'
import { extractApiError } from '../api/axiosClient'
import type { Developer, DeveloperPayload } from '../types'
import { Modal } from '../components/Modal'
import { DeveloperForm } from '../components/DeveloperForm'

type ModalState = { mode: 'create' } | { mode: 'edit'; developer: Developer } | null

export function DevelopersPage() {
  const [developers, setDevelopers] = useState<Developer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modal, setModal] = useState<ModalState>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      setDevelopers(await developerService.list())
    } catch (err) {
      setError(extractApiError(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleSubmit = async (payload: DeveloperPayload) => {
    setSubmitting(true)
    setFormError(null)
    try {
      if (modal?.mode === 'edit') {
        await developerService.update(modal.developer.id, payload)
      } else {
        await developerService.create(payload)
      }
      setModal(null)
      await load()
    } catch (err) {
      setFormError(extractApiError(err))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (developer: Developer) => {
    if (!window.confirm(`Remove "${developer.username}"? Their assigned bugs will be unassigned.`)) return
    try {
      await developerService.remove(developer.id)
      await load()
    } catch (err) {
      window.alert(extractApiError(err))
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <span className="page-eyebrow">Team</span>
          <h1>Developers</h1>
          <p className="page-subtitle">Everyone available to be assigned to a bug.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal({ mode: 'create' })}>
          <Plus size={16} />
          Add developer
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="center-loader">
          <span className="spinner spinner-dark" />
        </div>
      ) : developers.length === 0 ? (
        <div className="card card-pad empty-state">
          <span className="empty-state-glyph">$ developers --list → empty</span>
          No developers yet. Add one so you can assign bugs to them.
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Designation</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {developers.map((dev) => (
                <tr key={dev.id}>
                  <td className="cell-title">{dev.username}</td>
                  <td className="cell-muted">{dev.email}</td>
                  <td className="cell-muted">{dev.designation || '—'}</td>
                  <td>
                    <span className={`badge ${dev.is_active ? 'badge-brand' : 'badge-neutral'}`}>
                      <span className="badge-dot" style={{ background: 'currentColor' }} />
                      {dev.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="btn btn-ghost btn-icon"
                        onClick={() => setModal({ mode: 'edit', developer: dev })}
                        aria-label="Edit developer"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        className="btn btn-ghost btn-icon"
                        onClick={() => handleDelete(dev)}
                        aria-label="Remove developer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <Modal title={modal.mode === 'edit' ? 'Edit developer' : 'Add developer'} onClose={() => setModal(null)}>
          <DeveloperForm
            initial={modal.mode === 'edit' ? modal.developer : undefined}
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