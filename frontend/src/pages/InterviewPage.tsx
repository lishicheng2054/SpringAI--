import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { createSession, submitAnswer } from '../api/interview'
import type { CreateSessionResponse, SubmitAnswerResponse } from '../types/interview'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import { Clock, Send, Target } from 'lucide-react'

const TIME_PER_QUESTION = 120 // 每题秒数

export default function InterviewPage() {
  const { resumeId } = useParams<{ resumeId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const config = (location.state as any) || {}
  const roleType = config.roleType || 'Java后端'
  const questionCount = config.questionCount || 5

  const resumeSession = config.resumeSession === true
  const [session, setSession] = useState<CreateSessionResponse | null>(null)
  const [savedSessionId, setSavedSessionId] = useState(config.sessionId || '')
  const [answerText, setAnswerText] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef(Date.now())

  const clearTimer = () => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null } }

  const resetTimer = () => {
    clearTimer()
    setTimeLeft(TIME_PER_QUESTION)
    startTimeRef.current = Date.now()
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearTimer(); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  const start = useCallback(async () => {
    if (!resumeId) return
    setLoading(true); setError(null)
    try {
      if (resumeSession && savedSessionId && config.firstQuestion) {
        // 恢复已有会话
        setSession({
          sessionId: savedSessionId,
          firstQuestion: config.firstQuestion,
          currentStep: config.currentStep || 1,
          totalStep: config.totalStep || questionCount,
        })
      } else {
        const d = await createSession({ resumeId: Number(resumeId), roleType, questionCount })
        setSession(d)
        setSavedSessionId(d.sessionId)
      }
      resetTimer()
    } catch (e) { setError(e instanceof Error ? e.message : '创建失败') }
    finally { setLoading(false) }
  }, [resumeId])

  useEffect(() => { start(); return clearTimer }, [start])

  // 到时间自动提交
  useEffect(() => {
    if (timeLeft === 0 && session && !submitting && answerText.trim()) {
      handleSubmit()
    }
  }, [timeLeft])

  const handleSubmit = async () => {
    if (!session || submitting) return
    clearTimer()

    setSubmitting(true); setError(null)
    try {
      const r: SubmitAnswerResponse = await submitAnswer(session.sessionId, {
        questionId: session.firstQuestion.questionId,
        answerText: answerText.trim() || '[时间到，未作答]',
      })
      if (r.hasNext && r.nextQuestion) {
        setSession({ ...session, firstQuestion: r.nextQuestion, currentStep: session.currentStep + 1 })
        setAnswerText('')
        resetTimer()
      } else {
        navigate(`/result/${session.sessionId}`)
      }
    } catch (e) { setError(e instanceof Error ? e.message : '提交失败'); resetTimer() }
    finally { setSubmitting(false) }
  }

  if (loading) return <LoadingSpinner text="AI 正在生成面试题..." />
  if (error) return <ErrorMessage message={error} onRetry={start} />
  if (!session) return null

  const pct = Math.round((session.currentStep / session.totalStep) * 100)
  const timerPct = (timeLeft / TIME_PER_QUESTION) * 100
  const timerColor = timeLeft > 60 ? 'text-emerald-500' : timeLeft > 20 ? 'text-amber-500' : 'text-red-500'
  const timerBg   = timeLeft > 60 ? 'bg-emerald-100' : timeLeft > 20 ? 'bg-amber-100' : 'bg-red-100 animate-pulse'
  const mins = Math.floor(timeLeft / 60)
  const secs = timeLeft % 60

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Target className="w-6 h-6 text-brand-500" />
        <div>
          <h2 className="text-lg font-semibold text-slate-800">模拟面试</h2>
          <p className="text-xs text-slate-400">{session.currentStep}/{session.totalStep} 题</p>
        </div>
      </div>

      {/* 计时器 + 双重进度条 */}
      <div className="mb-5">
        <div className="flex items-center gap-3 mb-3">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-mono font-bold transition-colors duration-300 ${timerBg} ${timerColor}`}>
            <Clock className="w-4 h-4" />
            {mins}:{secs.toString().padStart(2, '0')}
          </div>
          <span className="text-xs text-slate-400">每题 {TIME_PER_QUESTION} 秒</span>
        </div>
        <div className="space-y-1.5">
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div className="bg-gradient-to-r from-brand-500 to-brand-600 h-full rounded-full transition-all duration-500 ease-out" style={{ width: `${pct}%` }} />
          </div>
          <div className="w-full bg-slate-50 rounded-full h-1 overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-1000 ease-linear ${
              timeLeft > 60 ? 'bg-emerald-400' : timeLeft > 20 ? 'bg-amber-400' : 'bg-red-400'
            }`} style={{ width: `${timerPct}%` }} />
          </div>
        </div>
      </div>

      {/* 题目 */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-5">
        <span className="text-xs font-semibold text-brand-500 uppercase tracking-wider mb-3 block">当前问题</span>
        <p className="text-slate-800 text-lg leading-relaxed">{session.firstQuestion.content}</p>
        {timeLeft <= 20 && (
          <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-500 flex items-center gap-2 animate-pulse">
            ⏰ 时间即将耗尽，请尽快作答！
          </div>
        )}
      </div>

      {/* 答案 */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">你的回答</label>
        <textarea value={answerText} onChange={e => setAnswerText(e.target.value)}
          placeholder={timeLeft < 30 ? '时间不多了，快速作答...' : '输入你的回答...（越详细评分越准确）'}
          rows={6} disabled={submitting}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent focus:bg-white transition-all resize-y mb-5" />
        <button onClick={handleSubmit} disabled={submitting || !answerText.trim()}
          className="w-full py-3.5 bg-brand-600 text-white rounded-2xl font-semibold hover:bg-brand-700 disabled:bg-slate-200 disabled:text-slate-400 transition-all shadow-lg shadow-brand-200 active:scale-[0.99] flex items-center justify-center gap-2">
          <Send className="w-4 h-4" />
          {submitting ? 'AI 评估中...' : timeLeft <= 10 ? '⏰ 快提交！' : '提交答案'}
        </button>
      </div>
    </div>
  )
}
