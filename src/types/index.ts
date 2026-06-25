// Types mirror the DRF serializers exactly (tracker/serializers.py)

export type Role = 'ADMINISTRATOR' | 'DEVELOPER'

export interface AuthUser {
  id: number | null
  username: string
  email: string | null
  role: Role
  designation: string | null
}

export interface Developer {
  id: number
  username: string
  email: string
  role: Role
  designation: string | null
  is_active: boolean
}

// UserSerializer has no `password` field, so it can't be set through this API.
export interface DeveloperPayload {
  username: string
  email: string
  designation: string | null
  is_active: boolean
  role: Role
  password?: string
}

export type ProjectPriority = 'Low' | 'Medium' | 'High'
export type ProjectStatus = 'Planning' | 'Active' | 'Completed'

export interface Project {
  id: number
  name: string
  description: string | null
  repository_url: string | null
  priority: ProjectPriority
  status: ProjectStatus
  created_at: string
}

export type ProjectPayload = Omit<Project, 'id' | 'created_at'>

export type BugSeverity = 'Low' | 'Medium' | 'High' | 'Critical'
export type BugPriority = 'Low' | 'Medium' | 'High'
export type BugStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed'

export interface Bug {
  id: number
  title: string
  description: string | null
  project: number // FK id, ProjectViewSet has no nested serializer
  developer: number | null // FK id
  severity: BugSeverity
  priority: BugPriority
  status: BugStatus
  due_date: string | null // YYYY-MM-DD
  resolution_comment: string | null
  created_at: string
  updated_at: string
}

export type BugPayload = Omit<Bug, 'id' | 'created_at' | 'updated_at'>

export interface BugStatusUpdatePayload {
  status: BugStatus
  resolution_comment?: string | null
}

export interface LoginPayload {
  username: string
  password: string
}

export interface TokenPair {
  access: string
  refresh: string
}

export interface ApiErrorBody {
  [field: string]: string[] | string | undefined
  detail?: string
}
