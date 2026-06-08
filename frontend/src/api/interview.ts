import request from './request'
import type {
  CreateSessionRequest, CreateSessionResponse,
  SubmitAnswerRequest, SubmitAnswerResponse, InterviewResultResponse,
} from '../types/interview'

export async function createSession(req: CreateSessionRequest): Promise<CreateSessionResponse> {
  const { data } = await request.post<CreateSessionResponse>('/api/interviews/sessions', req)
  return data
}

export async function submitAnswer(sessionId: string, req: SubmitAnswerRequest): Promise<SubmitAnswerResponse> {
  const { data } = await request.post<SubmitAnswerResponse>(`/api/interviews/sessions/${sessionId}/answers`, req)
  return data
}

export async function getResult(sessionId: string): Promise<InterviewResultResponse> {
  const { data } = await request.get<InterviewResultResponse>(`/api/interviews/sessions/${sessionId}/result`)
  return data
}

export interface HistoryItem {
  sessionId: string
  resumeId: number
  roleType: string
  status: string
  totalScore: number
  questionCount: number
  startedAt: string
  createdAt: string
}

export async function getHistory(): Promise<HistoryItem[]> {
  const { data } = await request.get<HistoryItem[]>('/api/interviews/history')
  return data
}

export interface UnfinishedSession {
  sessionId: string; currentStep: number; totalStep: number
  roleType: string; status: string
  currentQuestion: { questionId: number; content: string } | null
}

export async function findUnfinished(resumeId: number): Promise<UnfinishedSession | null> {
  const { data } = await request.get<UnfinishedSession | null>(`/api/interviews/unfinished/${resumeId}`)
  return data
}
