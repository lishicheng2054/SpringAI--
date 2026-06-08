import { useState, useEffect, useCallback } from 'react'
import { listSchedules, createSchedule, updateStatus, deleteSchedule } from '../api/interviewSchedule'
import type { ScheduleResponse, ScheduleStatus } from '../types/interviewSchedule'
import LoadingSpinner from '../components/LoadingSpinner'

const STATUS: Record<ScheduleStatus, { label: string; color: string }> = {
  PENDING:  { label: '待面试', color: 'bg-amber-50 text-amber-600' },
  READY:    { label: '已准备', color: 'bg-blue-50 text-blue-600' },
  DONE:     { label: '已完成', color: 'bg-emerald-50 text-emerald-600' },
  CANCELLED:{ label: '已取消', color: 'bg-slate-100 text-slate-400' },
}

const inputClass = "w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"

export default function InterviewSchedulePage() {
  const [schedules, setSchedules] = useState<ScheduleResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [f, setF] = useState({ title: '', companyName: '', roleType: '', startTime: '', endTime: '', location: '', meetingLink: '', notes: '' })

  const fetch = useCallback(async () => {
    setLoading(true); setError(null)
    try { setSchedules(await listSchedules()) }
    catch (e) { setError(e instanceof Error ? e.message : '加载失败') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const submit = async () => {
    if (!f.title || !f.startTime) return
    try {
      await createSchedule({ title: f.title, companyName: f.companyName, roleType: f.roleType, startTime: f.startTime, endTime: f.endTime || f.startTime, location: f.location, meetingLink: f.meetingLink, notes: f.notes })
      setShowForm(false); setF({ title: '', companyName: '', roleType: '', startTime: '', endTime: '', location: '', meetingLink: '', notes: '' }); await fetch()
    } catch (e) { setError(e instanceof Error ? e.message : '创建失败') }
  }

  const setStatus = async (id: number, s: ScheduleStatus) => { try { await updateStatus(id, s); await fetch() } catch (e) {} }

  if (loading) return <LoadingSpinner text="加载日程..." />
  if (error) return <div className="text-center py-16 text-red-500 text-sm">{error}</div>

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-1">面试日程</h2>
          <p className="text-slate-400 text-sm">管理你的面试安排</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="px-5 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-brand-700 transition-all">
          {showForm ? '取消' : '+ 新建'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-6 grid grid-cols-2 gap-3 animate-fade-in">
          <input placeholder="面试标题 *" value={f.title} onChange={e => setF({...f, title: e.target.value})} className={`${inputClass} col-span-2`} />
          <input placeholder="公司名称" value={f.companyName} onChange={e => setF({...f, companyName: e.target.value})} className={inputClass} />
          <input placeholder="岗位" value={f.roleType} onChange={e => setF({...f, roleType: e.target.value})} className={inputClass} />
          <input type="datetime-local" value={f.startTime} onChange={e => setF({...f, startTime: e.target.value})} className={inputClass} />
          <input type="datetime-local" value={f.endTime} onChange={e => setF({...f, endTime: e.target.value})} className={inputClass} />
          <input placeholder="地点" value={f.location} onChange={e => setF({...f, location: e.target.value})} className={inputClass} />
          <input placeholder="会议链接" value={f.meetingLink} onChange={e => setF({...f, meetingLink: e.target.value})} className={inputClass} />
          <input placeholder="备注" value={f.notes} onChange={e => setF({...f, notes: e.target.value})} className={`${inputClass} col-span-2`} />
          <button onClick={submit} className="col-span-2 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-brand-700 transition-all">创建</button>
        </div>
      )}

      {schedules.length === 0 ? (
        <div className="text-center py-20 text-slate-300"><div className="text-5xl mb-4">📅</div><p>暂无面试安排</p></div>
      ) : (
        <div className="space-y-3">
          {schedules.map(s => {
            const st = STATUS[s.status] || STATUS.PENDING
            return (
              <div key={s.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-800 truncate">{s.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${st.color} shrink-0`}>{st.label}</span>
                    </div>
                    <p className="text-sm text-slate-500">{s.companyName}{s.roleType && ` · ${s.roleType}`}</p>
                    <p className="text-xs text-slate-400 mt-1.5">
                      {new Date(s.startTime).toLocaleString('zh-CN')}
                      {s.endTime && ` ~ ${new Date(s.endTime).toLocaleString('zh-CN')}`}
                      {s.location && ` · ${s.location}`}
                    </p>
                  </div>
                  <div className="flex gap-1 ml-3 shrink-0">
                    {s.status === 'PENDING' && <button onClick={() => setStatus(s.id, 'READY')} className="px-2.5 py-1.5 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">准备</button>}
                    {(s.status === 'PENDING' || s.status === 'READY') && <button onClick={() => setStatus(s.id, 'DONE')} className="px-2.5 py-1.5 text-xs bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors">完成</button>}
                    {s.status !== 'CANCELLED' && <button onClick={() => setStatus(s.id, 'CANCELLED')} className="px-2.5 py-1.5 text-xs bg-red-50 text-red-400 rounded-lg hover:bg-red-100 transition-colors">取消</button>}
                    <button onClick={() => { if (confirm('删除？')) { deleteSchedule(s.id).then(fetch) } }} className="px-2.5 py-1.5 text-xs text-slate-300 hover:text-red-400 transition-colors">删除</button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
