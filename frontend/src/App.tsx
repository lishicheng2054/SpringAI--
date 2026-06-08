import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import ResumeInputPage from './pages/ResumeInputPage'
import ResumeDetailPage from './pages/ResumeDetailPage'
import ResumeListPage from './pages/ResumeListPage'
import InterviewPage from './pages/InterviewPage'
import ResultPage from './pages/ResultPage'
import KnowledgeBaseListPage from './pages/KnowledgeBaseListPage'
import KnowledgeBaseDetailPage from './pages/KnowledgeBaseDetailPage'
import KnowledgeBaseChatPage from './pages/KnowledgeBaseChatPage'
import InterviewSchedulePage from './pages/InterviewSchedulePage'
import SettingsPage from './pages/SettingsPage'
import HistoryPage from './pages/HistoryPage'
import VoiceInterviewPage from './pages/VoiceInterviewPage'
import ComparePage from './pages/ComparePage'
import DashboardPage from './pages/DashboardPage'
import QuestionBankPage from './pages/QuestionBankPage'
import TemplateListPage from './pages/TemplateListPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="resume" element={<ResumeInputPage />} />
        <Route path="resume/:resumeId" element={<ResumeDetailPage />} />
        <Route path="resumes" element={<ResumeListPage />} />
        <Route path="interview/:resumeId" element={<InterviewPage />} />
        <Route path="result/:sessionId" element={<ResultPage />} />
        <Route path="kb" element={<KnowledgeBaseListPage />} />
        <Route path="kb/:kbId" element={<KnowledgeBaseDetailPage />} />
        <Route path="kb/:kbId/chat" element={<KnowledgeBaseChatPage />} />
        <Route path="schedule" element={<InterviewSchedulePage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="compare" element={<ComparePage />} />
        <Route path="voice/:resumeId" element={<VoiceInterviewPage />} />
        <Route path="question-bank" element={<QuestionBankPage />} />
        <Route path="templates" element={<TemplateListPage />} />
      </Route>
    </Routes>
  )
}
