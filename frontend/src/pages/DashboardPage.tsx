import { useState, useEffect } from 'react'
import request from '../api/request'
import LoadingSpinner from '../components/LoadingSpinner'
import { FileText, Target, TrendingUp, BookOpen, LayoutDashboard } from 'lucide-react'

interface DashboardStats {
  totalResumes: number; totalSessions: number; completedSessions: number
  totalKbs: number; totalDocuments: number; totalSchedules: number
  avgScore: number; avgTechScore: number; avgCommScore: number; avgLogicScore: number
  scoreTrends: { date: string; score: number; role: string }[]
  roleDistribution: Record<string, number>
  recentActivities: { type: string; desc: string; time: string }[]
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    request.get<DashboardStats>('/api/dashboard/stats').then(r => setStats(r.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner text="加载数据看板..." />
  if (!stats) return null

  const statCards = [
    { label: '简历总数', value: stats.totalResumes, Icon: FileText, color: 'bg-blue-500' },
    { label: '面试次数', value: stats.completedSessions, Icon: Target, color: 'bg-violet-500' },
    { label: '平均分数', value: stats.avgScore + '分', Icon: TrendingUp, color: 'bg-emerald-500' },
    { label: '知识库文档', value: stats.totalDocuments, Icon: BookOpen, color: 'bg-amber-500' },
  ]

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-8">
        <LayoutDashboard className="w-6 h-6 text-brand-500" />
        <h2 className="text-2xl font-bold text-slate-800">数据看板</h2>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {statCards.map(c => (
          <div key={c.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-slate-400 font-medium">{c.label}</span>
              <div className={`w-9 h-9 rounded-xl ${c.color} flex items-center justify-center`}>
                <c.Icon className="w-4 h-4 text-white" strokeWidth={1.5} />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-800">{c.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-semibold text-slate-700 mb-4 text-sm">📈 分数趋势</h3>
          {stats.scoreTrends.length > 0 ? (
            <ScoreTrendChart trends={stats.scoreTrends} />
          ) : <p className="text-slate-300 text-sm text-center py-8">暂无数据</p>}
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-semibold text-slate-700 mb-4 text-sm">📊 能力维度</h3>
          <DimensionBarChart stats={stats} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-semibold text-slate-700 mb-4 text-sm">🎯 岗位分布</h3>
          {Object.keys(stats.roleDistribution).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(stats.roleDistribution).map(([role, count], i) => {
                const max = Math.max(...Object.values(stats.roleDistribution))
                const pct = (count / max) * 100
                const colors = ['bg-brand-500','bg-violet-500','bg-emerald-500','bg-amber-500','bg-pink-500','bg-cyan-500']
                return (
                  <div key={role}>
                    <div className="flex justify-between text-xs mb-1"><span className="text-slate-600">{role}</span><span className="text-slate-400">{count}次</span></div>
                    <div className="w-full bg-slate-100 rounded-full h-2"><div className={`${colors[i]} h-2 rounded-full transition-all duration-700`} style={{width:`${pct}%`}}/></div>
                  </div>)
              })}
            </div>) : <p className="text-slate-300 text-sm text-center py-8">暂无数据</p>}
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-semibold text-slate-700 mb-4 text-sm">🕐 最近活动</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {stats.recentActivities.map((a, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-sm mt-0.5">{a.type === 'resume' ? '📝' : '🎯'}</span>
                <div className="flex-1 min-w-0"><p className="text-xs text-slate-600 truncate">{a.desc}</p><p className="text-[10px] text-slate-400">{new Date(a.time).toLocaleString('zh-CN')}</p></div>
              </div>))}
          </div>
        </div>
      </div>
    </div>
  )
}

function ScoreTrendChart({ trends }: { trends: { date: string; score: number; role: string }[] }) {
  const w = 400, h = 160, pad = { t:10,r:10,b:24,l:28 }, pw = w-pad.l-pad.r, ph = h-pad.t-pad.b
  const points = trends.map((t,i) => ({x:pad.l+(trends.length>1?(i/(trends.length-1))*pw:pw/2), y:pad.t+ph-((t.score)/100)*ph, score:t.score, date:t.date}))
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
      {[0,25,50,75,100].map(s=>{const y=pad.t+ph-((s)/100)*ph;return <g key={s}><line x1={pad.l}y1={y}x2={w-pad.r}y2={y}stroke="#f1f5f9"strokeWidth="1"/><text x={pad.l-4}y={y+3}textAnchor="end"fontSize="8"fill="#94a3b8">{s}</text></g>})}
      <polyline points={points.map(p=>`${p.x},${p.y}`).join(' ')} fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round"/>
      {points.map((p,i)=>(<g key={i}><circle cx={p.x}cy={p.y}r="4"fill="#6366f1"stroke="white"strokeWidth="2"/><text x={p.x}y={p.y-8}textAnchor="middle"fontSize="9"fill="#6366f1"fontWeight="bold">{p.score}</text><text x={p.x}y={h-4}textAnchor="middle"fontSize="7"fill="#94a3b8">{p.date.slice(5)}</text></g>))}
    </svg>)
}

function DimensionBarChart({ stats }: { stats: DashboardStats }) {
  const dims = [{label:'技术',score:stats.avgTechScore,color:'#6366f1'},{label:'沟通',score:stats.avgCommScore,color:'#ec4899'},{label:'逻辑',score:stats.avgLogicScore,color:'#14b8a6'}]
  const w=300,h=150,pad={t:10,r:10,b:20,l:10},pw=w-pad.l-pad.r,barW=(pw/dims.length)*0.6,gap=pw/dims.length,maxH=h-pad.t-pad.b
  return (<svg viewBox={`0 0 ${w} ${h}`} className="w-full">{dims.map((d,i)=>{const bh=(d.score/100)*maxH,x=pad.l+i*gap+(gap-barW)/2,y=h-pad.b-bh;return(<g key={d.label}><rect x={x}y={y}width={barW}height={bh}rx="4"fill={d.color}fillOpacity="0.8"/><text x={x+barW/2}y={y-6}textAnchor="middle"fontSize="10"fontWeight="bold"fill={d.color}>{d.score}</text><text x={x+barW/2}y={h-4}textAnchor="middle"fontSize="9"fill="#94a3b8">{d.label}</text></g>)})}</svg>)
}
