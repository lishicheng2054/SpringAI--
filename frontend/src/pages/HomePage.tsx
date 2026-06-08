import { useNavigate } from 'react-router-dom'
import { FileText, Target, BookOpen, Calendar, Settings, Sparkles, TrendingUp, BarChart3, ChevronRight } from 'lucide-react'

const featureCards = [
  { Icon: FileText, title: '我的简历', desc: '管理简历列表，查看 AI 分析报告', path: '/resumes', color: 'bg-blue-500' },
  { Icon: Target, title: '模拟面试', desc: 'AI 智能出题，逐题评分反馈', path: '/resume', color: 'bg-violet-500' },
  { Icon: BookOpen, title: '知识库', desc: '上传文档构建知识库，RAG 问答', path: '/kb', color: 'bg-emerald-500' },
  { Icon: Calendar, title: '面试日程', desc: '管理面试安排，状态跟踪提醒', path: '/schedule', color: 'bg-amber-500' },
  { Icon: Settings, title: '系统设置', desc: 'LLM 模型服务商配置管理', path: '/settings', color: 'bg-slate-500' },
]

export default function HomePage() {
  const navigate = useNavigate()
  return (
    <div className="animate-slide-up">
      {/* Hero 区 */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-12 mb-10">
        {/* 背景装饰 */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-brand-500/20 to-violet-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-emerald-500/10 to-cyan-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(59,130,246,0.1),transparent_70%)]" />

        <div className="relative text-center">
          {/* 标签 */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur text-slate-300 rounded-full text-xs font-medium mb-8 border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Powered by DeepSeek AI</span>
          </div>

          {/* 大图标 */}
          <div className="mb-8">
            <div className="inline-flex w-20 h-20 rounded-3xl bg-gradient-to-br from-brand-500 to-violet-600 items-center justify-center shadow-2xl shadow-brand-500/30">
              <Target className="w-10 h-10 text-white" strokeWidth={2} />
            </div>
          </div>

          <h1 className="text-5xl font-extrabold text-white mb-4 tracking-tight">AI 模拟面试平台</h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto leading-relaxed mb-10">
            输入简历，AI 智能生成面试题，逐题作答获取评分建议，助你高效备战每一次面试
          </p>

          <div className="flex items-center justify-center gap-4">
            <button onClick={() => navigate('/resume')}
              className="px-8 py-3.5 bg-brand-600 text-white rounded-2xl text-base font-semibold hover:bg-brand-500 transition-all shadow-xl shadow-brand-500/30 hover:shadow-2xl hover:shadow-brand-500/40 active:scale-[0.98] flex items-center gap-2">
              开始面试 <ChevronRight className="w-4 h-4" />
            </button>
            <button onClick={() => navigate('/dashboard')}
              className="px-8 py-3.5 bg-white/10 backdrop-blur text-slate-300 rounded-2xl text-base font-semibold hover:bg-white/20 transition-all border border-white/10 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" /> 数据看板
            </button>
          </div>
        </div>
      </div>

      {/* 功能卡片 */}
      <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-brand-500" /> 核心功能
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {featureCards.map(({ Icon, title, desc, path, color }) => (
          <div key={title} onClick={() => navigate(path)}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-6 group">
            <div className={`inline-flex w-11 h-11 rounded-xl ${color} items-center justify-center mb-4 shadow-sm`}>
              <Icon className="w-5 h-5 text-white" strokeWidth={1.5} />
            </div>
            <h3 className="font-semibold text-slate-800 mb-1 group-hover:text-brand-600 transition-colors">{title}</h3>
            <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      {/* 数据速览 */}
      <div className="grid grid-cols-4 gap-4 mb-10">
        {[
          { num: 'DeepSeek', label: 'AI 引擎', color: 'text-brand-600' },
          { num: 'RAG', label: '检索增强', color: 'text-emerald-600' },
          { num: 'PG', label: 'PostgreSQL', color: 'text-violet-600' },
          { num: '21', label: 'Java 版本', color: 'text-amber-600' },
        ].map(item => (
          <div key={item.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 text-center">
            <div className={`text-lg font-bold ${item.color}`}>{item.num}</div>
            <div className="text-xs text-slate-400 mt-1">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
