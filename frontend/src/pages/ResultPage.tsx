import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getResult } from '../api/interview'
import type { InterviewResultResponse } from '../types/interview'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import { Award, TrendingUp, MessageSquare, Lightbulb, Download, Home } from 'lucide-react'

export default function ResultPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const [result, setResult] = useState<InterviewResultResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    if (!sessionId) return
    setLoading(true); setError(null)
    try { setResult(await getResult(sessionId)) }
    catch (e) { setError(e instanceof Error ? e.message : '加载失败') }
    finally { setLoading(false) }
  }, [sessionId])

  useEffect(() => { fetch() }, [fetch])

  if (loading) return <LoadingSpinner text="正在加载评估报告..." />
  if (error) return <ErrorMessage message={error} onRetry={fetch} />
  if (!result) return null

  const scoreColor = (s: number) => s >= 75 ? 'text-emerald-500' : s >= 50 ? 'text-amber-500' : 'text-red-400'
  const scoreBg = (s: number) => s >= 75 ? 'bg-emerald-50' : s >= 50 ? 'bg-amber-50' : 'bg-red-50'

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-50 mb-4">
          <Award className="w-8 h-8 text-brand-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">面试评估报告</h2>
        <p className="text-slate-400 text-sm">{result.status === 'EVALUATED' ? 'AI 评估完成' : result.status}</p>
      </div>

      {/* 总分 */}
      <div className={`${scoreBg(result.totalScore)} rounded-3xl p-8 text-center mb-6`}>
        <div className="text-sm text-slate-500 mb-2 font-medium">综合总分</div>
        <div className={`text-7xl font-extrabold ${scoreColor(result.totalScore)}`}>
          {result.totalScore}
        </div>
        <div className="text-sm text-slate-400 mt-2">满分 100</div>
      </div>

      {/* 维度 */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: '技术能力', score: result.techScore, Icon: TrendingUp },
          { label: '沟通表达', score: result.communicationScore, Icon: MessageSquare },
          { label: '逻辑思维', score: result.logicScore, Icon: Lightbulb },
        ].map(d => (
          <div key={d.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 text-center">
            <d.Icon className="w-4 h-4 text-slate-400 mx-auto mb-1.5" />
            <div className="text-xs text-slate-400 mb-1.5">{d.label}</div>
            <div className={`text-2xl font-bold ${scoreColor(d.score)}`}>{d.score}</div>
          </div>
        ))}
      </div>

      {/* 总结 */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-4">
        <h3 className="font-semibold text-slate-700 mb-3">📋 综合评语</h3>
        <p className="text-slate-600 leading-relaxed text-sm">{result.summary}</p>
      </div>

      {/* 优缺点 */}
      <div className="space-y-3 mb-8">
        {[
          { title: '优势亮点', items: result.strengths, icon: '✅', color: 'border-l-emerald-400 bg-emerald-50/50' },
          { title: '不足之处', items: result.weaknesses, icon: '⚠️', color: 'border-l-amber-400 bg-amber-50/50' },
          { title: '改进建议', items: result.improvements, icon: '💡', color: 'border-l-blue-400 bg-blue-50/50' },
        ].map(s => (
          <div key={s.title} className={`${s.color} border-l-4 rounded-r-2xl p-5`}>
            <h3 className="font-semibold text-slate-700 text-sm mb-2">{s.icon} {s.title}</h3>
            <ul className="space-y-1.5">
              {s.items.map((item, i) => (
                <li key={i} className="text-sm text-slate-600 flex gap-2">
                  <span className="text-slate-300">•</span> {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button onClick={() => { window.open(`/api/interviews/sessions/${sessionId}/export`) }}
          className="flex-1 py-3.5 bg-white border-2 border-slate-200 text-slate-700 rounded-2xl font-semibold hover:border-brand-300 hover:text-brand-600 transition-all flex items-center justify-center gap-2">
          <Download className="w-5 h-5" /> 导出 PDF
        </button>
        <button onClick={() => navigate('/')}
          className="flex-1 py-3.5 bg-brand-600 text-white rounded-2xl font-semibold hover:bg-brand-700 transition-all shadow-lg shadow-brand-200 flex items-center justify-center gap-2">
          <Home className="w-5 h-5" /> 返回首页
        </button>
      </div>
    </div>
  )
}
