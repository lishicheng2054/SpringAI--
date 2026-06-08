import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getKb, listDocuments, uploadDocument, deleteDocument } from '../api/knowledgebase'
import type { KbResponse, DocumentResponse } from '../types/knowledgebase'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'

export default function KnowledgeBaseDetailPage() {
  const { kbId } = useParams<{ kbId: string }>()
  const navigate = useNavigate()
  const [kb, setKb] = useState<KbResponse | null>(null)
  const [docs, setDocs] = useState<DocumentResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const fetch = useCallback(async () => {
    if (!kbId) return
    setLoading(true); setError(null)
    try { const [k, d] = await Promise.all([getKb(Number(kbId)), listDocuments(Number(kbId))]); setKb(k); setDocs(d) }
    catch (e) { setError(e instanceof Error ? e.message : '加载失败') }
    finally { setLoading(false) }
  }, [kbId])

  useEffect(() => { fetch() }, [fetch])

  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file || !kbId) return
    setUploading(true); setError(null)
    try { await uploadDocument(Number(kbId), file); await fetch() }
    catch (err) { setError(err instanceof Error ? err.message : '上传失败') }
    finally { setUploading(false) }
  }

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} onRetry={fetch} />

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={() => navigate('/kb')} className="text-sm text-slate-400 hover:text-slate-600 mb-4 inline-block transition-colors">← 返回</button>
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-2xl font-bold text-slate-800">{kb?.name}</h2>
        <span className="text-sm text-slate-400">{docs.length} 篇文档</span>
        <button onClick={() => navigate(`/kb/${kbId}/chat`)}
          className="ml-auto px-4 py-2 bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-brand-700 transition-all">AI 问答</button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <span className="px-4 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-brand-700 transition-all">{uploading ? '解析中...' : '选择文件'}</span>
          <span className="text-sm text-slate-400">PDF · Word · TXT，最大 20MB</span>
          <input type="file" onChange={upload} className="hidden" accept=".pdf,.doc,.docx,.txt" />
        </label>
      </div>

      {docs.length === 0 ? (
        <div className="text-center py-20 text-slate-300"><div className="text-5xl mb-4">📄</div><p>暂无文档</p></div>
      ) : (
        <div className="space-y-3">
          {docs.map(doc => (
            <div key={doc.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex justify-between items-start hover:shadow-md transition-all">
              <div className="flex-1 min-w-0">
                <div className="font-medium text-slate-800 text-sm truncate">{doc.fileName}</div>
                <div className="text-xs text-slate-400 mt-1">{doc.contentType} · {doc.fileSize ? (doc.fileSize / 1024).toFixed(1) + 'KB' : '-'}</div>
                <div className="text-xs text-slate-400 mt-1.5 line-clamp-2">{doc.contentPreview}</div>
              </div>
              <button onClick={() => { if (confirm('删除？')) { deleteDocument(Number(kbId), doc.id).then(fetch) } }}
                className="text-red-400 hover:text-red-600 text-sm ml-4 mt-1 transition-colors">删除</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
