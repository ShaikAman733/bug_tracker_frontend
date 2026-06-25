import apiClient from '../api/axiosClient'
import type { Developer, DeveloperPayload } from '../types'

export const developerService = {
  async list(): Promise<Developer[]> {
    const { data } = await apiClient.get<Developer[]>('/developers/')
    return data
  },
  async create(payload: DeveloperPayload): Promise<Developer> {
    const { data } = await apiClient.post<Developer>('/developers/', payload)
    return data
  },
  async update(id: number, payload: Partial<DeveloperPayload>): Promise<Developer> {
    const { data } = await apiClient.patch<Developer>(`/developers/${id}/`, payload)
    return data
  },
  async remove(id: number): Promise<void> {
    await apiClient.delete(`/developers/${id}/`)
  },
}