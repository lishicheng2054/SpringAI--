import request from './request'

export interface ProviderDTO {
  id: string
  baseUrl: string
  maskedApiKey: string
  model: string
  temperature: number | null
  enabled: boolean
  createdAt: string
  updatedAt: string
}

export interface ProviderTestResult {
  success: boolean
  message: string
  model: string
}

export async function listProviders(): Promise<ProviderDTO[]> {
  const { data } = await request.get<ProviderDTO[]>('/api/llm-providers')
  return data
}

export async function createProvider(req: {
  id: string; baseUrl: string; apiKey: string; model: string; temperature?: number
}): Promise<void> {
  await request.post('/api/llm-providers', req)
}

export async function updateProvider(id: string, req: {
  baseUrl?: string; apiKey?: string; model?: string; temperature?: number; enabled?: boolean
}): Promise<void> {
  await request.put(`/api/llm-providers/${id}`, req)
}

export async function deleteProvider(id: string): Promise<void> {
  await request.delete(`/api/llm-providers/${id}`)
}

export async function testProvider(id: string): Promise<ProviderTestResult> {
  const { data } = await request.post<ProviderTestResult>(`/api/llm-providers/${id}/test`)
  return data
}
