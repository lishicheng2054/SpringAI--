import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getKb, chatWithKb } from '../api/knowledgebase'
import type { KbResponse, ChatResponse } from '../types/knowledgebase'
import LoadingSpinner from '../components/LoadingSpinner'

export default function KnowledgeBaseChatPage() {
  const { kbId } = useParams<{ kbId: string }>()
  const navigate = useNavigate()
  const [kb, setKb] = useState<KbResponse | null>(null)
  const [question, setQuestion] = useState('')
  const [result, setResult] = useState<ChatResponse | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => { if (kbId) getKb(Number(kbId)).then(setKb).catch(() => {}) }, [kbId])

  const ask = async () => {
    if (!kbId || !question.trim()) return
    setLoading(true); setResult(null)
    try { setResult(await chatWithKb(Number(kbId), question.trim())) }
    catch (e) { setResult({ answer: '问答失败: ' + (e instanceof Error ? e.message : ''), sources: [] }) }
    finally { setLoading(false) }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={() => navigate(`/kb/${kbId}`)} className="text-sm text-slate-400 hover:text-slate-600 mb-4 inline-block transition-colors">← 返回</button>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">{kb?.name} · 知识库问答</h2>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-6 flex gap-3">
        <input value={question} onChange={e => setQuestion(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && ask()}
          placeholder="基于知识库内容提问..."
          className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all" />
        <button onClick={ask} disabled={loading || !question.trim()}
          className="px-6 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-brand-700 disabled:bg-slate-200 disabled:text-slate-400 transition-all">
          {loading ? '思考中...' : '提问'}
        </button>
      </div>

      {loading && <LoadingSpinner text="AI 正在分析文档..." />}

      {result && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h3 className="font-semibold text-slate-700 mb-3">📋 回答</h3>
            <p className="text-slate-700 leading-relaxed text-sm whitespace-pre-wrap">{result.answer}</p>
          </div>
          {result.sources.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h3 className="font-semibold text-slate-700 mb-3">📎 参考来源</h3>
              <div className="space-y-3">
                {result.sources.map((s, i) => (
                  <div key={i} className="border-l-2 border-brand-200 pl-3">
                    <div className="text-xs font-medium text-brand-600">{s.fileName}</div>
                    <div className="text-xs text-slate-400 mt-1">{s.snippet}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
