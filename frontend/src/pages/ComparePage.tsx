import { useState, useEffect} from 'react'
import { useNavigate } from 'react-router-dom'
import { getHistory } from '../api/interview'
import type { HistoryItem } from '../api/interview'
import request from '../api/request'
import LoadingSpinner from '../components/LoadingSpinner'

interface CompareItem {
  sessionId: string; roleType: string; totalScore: number
  techScore: number; communicationScore: number; logicScore: number
  summary: string; createdAt: string
}

export default function ComparePage() {
  const navigate = useNavigate()
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [results, setResults] = useState<CompareItem[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [comparing, setComparing] = useState(false)

  useEffect(() => { getHistory().then(setHistory).finally(() => setLoading(false)) }, [])

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else if (next.size < 5) next.add(id)
      return next
    })
  }

  const handleCompare = async () => {
    if (selected.size < 2) return
    setComparing(true)
    try {
      const ids = Array.from(selected).join(',')
      const { data } = await request.get<CompareItem[]>(`/api/interviews/compare?ids=${ids}`)
      setResults(data)
    } catch { alert('对比失败') }
    finally { setComparing(false) }
  }

  if (loading) return <LoadingSpinner text="加载面试记录..." />

  // 雷达图组件
  const RadarChart = ({ items }: { items: CompareItem[] }) => {
    const dims = ['techScore', 'communicationScore', 'logicScore'] as const
    const labels = ['技术', '沟通', '逻辑']
    const colors = ['#6366f1', '#ec4899', '#14b8a6', '#f59e0b', '#8b5cf6']
    const cx = 100; const cy = 100; const r = 80
    const angles = dims.map((_, i) => (Math.PI * 2 * i) / dims.length - Math.PI / 2)

    const points = (scores: number[]) =>
      angles.map((a, i) => `${cx + (r * scores[i] / 100) * Math.cos(a)},${cy + (r * scores[i] / 100) * Math.sin(a)}`).join(' ')

    return (
      <div className="flex flex-wrap justify-center gap-6">
        <svg width="240" height="240" viewBox="0 0 200 200" className="shrink-0">
          {/* 网格 */}
          {[0.25, 0.5, 0.75, 1].map(s => (
            <polygon key={s}
              points={angles.map(a => `${cx + r * s * Math.cos(a)},${cy + r * s * Math.sin(a)}`).join(' ')}
              fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
          ))}
          {angles.map((a, i) => (
            <line key={i} x1={cx} y1={cy} x2={cx + r * Math.cos(a)} y2={cy + r * Math.sin(a)} stroke="#e2e8f0" strokeWidth="0.5" />
          ))}
          {/* 数据多边形 */}
          {items.map((item, idx) => (
            <polygon key={idx}
              points={points([item.techScore, item.communicationScore, item.logicScore])}
              fill={colors[idx]} fillOpacity="0.15" stroke={colors[idx]} strokeWidth="2" />
          ))}
          {/* 标签 */}
          {angles.map((a, i) => (
            <text key={i} x={cx + (r + 18) * Math.cos(a)} y={cy + (r + 18) * Math.sin(a)}
              textAnchor="middle" dominantBaseline="middle" fontSize="9" fill="#94a3b8">{labels[i]}</text>
          ))}
        </svg>
        {/* 图例 */}
        <div className="flex flex-col gap-1.5 justify-center text-xs">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ background: colors[i] }} />
              <span className="text-slate-600">{item.roleType}</span>
              <span className="font-bold text-slate-800">{item.totalScore}分</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <h2 className="text-2xl font-bold text-slate-800 mb-1">面试对比分析</h2>
      <p className="text-slate-400 text-sm mb-8">选择 2~5 次面试记录进行横向对比</p>

      {/* 选择列表 */}
      {history.length === 0 ? (
        <div className="text-center py-20 text-slate-300">
          <div className="text-5xl mb-4">📊</div>
          <p>暂无面试记录可对比</p>
          <button onClick={() => navigate('/resume')} className="mt-4 text-brand-500 text-sm hover:underline">开始面试 →</button>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-slate-500">已选 {selected.size} / 5</span>
              <button onClick={handleCompare} disabled={selected.size < 2 || comparing}
                className="px-5 py-2 bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-brand-700 disabled:bg-slate-200 disabled:text-slate-400 transition-all">
                {comparing ? '对比中...' : '开始对比'}
              </button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {history.map(item => (
                <label key={item.sessionId}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${
                    selected.has(item.sessionId) ? 'bg-brand-50 border-brand-200' : 'bg-slate-50 border-transparent hover:bg-slate-100'
                  }`}>
                  <input type="checkbox" checked={selected.has(item.sessionId)}
                    onChange={() => toggleSelect(item.sessionId)} className="accent-brand-500" />
                  <div className="flex-1 flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-slate-700">{item.roleType}</span>
                      <span className="text-xs text-slate-400 ml-2">{new Date(item.createdAt).toLocaleDateString('zh-CN')}</span>
                    </div>
                    <span className="text-sm font-bold text-slate-600">{item.totalScore}分</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* 对比结果 */}
          {results && results.length >= 2 && (
            <div className="space-y-6 animate-fade-in">
              {/* 雷达图 */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h3 className="font-semibold text-slate-700 mb-4">📡 能力雷达图</h3>
                <RadarChart items={results} />
              </div>

              {/* 得分对比表 */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 overflow-x-auto">
                <h3 className="font-semibold text-slate-700 mb-4">📋 分数对比</h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left py-2 text-slate-400 font-medium">维度</th>
                      {results.map((r, i) => (
                        <th key={i} className="text-center py-2 text-slate-600 font-medium">{r.roleType}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { label: '总分', key: 'totalScore' as const },
                      { label: '技术', key: 'techScore' as const },
                      { label: '沟通', key: 'communicationScore' as const },
                      { label: '逻辑', key: 'logicScore' as const },
                    ].map(row => (
                      <tr key={row.label} className="border-b border-slate-50">
                        <td className="py-2.5 text-slate-500">{row.label}</td>
                        {results.map((r, i) => (
                          <td key={i} className="text-center py-2.5 font-bold"
                            style={{ color: ['#6366f1','#ec4899','#14b8a6','#f59e0b','#8b5cf6'][i] }}>
                            {r[row.key]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 评语对比 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {results.map((r, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: ['#6366f1','#ec4899','#14b8a6','#f59e0b','#8b5cf6'][i] }} />
                      <span className="font-medium text-slate-700 text-sm">{r.roleType} · {r.totalScore}分</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{r.summary}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
