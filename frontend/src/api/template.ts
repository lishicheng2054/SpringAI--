import request from './request'

export interface TemplateItem {
  id: number; name: string; description: string; roleType: string
  questionIds: number[]; questionCount: number; isDefault: boolean
  useCount: number; createdAt: string
}

export async function listTemplates(roleType?: string): Promise<TemplateItem[]> {
  const { data } = await request.get<TemplateItem[]>('/api/templates', { params: roleType ? { roleType } : {} })
  return data
}

export async function createTemplate(req: {
  name: string; description?: string; roleType?: string; questionIds: number[]
}): Promise<TemplateItem> {
  const { data } = await request.post<TemplateItem>('/api/templates', req)
  return data
}

export async function deleteTemplate(id: number): Promise<void> {
  await request.delete(`/api/templates/${id}`)
}

export async function applyTemplate(id: number): Promise<{
  index: number; questionId: number; content: string; category: string; difficulty: string
}[]> {
  const { data } = await request.post(`/api/templates/${id}/apply`)
  return data
}
