import request from './request'
import type { ResumeRequest, ResumeResponse, ResumeAnalysisResponse } from '../types/resume'

export async function createResume(req: ResumeRequest): Promise<{ resumeId: number }> {
  const { data } = await request.post<{ resumeId: number }>('/api/resumes', req)
  return data
}

export async function uploadResume(
  candidateName: string, targetPosition: string, file: File
): Promise<ResumeResponse> {
  const formData = new FormData()
  formData.append('candidateName', candidateName)
  formData.append('targetPosition', targetPosition)
  formData.append('file', file)
  const { data } = await request.post<ResumeResponse>('/api/resumes/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }, timeout: 60000,
  })
  return data
}

export async function getResume(id: number): Promise<ResumeResponse> {
  const { data } = await request.get<ResumeResponse>(`/api/resumes/${id}`)
  return data
}

export async function listResumes(): Promise<ResumeResponse[]> {
  const { data } = await request.get<ResumeResponse[]>('/api/resumes')
  return data
}

export async function deleteResume(id: number): Promise<void> {
  await request.delete(`/api/resumes/${id}`)
}

export async function analyzeResume(resumeId: number): Promise<ResumeAnalysisResponse> {
  const { data } = await request.post<ResumeAnalysisResponse>(`/api/resumes/${resumeId}/analyze`)
  return data
}

export async function getAnalysis(resumeId: number): Promise<ResumeAnalysisResponse> {
  const { data } = await request.get<ResumeAnalysisResponse>(`/api/resumes/${resumeId}/analysis`)
  return data
}
