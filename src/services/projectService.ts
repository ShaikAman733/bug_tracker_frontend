import apiClient from '../api/axiosClient'
import type { Project, ProjectPayload } from '../types'

export const projectService = {
  async list(): Promise<Project[]> {
    const { data } = await apiClient.get<Project[]>('/projects/')
    return data
  },
  async get(id: number): Promise<Project> {
    const { data } = await apiClient.get<Project>(`/projects/${id}/`)
    return data
  },
  async create(payload: ProjectPayload): Promise<Project> {
    const { data } = await apiClient.post<Project>('/projects/', payload)
    return data
  },
  async update(id: number, payload: Partial<ProjectPayload>): Promise<Project> {
    const { data } = await apiClient.patch<Project>(`/projects/${id}/`, payload)
    return data
  },
  async remove(id: number): Promise<void> {
    await apiClient.delete(`/projects/${id}/`)
  },
}