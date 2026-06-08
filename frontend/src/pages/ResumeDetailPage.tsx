import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getResume, analyzeResume, getAnalysis } from '../api/resume'
import { findUnfinished } from '../api/interview'
import type { UnfinishedSession } from '../api/interview'
import type { TemplateItem } from '../api/template'
import { listTemplates } from '../api/template'
import type { ResumeResponse, ResumeAnalysisResponse } from '../types/resume'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'

const ROLE_OPTIONS = ['Java后端', 'Python后端', '前端开发', '数据分析', 'DevOps', '产品经理', '全栈开发', '测试工程师']
const COUNT_OPTIONS = [3, 5, 8, 10]

export default function ResumeDetailPage() {
  const { resumeId } = useParams<{ resumeId: string }>()
  const navigate = useNavigate()
  const [resume, setResume] = useState<ResumeResponse | null>(null)
  const [analysis, setAnalysis] = useState<ResumeAnalysisResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showConfig, setShowConfig] = useState(false)
  const [roleType, setRoleType] = useState('Java后端')
  const [unfinished, setUnfinished] = useState<UnfinishedSession | null>(null)
  const [templates, setTemplates] = useState<TemplateItem[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null)
  const [questionCount, setQuestionCount] = useState(5)

  const fetch = useCallback(async () => {
    if (!resumeId) return
    setLoading(true); setError(null)
    try {
      const r = await getResume(Number(resumeId))
      setResume(r); setRoleType(r.targetPosition in ROLE_OPTIONS ? r.targetPosition : 'Java后端')
      try { setAnalysis(await getAnalysis(Number(resumeId))) } catch { /* 暂无 */ }
      try { setUnfinished(await findUnfinished(Number(resumeId))) } catch { /* 无 */ }
      try { setTemplates(await listTemplates()) } catch { /* 无 */ }
    } catch (e) { setError(e instanceof Error ? e.message : '加载失败') }
    finally { setLoading(false) }
  }, [resumeId])

  useEffect(() => { fetch() }, [fetch])

  const handleAnalyze = async () => {
    if (!resumeId) return
    setAnalyzing(true)
    try { setAnalysis(await analyzeResume(Number(resumeId))) }
    catch (e) { setError(e instanceof Error ? e.message : '分析失败') }
    finally { setAnalyzing(false) }
  }

  const startInterview = (mode: 'text' | 'voice') => {
    const path = mode === 'text' ? `/interview/${resumeId}` : `/voice/${resumeId}`
    navigate(path, { state: { roleType, questionCount, templateId: selectedTemplate } })
  }

  if (loading) return <LoadingSpinner text="加载简历..." />
  if (error) return <ErrorMessage message={error} onRetry={fetch} />
  if (!resume) return null

  const selClass = "px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">简历详情</h2>

      {/* 基本信息 */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-slate-800 text-lg">{resume.candidateName}</h3>
            <p className="text-sm text-slate-500">{resume.targetPosition}</p>
          </div>
          <span className="text-xs px-2 py-1 bg-slate-100 text-slate-500 rounded-full">
            {resume.sourceType === 'FILE' ? '📎 文件' : '📝 文本'}
          </span>
        </div>
        <div className="bg-slate-50 rounded-xl p-4 max-h-40 overflow-y-auto">
          <p className="text-sm text-slate-600 whitespace-pre-wrap">{resume.resumeText}</p>
        </div>
      </div>

      {/* AI 分析 */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-700">🤖 AI 简历分析</h3>
          {!analysis && (
            <button onClick={handleAnalyze} disabled={analyzing}
              className="px-4 py-2 bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-brand-700 disabled:bg-slate-200 transition-all">
              {analyzing ? '分析中...' : '开始分析'}
            </button>
          )}
        </div>
        {analyzing && <LoadingSpinner text="AI 正在分析简历..." />}
        {analysis && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-4 bg-brand-50 rounded-xl">
              <p className="text-sm text-brand-700 leading-relaxed">{analysis.summary}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { title: '💪 技能', items: analysis.skills, color: 'bg-blue-50 text-blue-700' },
                { title: '✅ 优势', items: analysis.advantages, color: 'bg-emerald-50 text-emerald-700' },
                { title: '⚠️ 风险', items: analysis.risks, color: 'bg-amber-50 text-amber-700' },
                { title: '💡 建议', items: analysis.suggestions, color: 'bg-purple-50 text-purple-700' },
              ].map(sec => (
                <div key={sec.title} className={`${sec.color} rounded-xl p-3`}>
                  <div className="text-xs font-medium mb-1.5">{sec.title}</div>
                  <ul className="space-y-1">
                    {sec.items.map((item, i) => <li key={i} className="text-xs opacity-80">{item}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 面试配置 */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4 cursor-pointer" onClick={() => setShowConfig(!showConfig)}>
          <h3 className="font-semibold text-slate-700">⚙️ 面试配置</h3>
          <span className="text-xs text-slate-400">{showConfig ? '收起 ▲' : '展开 ▼'}</span>
        </div>
        {showConfig && (
          <div className="space-y-4 animate-fade-in">
            {/* 模板选择 */}
            {templates.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">面试模板（可选）</label>
                <select value={selectedTemplate ?? ''} onChange={e => {
                  const v = e.target.value ? Number(e.target.value) : null; setSelectedTemplate(v)
                }} className={`w-full ${selClass}`}>
                  <option value="">不使用模板（AI自动出题）</option>
                  {templates.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.questionCount}题 · {t.roleType || '通用'})</option>
                  ))}
                </select>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">目标岗位</label>
              <select value={roleType} onChange={e => setRoleType(e.target.value)} className={`w-full ${selClass}`}>
                {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">题目数量</label>
              <div className="flex gap-2">
                {COUNT_OPTIONS.map(n => (
                  <button key={n} onClick={() => setQuestionCount(n)}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                      questionCount === n ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}>{n}题</button>
                ))}
              </div>
            </div>
            </div>
          </div>
        )}
      </div>

      {/* 中断恢复提示 */}
      {unfinished && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-amber-500 text-lg">⚠️</span>
                <span className="font-semibold text-amber-800 text-sm">未完成的面试</span>
              </div>
              <p className="text-xs text-amber-600">
                {unfinished.roleType} · 已答 {unfinished.currentStep - 1}/{unfinished.totalStep} 题 · 状态: {unfinished.status}
              </p>
            </div>
            <button onClick={() => navigate(`/interview/${resume.id}`, {
              state: { sessionId: unfinished.sessionId, roleType: unfinished.roleType, questionCount: unfinished.totalStep, resumeSession: true, firstQuestion: unfinished.currentQuestion, currentStep: unfinished.currentStep, totalStep: unfinished.totalStep }
            })}
              className="px-5 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-medium hover:bg-amber-600 transition-all shrink-0">
              继续面试 →
            </button>
          </div>
        </div>
      )}

      {/* 开始面试 */}
      <div className="flex gap-3">
        <button onClick={() => startInterview('text')}
          className="flex-1 py-3.5 bg-brand-600 text-white rounded-2xl font-semibold hover:bg-brand-700 transition-all shadow-lg shadow-brand-200">
          📝 文字面试 ({questionCount}题)
        </button>
        <button onClick={() => startInterview('voice')}
          className="flex-1 py-3.5 bg-violet-600 text-white rounded-2xl font-semibold hover:bg-violet-700 transition-all shadow-lg shadow-violet-200">
          🎙️ 语音面试 ({questionCount}题)
        </button>
      </div>
    </div>
  )
}
