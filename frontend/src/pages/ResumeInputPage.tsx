import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createResume, uploadResume } from '../api/resume'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import { FileText, Upload, User, Briefcase } from 'lucide-react'

export default function ResumeInputPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<'text' | 'file'>('text')
  const [candidateName, setCandidateName] = useState('')
  const [targetPosition, setTargetPosition] = useState('')
  const [resumeText, setResumeText] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async () => {
    setError(null)
    if (mode === 'text') {
      if (!candidateName.trim() || !targetPosition.trim() || !resumeText.trim()) { setError('请填写姓名、岗位和简历内容'); return }
      setLoading(true)
      try { const r = await createResume({ candidateName: candidateName.trim(), targetPosition: targetPosition.trim(), resumeText: resumeText.trim(), sourceType: 'TEXT' }); navigate(`/resume/${r.resumeId}`) }
      catch (e) { setError(e instanceof Error ? e.message : '创建失败') } finally { setLoading(false) }
    } else {
      if (!candidateName.trim() || !targetPosition.trim() || !file) { setError('请填写姓名、岗位并选择文件'); return }
      setLoading(true)
      try { const r = await uploadResume(candidateName.trim(), targetPosition.trim(), file); navigate(`/resume/${r.id}`) }
      catch (e) { setError(e instanceof Error ? e.message : '上传失败') } finally { setLoading(false) }
    }
  }

  if (loading) return <LoadingSpinner text="正在处理简历..." />
  if (error) return <ErrorMessage message={error} onRetry={() => setError(null)} />

  const inputClass = "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent focus:bg-white transition-all"

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <FileText className="w-6 h-6 text-brand-500" />
        <h2 className="text-2xl font-bold text-slate-800">简历录入</h2>
      </div>

      <div className="flex bg-slate-100 p-1 rounded-xl mb-6 w-fit">
        {(['text', 'file'] as const).map(m => (
          <button key={m} onClick={() => setMode(m)}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${mode === m ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            {m === 'text' ? <FileText className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
            {m === 'text' ? '文本输入' : '文件上传'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1.5"><User className="w-3.5 h-3.5 text-slate-400" />姓名</label>
            <input type="text" value={candidateName} onChange={e => setCandidateName(e.target.value)} placeholder="张三" className={inputClass} />
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1.5"><Briefcase className="w-3.5 h-3.5 text-slate-400" />目标岗位</label>
            <input type="text" value={targetPosition} onChange={e => setTargetPosition(e.target.value)} placeholder="Java 后端开发" className={inputClass} />
          </div>
        </div>
        {mode === 'text' ? (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">简历内容</label>
            <textarea value={resumeText} onChange={e => setResumeText(e.target.value)} placeholder="粘贴简历内容，包含工作经验、项目经历、技术栈..." rows={12} className={`${inputClass} resize-y`} />
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">上传简历文件</label>
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center hover:border-brand-300 hover:bg-brand-50/30 transition-all cursor-pointer">
              <Upload className="w-8 h-8 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500 mb-3">拖拽或点击选择文件</p>
              <input type="file" accept=".pdf,.doc,.docx,.txt" onChange={e => setFile(e.target.files?.[0] || null)}
                className="text-sm text-slate-600 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 transition-all" />
              {file && <p className="text-xs text-brand-600 mt-3 font-medium">已选择: {file.name} ({(file.size / 1024).toFixed(1)} KB)</p>}
            </div>
          </div>
        )}
        <button onClick={submit} className="w-full py-3.5 bg-brand-600 text-white rounded-2xl font-semibold hover:bg-brand-700 transition-all shadow-lg shadow-brand-200 active:scale-[0.99]">
          {mode === 'text' ? '开始面试' : '上传并开始面试'}
        </button>
      </div>
    </div>
  )
}
