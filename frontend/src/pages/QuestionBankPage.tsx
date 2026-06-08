import { useState, useEffect, useCallback } from 'react'
import { searchQuestions, getGroupedQuestions, createQuestion, deleteQuestion } from '../api/questionBank'
import type { QuestionItem } from '../api/questionBank'
import LoadingSpinner from '../components/LoadingSpinner'

const CATEGORIES = ['ALGORITHM','SYSTEM_DESIGN','BEHAVIORAL','TECH','HR']
const CAT_LABELS: Record<string,string> = {
  ALGORITHM:'算法', SYSTEM_DESIGN:'系统设计', BEHAVIORAL:'行为面试', TECH:'技术', HR:'HR'
}
const DIFF_LABELS: Record<string,string> = { easy:'简单', mid:'中等', hard:'困难' }

export default function QuestionBankPage() {
  const [questions, setQuestions] = useState<QuestionItem[]>([])
  const [grouped, setGrouped] = useState<Record<string, QuestionItem[]>>({})
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'grouped'|'list'>('grouped')
  const [showAdd, setShowAdd] = useState(false)
  const [f, setF] = useState({ content:'', category:'TECH', difficulty:'mid', roleType:'', tags:'' })
  const [filter, setFilter] = useState('')

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      if (view === 'grouped') setGrouped(await getGroupedQuestions())
      else setQuestions(await searchQuestions({ keyword: filter || undefined }))
    } finally { setLoading(false) }
  }, [view, filter])

  useEffect(() => { fetch() }, [fetch])

  const handleAdd = async () => {
    if (!f.content.trim()) return
    try { await createQuestion(f); setShowAdd(false); setF({ content:'', category:'TECH', difficulty:'mid', roleType:'', tags:'' }); fetch() }
    catch { alert('创建失败') }
  }

  if (loading) return <LoadingSpinner text="加载题库..." />

  const inputClass = "w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-1">面试题库</h2>
          <p className="text-slate-400 text-sm">{Object.values(grouped).flat().length || questions.length} 道题目</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setView(view==='grouped'?'list':'grouped')}
            className="px-3 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs hover:bg-slate-200 transition-colors">
            {view==='grouped' ? '列表视图' : '分类视图'}
          </button>
          <button onClick={() => setShowAdd(!showAdd)}
            className="px-4 py-2 bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-brand-700 transition-all">
            + 添加
          </button>
        </div>
      </div>

      {showAdd && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-6 grid grid-cols-2 gap-3 animate-fade-in">
          <textarea placeholder="题目内容 *" value={f.content} onChange={e => setF({...f, content:e.target.value})}
            className={`${inputClass} col-span-2`} rows={3} />
          <select value={f.category} onChange={e => setF({...f, category:e.target.value})} className={inputClass}>
            {CATEGORIES.map(c=><option key={c} value={c}>{CAT_LABELS[c]}</option>)}
          </select>
          <select value={f.difficulty} onChange={e => setF({...f, difficulty:e.target.value})} className={inputClass}>
            {Object.entries(DIFF_LABELS).map(([k,v])=><option key={k} value={k}>{v}</option>)}
          </select>
          <input placeholder="岗位" value={f.roleType} onChange={e => setF({...f, roleType:e.target.value})} className={inputClass} />
          <input placeholder="标签(逗号分隔)" value={f.tags} onChange={e => setF({...f, tags:e.target.value})} className={inputClass} />
          <button onClick={handleAdd} className="col-span-2 py-2 bg-brand-600 text-white rounded-xl text-sm hover:bg-brand-700 transition-all">确认添加</button>
        </div>
      )}

      {view === 'list' && (
        <input placeholder="搜索题目..." value={filter} onChange={e => setFilter(e.target.value)}
          className={`${inputClass} mb-4`} />
      )}

      {view === 'grouped' ? (
        <div className="space-y-6">
          {CATEGORIES.filter(c => grouped[c]?.length > 0).map(cat => (
            <div key={cat}>
              <h3 className="font-semibold text-slate-700 mb-3 text-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-500" />
                {CAT_LABELS[cat]} <span className="text-slate-400 font-normal">({grouped[cat].length}题)</span>
              </h3>
              <div className="space-y-2">
                {grouped[cat].map(q => (
                  <QuestionCard key={q.id} q={q} onDelete={() => { deleteQuestion(q.id).then(fetch) }} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {questions.map(q => (
            <QuestionCard key={q.id} q={q} onDelete={() => { deleteQuestion(q.id).then(fetch) }} />
          ))}
        </div>
      )}
    </div>
  )
}

function QuestionCard({ q, onDelete }: { q: QuestionItem; onDelete: () => void }) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-slate-700 leading-relaxed">{q.content}</p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded">{q.category}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded ${
              q.difficulty==='easy'?'bg-emerald-50 text-emerald-600':
              q.difficulty==='hard'?'bg-red-50 text-red-500':'bg-amber-50 text-amber-600'
            }`}>{DIFF_LABELS[q.difficulty]||q.difficulty}</span>
            {q.roleType && <span className="text-[10px] text-slate-400">{q.roleType}</span>}
            {q.tags && <span className="text-[10px] text-slate-300">{q.tags}</span>}
          </div>
        </div>
        <button onClick={onDelete} className="text-red-300 hover:text-red-500 text-xs shrink-0 transition-colors">删除</button>
      </div>
    </div>
  )
}
