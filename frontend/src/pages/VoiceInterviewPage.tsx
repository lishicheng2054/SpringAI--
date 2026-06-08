import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { createSession } from '../api/interview'
import type { CreateSessionResponse } from '../types/interview'
import LoadingSpinner from '../components/LoadingSpinner'

declare global { interface Window { SpeechRecognition: any; webkitSpeechRecognition: any } }

export default function VoiceInterviewPage() {
  const { resumeId } = useParams<{ resumeId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const config = (location.state as any) || {}
  const roleType = config.roleType || 'Java后端'
  const questionCount = config.questionCount || 5

  const [session, setSession] = useState<CreateSessionResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interim, setInterim] = useState('')
  const [questionText, setQuestionText] = useState('')
  const [status, setStatus] = useState('')
  const [step, setStep] = useState(1)
  const wsRef = useRef<WebSocket | null>(null)
  const recognitionRef = useRef<any>(null)

  // 初始化
  useEffect(() => {
    if (!resumeId) return
    (async () => {
      try {
        const s = await createSession({ resumeId: Number(resumeId), roleType, questionCount })
        setSession(s)
        setQuestionText(s.firstQuestion.content)
        setStep(1)
        speakText(s.firstQuestion.content)
        // 连接 WebSocket
        const ws = new WebSocket(`ws://localhost:8080/ws/voice-interview/${s.sessionId}`)
        ws.onmessage = (e) => {
          const msg = JSON.parse(e.data)
          if (msg.type === 'NEXT_QUESTION') {
            setQuestionText(msg.content)
            setStep(prev => prev + 1)
            setTranscript('')
            speakText(msg.content)
          } else if (msg.type === 'FINISHED') {
            setStatus('面试完成！')
            setTimeout(() => navigate(`/result/${s.sessionId}`), 2000)
          }
        }
        ws.onclose = () => setStatus('连接断开')
        wsRef.current = ws
      } catch { setStatus('创建面试失败') }
      finally { setLoading(false) }
    })()
    return () => { wsRef.current?.close(); stopRecognition() }
  }, [resumeId])

  // TTS：朗读文字
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const u = new SpeechSynthesisUtterance(text)
      u.lang = 'zh-CN'; u.rate = 0.9; u.pitch = 1
      window.speechSynthesis.speak(u)
    }
  }

  // STT：开始录音
  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { setStatus('浏览器不支持语音识别'); return }
    stopRecognition()
    const r = new SR()
    r.lang = 'zh-CN'; r.interimResults = true; r.continuous = true
    r.onresult = (e: any) => {
      let final = '', inter = ''
      for (let i = 0; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript
        else inter += e.results[i][0].transcript
      }
      if (final) setTranscript(prev => prev + final)
      setInterim(inter)
    }
    r.onerror = () => setListening(false)
    r.onend = () => setListening(false)
    r.start()
    recognitionRef.current = r
    setListening(true)
    setStatus('🎤 正在聆听...')
  }

  const stopRecognition = () => {
    recognitionRef.current?.stop()
    setListening(false)
  }

  // 提交语音答案
  const submitVoiceAnswer = () => {
    if (!session || !wsRef.current || !transcript.trim()) return
    stopRecognition()
    wsRef.current.send(JSON.stringify({
      type: 'ANSWER', questionId: session.firstQuestion.questionId, answerText: transcript.trim()
    }))
    setStatus('📤 已提交，AI 评估中...')
  }

  if (loading) return <LoadingSpinner text="正在准备语音面试..." />

  // 判断是否最后一题（提交后跳转result）
  const pct = (step / questionCount) * 100

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="text-center mb-8">
        <div className="text-5xl mb-4">🎙️</div>
        <h2 className="text-2xl font-bold text-slate-800 mb-1">语音面试</h2>
        <p className="text-slate-400 text-sm">AI 语音提问，你口述作答</p>
      </div>

      {/* 进度 */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-slate-500 mb-2">
          <span>第 {step}/{questionCount} 题</span><span>{pct}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2">
          <div className="bg-gradient-to-r from-violet-500 to-purple-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* 问题卡 */}
      <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl border border-violet-100 p-6 mb-6">
        <span className="text-xs font-semibold text-violet-500 uppercase tracking-wider mb-3 block">AI 提问</span>
        <p className="text-slate-800 text-lg leading-relaxed">{questionText}</p>
        <button onClick={() => speakText(questionText)}
          className="mt-3 text-xs text-violet-500 hover:text-violet-700 transition-colors">🔊 重新朗读</button>
      </div>

      {/* 状态 */}
      {status && (
        <div className={`mb-4 p-3 rounded-xl text-sm font-medium text-center ${status.includes('完成') ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-600'}`}>
          {status}
        </div>
      )}

      {/* 录音区 */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-5">
        <div className="text-center mb-4">
          <button
            onMouseDown={startListening}
            onMouseUp={stopRecognition}
            onTouchStart={startListening}
            onTouchEnd={stopRecognition}
            className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl transition-all shadow-lg mx-auto ${
              listening
                ? 'bg-red-500 scale-110 shadow-red-200 animate-pulse'
                : 'bg-violet-500 hover:bg-violet-600 shadow-violet-200 hover:scale-105'
            }`}
          >
            🎤
          </button>
          <p className="text-xs text-slate-400 mt-2">
            {listening ? '松开停止' : '按住说话'}
          </p>
        </div>

        {/* 转写文字 */}
        <div className="bg-slate-50 rounded-xl p-4 min-h-[80px] mb-4">
          <p className="text-slate-700 text-sm leading-relaxed">
            {transcript}
            {interim && <span className="text-slate-300">{interim}</span>}
          </p>
          {!transcript && !interim && (
            <p className="text-slate-300 text-sm">你的语音将在这里实时显示...</p>
          )}
        </div>

        <div className="flex gap-3">
          <button onClick={() => { setTranscript(''); setInterim('') }}
            className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm hover:bg-slate-200 transition-colors">
            清除
          </button>
          <button onClick={submitVoiceAnswer} disabled={!transcript.trim()}
            className="flex-1 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-700 disabled:bg-slate-200 disabled:text-slate-400 transition-all">
            提交回答
          </button>
        </div>
      </div>
    </div>
  )
}
