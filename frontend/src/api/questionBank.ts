import request from './request'

export interface QuestionItem {
  id: number; content: string; category: string; difficulty: string
  roleType: string; referenceAnswer: string; tags: string
  useCount: number; createdAt: string
}

export async function searchQuestions(params?: {
  category?: string; difficulty?: string; roleType?: string; keyword?: string
}): Promise<QuestionItem[]> {
  const { data } = await request.get<QuestionItem[]>('/api/question-bank', { params })
  return data
}

export async function getGroupedQuestions(): Promise<Record<string, QuestionItem[]>> {
  const { data } = await request.get<Record<string, QuestionItem[]>>('/api/question-bank/grouped')
  return data
}

export async function createQuestion(req: {
  content: string; category: string; difficulty?: string; roleType?: string; tags?: string
}): Promise<QuestionItem> {
  const { data } = await request.post<QuestionItem>('/api/question-bank', req)
  return data
}

export async function deleteQuestion(id: number): Promise<void> {
  await request.delete(`/api/question-bank/${id}`)
}
