import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { listResumes, deleteResume } from '../api/resume'
import type { ResumeResponse } from '../types/resume'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import { FileText, Plus, Trash2, Eye, Play, Upload } from 'lucide-react'

export default function ResumeListPage() {
  const navigate = useNavigate()
  const [resumes, setResumes] = useState<ResumeResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true); setError(null)
    try { setResumes(await listResumes()) } catch (e) { setError(e instanceof Error ? e.message : '加载失败') } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const handleDelete = async (id: number) => {
    if (!confirm('确定删除该简历？')) return
    try { await deleteResume(id); await fetch() } catch (e) { alert(e instanceof Error ? e.message : '删除失败') }
  }

  if (loading) return <LoadingSpinner text="加载简历列表..." />
  if (error) return <ErrorMessage message={error} onRetry={fetch} />

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-brand-500" />
          <div>
            <h2 className="text-2xl font-bold text-slate-800">我的简历</h2>
            <p className="text-xs text-slate-400">{resumes.length} 份简历</p>
          </div>
        </div>
        <button onClick={() => navigate('/resume')}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-brand-700 transition-all">
          <Plus className="w-4 h-4" /> 新建
        </button>
      </div>

      {resumes.length === 0 ? (
        <div className="text-center py-20 text-slate-300">
          <FileText className="w-12 h-12 mx-auto mb-4 text-slate-200" />
          <p>暂无简历</p>
          <button onClick={() => navigate('/resume')} className="mt-4 px-4 py-2 bg-brand-50 text-brand-600 rounded-xl text-sm hover:bg-brand-100 transition-colors">创建第一份简历</button>
        </div>
      ) : (
        <div className="space-y-3">
          {resumes.map(r => (
            <div key={r.id} onClick={() => navigate(`/resume/${r.id}`)}
              className="group bg-white rounded-2xl border border-slate-100 shadow-sm p-5 cursor-pointer hover:shadow-md hover:border-brand-200 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${r.sourceType === 'FILE' ? 'bg-violet-50' : 'bg-blue-50'}`}>
                      {r.sourceType === 'FILE' ? <Upload className="w-4 h-4 text-violet-500" /> : <FileText className="w-4 h-4 text-blue-500" />}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 group-hover:text-brand-600 transition-colors truncate">{r.candidateName}</h3>
                      <p className="text-xs text-slate-400">{r.targetPosition} · {new Date(r.createdAt).toLocaleDateString('zh-CN')}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 ml-4 shrink-0" onClick={e => e.stopPropagation()}>
                  <button onClick={() => navigate(`/resume/${r.id}`)} className="p-2 text-slate-400 hover:text-brand-500 hover:bg-brand-50 rounded-lg transition-colors" title="查看详情"><Eye className="w-4 h-4" /></button>
                  <button onClick={() => navigate(`/interview/${r.id}`)} className="p-2 text-slate-400 hover:text-brand-500 hover:bg-brand-50 rounded-lg transition-colors" title="开始面试"><Play className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(r.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="删除"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
