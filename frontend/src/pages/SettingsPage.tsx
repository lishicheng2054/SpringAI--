import { useState, useEffect, useCallback } from 'react'
import { listProviders, createProvider, updateProvider, deleteProvider, testProvider } from '../api/llmProvider'
import type { ProviderDTO } from '../api/llmProvider'
import LoadingSpinner from '../components/LoadingSpinner'

const inputClass = "w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"

export default function SettingsPage() {
  const [providers, setProviders] = useState<ProviderDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ text: string; ok: boolean } | null>(null)
  const [testing, setTesting] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [f, setF] = useState({ id: '', baseUrl: '', apiKey: '', model: '', temp: '' })

  const fetch = useCallback(async () => {
    setLoading(true)
    try { setProviders(await listProviders()) }
    catch { flash('加载失败', false) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const flash = (t: string, ok: boolean) => { setToast({ text: t, ok }); setTimeout(() => setToast(null), 3000) }

  const add = async () => {
    if (!f.id || !f.baseUrl || !f.apiKey || !f.model) { flash('请填写所有必填项', false); return }
    try {
      await createProvider({ id: f.id, baseUrl: f.baseUrl, apiKey: f.apiKey, model: f.model, temperature: f.temp ? Number(f.temp) : undefined })
      setShowAdd(false); setF({ id: '', baseUrl: '', apiKey: '', model: '', temp: '' }); await fetch(); flash('创建成功', true)
    } catch (e) { flash(e instanceof Error ? e.message : '失败', false) }
  }

  const toggle = async (p: ProviderDTO) => {
    try { await updateProvider(p.id, { enabled: !p.enabled }); await fetch() }
    catch (e) { flash(e instanceof Error ? e.message : '', false) }
  }

  const del = async (id: string) => {
    if (!confirm(`删除 "${id}"？`)) return
    try { await deleteProvider(id); await fetch(); flash('已删除', true) }
    catch (e) { flash(e instanceof Error ? e.message : '', false) }
  }

  const test = async (id: string) => {
    setTesting(id)
    try { const r = await testProvider(id); flash(r.success ? '连接成功 ✅' : '失败: ' + r.message, r.success) }
    catch (e) { flash(e instanceof Error ? e.message : '', false) }
    finally { setTesting(null) }
  }

  if (loading) return <LoadingSpinner text="加载设置..." />

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-1">Provider 设置</h2>
          <p className="text-slate-400 text-sm">管理 LLM 模型服务商</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)}
          className="px-5 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-brand-700 transition-all">{showAdd ? '取消' : '+ 新增'}</button>
      </div>

      {toast && (
        <div className={`mb-4 p-3 rounded-xl text-sm font-medium ${toast.ok ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-100'}`}>{toast.text}</div>
      )}

      {showAdd && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-6 grid grid-cols-2 gap-3 animate-fade-in">
          <input placeholder="ID * (如 deepseek)" value={f.id} onChange={e => setF({...f, id: e.target.value})} className={inputClass} />
          <input placeholder="Model * (如 deepseek-chat)" value={f.model} onChange={e => setF({...f, model: e.target.value})} className={inputClass} />
          <input placeholder="Base URL *" value={f.baseUrl} onChange={e => setF({...f, baseUrl: e.target.value})} className={`${inputClass} col-span-2`} />
          <input placeholder="API Key *" value={f.apiKey} onChange={e => setF({...f, apiKey: e.target.value})} className={`${inputClass} col-span-2`} />
          <input placeholder="Temperature (可选)" value={f.temp} onChange={e => setF({...f, temp: e.target.value})} className={inputClass} />
          <button onClick={add} className="py-2 bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-brand-700 transition-all">确认新增</button>
        </div>
      )}

      {providers.length === 0 ? (
        <div className="text-center py-20 text-slate-300"><div className="text-5xl mb-4">⚙️</div><p>暂无 Provider</p></div>
      ) : (
        <div className="space-y-3">
          {providers.map(p => (
            <div key={p.id} className={`bg-white rounded-2xl border shadow-sm p-5 transition-all ${p.enabled ? 'border-slate-100 hover:shadow-md' : 'border-red-100 bg-red-50/30'}`}>
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-slate-800">{p.id}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.enabled ? 'bg-emerald-50 text-emerald-600' : 'bg-red-100 text-red-500'}`}>{p.enabled ? '启用' : '禁用'}</span>
                  </div>
                  <p className="text-xs text-slate-400 truncate">{p.baseUrl} · {p.model} · {p.maskedApiKey}</p>
                </div>
                <div className="flex gap-1.5 ml-3 shrink-0">
                  <button onClick={() => test(p.id)} disabled={testing === p.id}
                    className="px-3 py-1.5 text-xs bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors">{testing === p.id ? '...' : '测试'}</button>
                  <button onClick={() => toggle(p)}
                    className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${p.enabled ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}>{p.enabled ? '禁用' : '启用'}</button>
                  <button onClick={() => del(p.id)} className="px-3 py-1.5 text-xs text-red-400 hover:bg-red-50 rounded-lg transition-colors">删除</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
