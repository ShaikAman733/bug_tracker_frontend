import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="page">
      <div className="card card-pad empty-state">
        <span className="empty-state-glyph">404 // route not found</span>
        <p style={{ marginBottom: 12 }}>That page doesn't exist.</p>
        <Link to="/" className="btn btn-primary" style={{ display: 'inline-flex' }}>
          Back to dashboard
        </Link>
      </div>
    </div>
  )
}