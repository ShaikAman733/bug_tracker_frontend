import { Pencil, Trash2, RefreshCw } from 'lucide-react'
import type { Bug, Developer, Project } from '../types'
import { PriorityBadge, SeverityBadge, StatusBadge } from './Badges' // Note: updated to match previous file name Badges.tsx

interface BugTableProps {
  bugs: Bug[]
  projects: Project[]
  developers: Developer[]
  showProjectColumn?: boolean
  onEdit: (bug: Bug) => void
  onDelete: (bug: Bug) => void
  onUpdateStatus: (bug: Bug) => void
}

export function BugTable({
  bugs,
  projects,
  developers,
  showProjectColumn = true,
  onEdit,
  onDelete,
  onUpdateStatus,
}: BugTableProps) {
  const projectName = (id: number) => projects.find((p) => p.id === id)?.name ?? `#${id}`
  const developerName = (id: number | null) =>
    id === null ? 'Unassigned' : developers.find((d) => d.id === id)?.username ?? `#${id}`

  if (bugs.length === 0) {
    return (
      <div className="card card-pad empty-state">
        <span className="empty-state-glyph">$ bugs --list → empty</span>
        No bugs match here yet.
      </div>
    )
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            {showProjectColumn && <th>Project</th>}
            <th>Developer</th>
            <th>Severity</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Due</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {bugs.map((bug) => (
            <tr key={bug.id}>
              <td className="bug-id">#{String(bug.id).padStart(4, '0')}</td>
              <td className="cell-title">{bug.title}</td>
              {showProjectColumn && <td className="cell-muted">{projectName(bug.project)}</td>}
              <td className="cell-muted">{developerName(bug.developer)}</td>
              <td>
                <SeverityBadge value={bug.severity} />
              </td>
              <td>
                <PriorityBadge value={bug.priority} />
              </td>
              <td>
                <StatusBadge value={bug.status} />
              </td>
              <td className="cell-mono">
                {bug.due_date ? new Date(bug.due_date).toLocaleDateString() : '—'}
              </td>
              <td>
                <div className="table-actions">
                  <button
                    className="btn btn-ghost btn-icon"
                    onClick={() => onUpdateStatus(bug)}
                    aria-label="Update status"
                    title="Quick status update"
                  >
                    <RefreshCw size={14} />
                  </button>
                  <button
                    className="btn btn-ghost btn-icon"
                    onClick={() => onEdit(bug)}
                    aria-label="Edit bug"
                    title="Edit bug"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    className="btn btn-ghost btn-icon"
                    onClick={() => onDelete(bug)}
                    aria-label="Delete bug"
                    title="Delete bug"
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
  )
}