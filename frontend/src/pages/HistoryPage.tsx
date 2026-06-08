import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getHistory } from '../api/interview'
import type { HistoryItem } from '../api/interview'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'

export default function HistoryPage() {
  const navigate = useNavigate()
  const [items, setItems] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true); setError(null)
    try { setItems(await getHistory()) }
    catch (e) { setError(e instanceof Error ? e.message : '加载失败') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  if (loading) return <LoadingSpinner text="加载面试历史..." />
  if (error) return <ErrorMessage message={error} onRetry={fetch} />

  // 统计
  const avgScore = items.length > 0 ? Math.round(items.reduce((s, i) => s + i.totalScore, 0) / items.length) : 0
  const bestScore = items.length > 0 ? Math.max(...items.map(i => i.totalScore)) : 0
  const scoresForTrend = [...items].reverse().map(i => i.totalScore)

  const scoreColor = (s: number) => s >= 75 ? 'bg-emerald-400' : s >= 50 ? 'bg-amber-400' : 'bg-red-400'

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-1">面试历史</h2>
        <p className="text-slate-400 text-sm">追踪你的面试表现和进步趋势</p>
      </div>

      {/* 统计卡片 */}
      {items.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: '面试次数', value: items.length, unit: '次', color: 'text-brand-600' },
            { label: '平均分', value: avgScore, unit: '分', color: 'text-amber-600' },
            { label: '最高分', value: bestScore, unit: '分', color: 'text-emerald-600' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 text-center">
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}<span className="text-sm font-normal text-slate-400 ml-1">{s.unit}</span></div>
              <div className="text-xs text-slate-400 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* 趋势图 */}
      {items.length >= 2 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
          <h3 className="font-semibold text-slate-700 mb-4 text-sm">📈 分数趋势</h3>
          <div className="flex items-end gap-2 h-32">
            {scoresForTrend.map((score, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-slate-500 font-medium">{score}</span>
                <div className={`w-full rounded-t-lg transition-all duration-500 ${scoreColor(score)}`}
                  style={{ height: `${Math.max(score, 5)}%` }} />
                <span className="text-[10px] text-slate-300">#{i + 1}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 历史列表 */}
      {items.length === 0 ? (
        <div className="text-center py-20 text-slate-300">
          <div className="text-5xl mb-4">📋</div>
          <p>暂无面试记录</p>
          <button onClick={() => navigate('/resume')} className="mt-4 text-brand-500 text-sm hover:underline">开始第一次面试 →</button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.sessionId} onClick={() => navigate(`/result/${item.sessionId}`)}
              className="group bg-white rounded-2xl border border-slate-100 shadow-sm p-5 cursor-pointer hover:shadow-md hover:border-brand-200 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-800">{item.roleType || '面试'}</span>
                    <span className="text-xs text-slate-400">{new Date(item.createdAt).toLocaleDateString('zh-CN')}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{item.questionCount} 题 · 状态: {item.status}</p>
                  <button onClick={e => { e.stopPropagation(); navigate(`/resume/${item.resumeId}`) }}
                    className="text-xs text-brand-500 hover:underline mt-0.5">查看简历 →</button>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className={`text-xl font-bold ${scoreColor(item.totalScore).replace('bg-', 'text-')}`}>{item.totalScore}</div>
                    <div className="text-[10px] text-slate-300">分</div>
                  </div>
                  <span className="text-slate-300 group-hover:text-brand-500 transition-colors">→</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
