import { Outlet, NavLink } from 'react-router-dom'
import {
  Home, LayoutDashboard, FileText, Target, BookOpen, ClipboardList,
  GitCompare, Library, Calendar, Settings, ChevronRight
} from 'lucide-react'

const navGroups = [
  {
    label: '主菜单',
    items: [
      { path: '/',           label: '首页',   Icon: Home, end: true },
      { path: '/dashboard',  label: '数据看板',Icon: LayoutDashboard },
    ]
  },
  {
    label: '面试中心',
    items: [
      { path: '/resumes',    label: '我的简历',Icon: FileText },
      { path: '/resume',     label: '开始面试',Icon: Target },
      { path: '/question-bank', label: '题库管理',Icon: BookOpen },
      { path: '/templates',  label: '面试模板',Icon: ClipboardList },
    ]
  },
  {
    label: '分析回顾',
    items: [
      { path: '/history',    label: '面试历史',Icon: Library },
      { path: '/compare',    label: '对比分析',Icon: GitCompare },
    ]
  },
  {
    label: '资源管理',
    items: [
      { path: '/kb',         label: '知识库',  Icon: BookOpen },
      { path: '/schedule',   label: '面试日程',Icon: Calendar },
      { path: '/settings',   label: '系统设置',Icon: Settings },
    ]
  },
]

export default function Layout() {
  return (
    <div className="flex min-h-screen">
      {/* 侧边栏 */}
      <aside className="w-[220px] bg-white border-r border-slate-200 flex flex-col shrink-0">
        {/* Logo */}
        <div className="px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <Target className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <div className="font-bold text-slate-800 text-sm">SpringAI</div>
              <div className="text-[11px] text-slate-400">面试训练平台</div>
            </div>
          </div>
        </div>

        {/* 导航 */}
        <nav className="flex-1 px-3 py-3 space-y-4 overflow-y-auto">
          {navGroups.map(group => (
            <div key={group.label}>
              <div className="px-3 mb-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{group.label}</div>
              <div className="space-y-0.5">
                {group.items.map(({ path, label, Icon, end }) => (
                  <NavLink key={path} to={path} end={end}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all no-underline group ${
                        isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50'
                      }`}>
                      <Icon className={`w-4 h-4 ${false ? '' : 'text-slate-400 group-hover:text-slate-500'}`} strokeWidth={1.5} />
                      <span className="flex-1">{label}</span>
                      {false && <ChevronRight className="w-3 h-3 text-slate-300" />}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* 底部状态 */}
        <div className="px-4 py-3 border-t border-slate-100">
          <div className="flex items-center gap-2 px-2 py-2 rounded-lg bg-emerald-50">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-dot" />
            <span className="text-[11px] text-emerald-700 font-medium">DeepSeek 已连接</span>
          </div>
        </div>
      </aside>

      {/* 主内容 */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 max-w-5xl mx-auto w-full px-10 py-8 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
