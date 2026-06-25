import apiClient from '../api/axiosClient'
import type { Bug, BugPayload, BugStatus, BugStatusUpdatePayload } from '../types'

// Matches the literal Response(...) shape returned by BugViewSet.update_status -
// it does NOT return the full serialized bug, just these two fields.
export interface BugStatusUpdateResponse {
  status: string
  current_status: BugStatus
}

export const bugService = {
  async list(): Promise<Bug[]> {
    const { data } = await apiClient.get<Bug[]>('/bugs/')
    return data
  },
  async get(id: number): Promise<Bug> {
    const { data } = await apiClient.get<Bug>(`/bugs/${id}/`)
    return data
  },
  async create(payload: BugPayload): Promise<Bug> {
    const { data } = await apiClient.post<Bug>('/bugs/', payload)
    return data
  },
  async update(id: number, payload: Partial<BugPayload>): Promise<Bug> {
    const { data } = await apiClient.patch<Bug>(`/bugs/${id}/`, payload)
    return data
  },
  async remove(id: number): Promise<void> {
    await apiClient.delete(`/bugs/${id}/`)
  },
  /** Hits the custom @action route: PATCH /api/bugs/{id}/status/ */
  async updateStatus(
    id: number,
    payload: BugStatusUpdatePayload,
  ): Promise<BugStatusUpdateResponse> {
    const { data } = await apiClient.patch<BugStatusUpdateResponse>(
      `/bugs/${id}/status/`,
      payload,
    )
    return data
  },
}