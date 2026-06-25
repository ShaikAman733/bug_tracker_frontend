import type { BugPriority, BugSeverity, BugStatus, ProjectPriority, ProjectStatus } from '../types'

type Tone = 'danger' | 'warning' | 'info' | 'brand' | 'neutral' | 'accent'

function Pill({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  return (
    <span className={`badge badge-${tone}`}>
      <span className="badge-dot" style={{ background: 'currentColor' }} />
      {children}
    </span>
  )
}

const SEVERITY_TONE: Record<BugSeverity, Tone> = {
  Low: 'neutral',
  Medium: 'info',
  High: 'warning',
  Critical: 'danger',
}

const STATUS_TONE: Record<BugStatus, Tone> = {
  Open: 'warning',
  'In Progress': 'info',
  Resolved: 'brand',
  Closed: 'neutral',
}

const PRIORITY_TONE: Record<BugPriority | ProjectPriority, Tone> = {
  Low: 'neutral',
  Medium: 'info',
  High: 'accent',
}

const PROJECT_STATUS_TONE: Record<ProjectStatus, Tone> = {
  Planning: 'neutral',
  Active: 'brand',
  Completed: 'info',
}

export function SeverityBadge({ value }: { value: BugSeverity }) {
  return <Pill tone={SEVERITY_TONE[value]}>{value}</Pill>
}

export function StatusBadge({ value }: { value: BugStatus }) {
  return <Pill tone={STATUS_TONE[value]}>{value}</Pill>
}

export function PriorityBadge({ value }: { value: BugPriority | ProjectPriority }) {
  return <Pill tone={PRIORITY_TONE[value]}>{value}</Pill>
}

export function ProjectStatusBadge({ value }: { value: ProjectStatus }) {
  return <Pill tone={PROJECT_STATUS_TONE[value]}>{value}</Pill>
}