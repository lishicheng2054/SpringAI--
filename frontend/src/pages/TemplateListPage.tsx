import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { listTemplates, createTemplate, deleteTemplate } from '../api/template'
import type { TemplateItem } from '../api/template'
import LoadingSpinner from '../components/LoadingSpinner'

const inputClass = "w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"

export default function TemplateListPage() {
  const navigate = useNavigate()
  const [templates, setTemplates] = useState<TemplateItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [f, setF] = useState({ name: '', description: '', roleType: '', questionIds: '' })

  const fetch = useCallback(async () => {
    setLoading(true)
    try { setTemplates(await listTemplates()) } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const handleAdd = async () => {
    if (!f.name.trim() || !f.questionIds.trim()) { alert('请填写名称和题目ID'); return }
    try {
      const ids = f.questionIds.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n))
      await createTemplate({ name: f.name, description: f.description, roleType: f.roleType, questionIds: ids })
      setShowAdd(false); setF({ name: '', description: '', roleType: '', questionIds: '' }); fetch()
    } catch { alert('创建失败') }
  }

  if (loading) return <LoadingSpinner text="加载模板..." />

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-1">面试模板</h2>
          <p className="text-slate-400 text-sm">{templates.length} 个模板</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)}
          className="px-4 py-2 bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-brand-700 transition-all">
          + 新建模板
        </button>
      </div>

      {showAdd && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-6 space-y-3 animate-fade-in">
          <input placeholder="模板名称 *" value={f.name} onChange={e => setF({...f, name:e.target.value})} className={inputClass} />
          <input placeholder="描述" value={f.description} onChange={e => setF({...f, description:e.target.value})} className={inputClass} />
          <input placeholder="岗位" value={f.roleType} onChange={e => setF({...f, roleType:e.target.value})} className={inputClass} />
          <input placeholder="题目ID列表(逗号分隔) * 如: 1,3,5,7,9" value={f.questionIds}
            onChange={e => setF({...f, questionIds:e.target.value})} className={inputClass} />
          <button onClick={handleAdd} className="w-full py-2 bg-brand-600 text-white rounded-xl text-sm hover:bg-brand-700 transition-all">确认创建</button>
        </div>
      )}

      {templates.length === 0 ? (
        <div className="text-center py-20 text-slate-300"><div className="text-5xl mb-4">📋</div><p>暂无模板，创建一个吧</p></div>
      ) : (
        <div className="space-y-3">
          {templates.map(t => (
            <div key={t.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-slate-800">{t.name}</h3>
                    {t.isDefault && <span className="text-[10px] px-1.5 py-0.5 bg-amber-50 text-amber-600 rounded">默认</span>}
                  </div>
                  <p className="text-xs text-slate-400">{t.description || '无描述'} · {t.roleType || '通用'} · {t.questionCount}题 · 使用{t.useCount}次</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => navigate(`/question-bank`)}
                    className="px-3 py-1.5 text-xs bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors">题库</button>
                  <button onClick={() => { if (confirm('删除？')) { deleteTemplate(t.id).then(fetch) } }}
                    className="px-3 py-1.5 text-xs text-red-400 hover:bg-red-50 rounded-lg transition-colors">删除</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
