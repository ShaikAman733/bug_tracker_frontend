import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  Bug as BugIcon,
  CheckCircle2,
  Clock,
  FolderKanban,
  Users,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { projectService } from '../services/projectService'
import { bugService } from '../services/bugService'
import { developerService } from '../services/developerService'
import { extractApiError } from '../api/axiosClient'
import type { Bug, Project, Developer } from '../types'
import { SeverityBadge, StatusBadge } from '../components/Badges'

export function DashboardPage() {
  const { role, user } = useAuth()
  const isAdmin = role === 'ADMINISTRATOR'

  const [projects, setProjects] = useState<Project[]>([])
  const [bugs, setBugs] = useState<Bug[]>([])
  const [developers, setDevelopers] = useState<Developer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    async function load() {
      setLoading(true)
      setError(null)
      try {
        // Developers only need bugs to compute their own stats; admins need
        // projects + developers too. Fetching all three is harmless either way
        // since the backend already scopes /bugs/ to what the user can see.
        const [p, b, d] = await Promise.all([
          projectService.list(),
          bugService.list(),
          developerService.list(),
        ])
        if (!active) return
        setProjects(p)
        setBugs(b)
        setDevelopers(d)
      } catch (err) {
        if (active) setError(extractApiError(err))
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [])

  // Bugs assigned to the logged-in developer (used only on the Developer dashboard)
  const myBugs = useMemo(
    () => bugs.filter((b) => b.developer === user?.id),
    [bugs, user?.id],
  )

  const adminStats = useMemo(
    () => ({
      totalProjects: projects.length,
      totalDevelopers: developers.length,
      totalBugs: bugs.length,
      openBugs: bugs.filter((b) => b.status === 'Open').length,
      inProgressBugs: bugs.filter((b) => b.status === 'In Progress').length,
      closedBugs: bugs.filter((b) => b.status === 'Closed' || b.status === 'Resolved').length,
    }),
    [projects, developers, bugs],
  )

  const devStats = useMemo(
    () => ({
      assignedBugs: myBugs.length,
      openBugs: myBugs.filter((b) => b.status === 'Open').length,
      inProgressBugs: myBugs.filter((b) => b.status === 'In Progress').length,
      closedBugs: myBugs.filter((b) => b.status === 'Closed' || b.status === 'Resolved').length,
    }),
    [myBugs],
  )

  const projectName = (id: number) => projects.find((p) => p.id === id)?.name ?? `#${id}`

  const recentClosedBugs = [...myBugs]
    .filter((b) => b.status === 'Closed' || b.status === 'Resolved')
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 6)

  const recentBugs = [...bugs]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 6)

  if (loading) {
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
      <div className="page-header">
        <div>
          <span className="page-eyebrow">Overview</span>
          <h1>{isAdmin ? 'Administrator Dashboard' : 'Developer Dashboard'}</h1>
          <p className="page-subtitle">
            {isAdmin
              ? 'A snapshot of every project and bug currently being tracked.'
              : 'A snapshot of the bugs assigned to you.'}
          </p>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {isAdmin ? (
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-card-label">
              <FolderKanban size={13} style={{ marginRight: 4, verticalAlign: -2 }} />
              Total Projects
            </div>
            <div className="stat-card-value">{adminStats.totalProjects}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-label">
              <Users size={13} style={{ marginRight: 4, verticalAlign: -2 }} />
              Total Developers
            </div>
            <div className="stat-card-value">{adminStats.totalDevelopers}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-label">
              <BugIcon size={13} style={{ marginRight: 4, verticalAlign: -2 }} />
              Total Bugs
            </div>
            <div className="stat-card-value">{adminStats.totalBugs}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-label">
              <AlertTriangle size={13} style={{ marginRight: 4, verticalAlign: -2 }} />
              Open Bugs
            </div>
            <div className="stat-card-value accent-warning">{adminStats.openBugs}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-label">
              <Clock size={13} style={{ marginRight: 4, verticalAlign: -2 }} />
              Bugs In Progress
            </div>
            <div className="stat-card-value accent-info">{adminStats.inProgressBugs}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-label">
              <CheckCircle2 size={13} style={{ marginRight: 4, verticalAlign: -2 }} />
              Closed Bugs
            </div>
            <div className="stat-card-value accent-brand">{adminStats.closedBugs}</div>
          </div>
        </div>
      ) : (
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-card-label">
              <BugIcon size={13} style={{ marginRight: 4, verticalAlign: -2 }} />
              Assigned Bugs
            </div>
            <div className="stat-card-value">{devStats.assignedBugs}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-label">
              <AlertTriangle size={13} style={{ marginRight: 4, verticalAlign: -2 }} />
              Open Bugs
            </div>
            <div className="stat-card-value accent-warning">{devStats.openBugs}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-label">
              <Clock size={13} style={{ marginRight: 4, verticalAlign: -2 }} />
              Bugs In Progress
            </div>
            <div className="stat-card-value accent-info">{devStats.inProgressBugs}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-label">
              <CheckCircle2 size={13} style={{ marginRight: 4, verticalAlign: -2 }} />
              Recently Closed
            </div>
            <div className="stat-card-value accent-brand">{devStats.closedBugs}</div>
          </div>
        </div>
      )}

      <h2 className="section-title">
        {isAdmin ? 'Recently reported bugs' : 'Your recently closed bugs'}
      </h2>

      {isAdmin ? (
        recentBugs.length === 0 ? (
          <div className="card card-pad empty-state">
            <span className="empty-state-glyph">$ no bugs found</span>
            No bugs have been reported yet. <Link to="/bugs">Report the first one</Link>.
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Project</th>
                  <th>Severity</th>
                  <th>Status</th>
                  <th>Reported</th>
                </tr>
              </thead>
              <tbody>
                {recentBugs.map((bug) => (
                  <tr key={bug.id}>
                    <td className="bug-id">#{String(bug.id).padStart(4, '0')}</td>
                    <td className="cell-title">{bug.title}</td>
                    <td className="cell-muted">{projectName(bug.project)}</td>
                    <td>
                      <SeverityBadge value={bug.severity} />
                    </td>
                    <td>
                      <StatusBadge value={bug.status} />
                    </td>
                    <td className="cell-mono">{new Date(bug.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : recentClosedBugs.length === 0 ? (
        <div className="card card-pad empty-state">
          <span className="empty-state-glyph">$ no closed bugs</span>
          You haven't closed any bugs yet. <Link to="/bugs">View your bugs</Link>.
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Project</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {recentClosedBugs.map((bug) => (
                <tr key={bug.id}>
                  <td className="bug-id">#{String(bug.id).padStart(4, '0')}</td>
                  <td className="cell-title">{bug.title}</td>
                  <td className="cell-muted">{projectName(bug.project)}</td>
                  <td>
                    <SeverityBadge value={bug.severity} />
                  </td>
                  <td>
                    <StatusBadge value={bug.status} />
                  </td>
                  <td className="cell-mono">{new Date(bug.updated_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}