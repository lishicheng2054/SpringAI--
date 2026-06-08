import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { listKbs, createKb, deleteKb } from '../api/knowledgebase'
import type { KbResponse } from '../types/knowledgebase'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'

export default function KnowledgeBaseListPage() {
  const navigate = useNavigate()
  const [kbs, setKbs] = useState<KbResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [creating, setCreating] = useState(false)

  const fetch = useCallback(async () => {
    setLoading(true); setError(null)
    try { setKbs(await listKbs()) }
    catch (e) { setError(e instanceof Error ? e.message : '加载失败') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const handleCreate = async () => {
    if (!name.trim()) return
    setCreating(true)
    try { await createKb({ name: name.trim(), description: desc.trim() }); setName(''); setDesc(''); await fetch() }
    catch (e) { setError(e instanceof Error ? e.message : '创建失败') }
    finally { setCreating(false) }
  }

  if (loading) return <LoadingSpinner text="加载知识库..." />
  if (error) return <ErrorMessage message={error} onRetry={fetch} />

  const inputClass = "px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-1">知识库</h2>
        <p className="text-slate-400 text-sm">上传文档构建知识库，AI 智能问答</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-6 flex gap-3">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="知识库名称" className={`${inputClass} flex-1`} />
        <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="描述（可选）" className={`${inputClass} flex-1`} />
        <button onClick={handleCreate} disabled={creating || !name.trim()}
          className="px-6 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-brand-700 disabled:bg-slate-200 disabled:text-slate-400 transition-all shrink-0">
          {creating ? '...' : '创建'}
        </button>
      </div>

      {kbs.length === 0 ? (
        <div className="text-center py-20 text-slate-300">
          <div className="text-5xl mb-4">📚</div>
          <p>暂无知识库，创建一个开始吧</p>
        </div>
      ) : (
        <div className="space-y-3">
          {kbs.map(kb => (
            <div key={kb.id} onClick={() => navigate(`/kb/${kb.id}`)}
              className="group bg-white rounded-2xl border border-slate-100 shadow-sm p-5 cursor-pointer hover:shadow-md hover:border-brand-200 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-800 group-hover:text-brand-600 transition-colors">{kb.name}</h3>
                  <p className="text-sm text-slate-400 mt-0.5">{kb.description || '暂无描述'} · {kb.docCount} 篇文档</p>
                </div>
                <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                  <button onClick={() => navigate(`/kb/${kb.id}/chat`)}
                    className="px-3 py-1.5 bg-brand-50 text-brand-600 rounded-lg text-xs font-medium hover:bg-brand-100 transition-colors">问答</button>
                  <button onClick={() => { if (confirm('确定删除？')) { deleteKb(kb.id).then(fetch) } }}
                    className="px-3 py-1.5 text-red-400 rounded-lg text-xs hover:bg-red-50 transition-colors">删除</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
