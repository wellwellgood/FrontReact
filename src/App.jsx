import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './LoginApp';
import LinkPage from './membership';
import Id from './ID';
import Password from './password';
import CustomCalendar from './calender/calender';
import DashboardOverview from './components/dashboard/DashboardOverview.jsx';
import JobResumeAnalysis from './components/jobAnalysis/JobResumeAnalysis.jsx';
import ApplicationManagement from './components/applications/ApplicationManagement.jsx';
import InterviewPreparation from './components/interview/InterviewPreparation.jsx';
import ProfileSettings from './components/account/ProfileSettings.jsx';
import AccountSettings from './components/account/AccountSettings.jsx';
import NotificationSettings from './components/account/NotificationSettings.jsx';
import ProtectedRoute from './components/ProtectedRoute';
import SearchPage from './SearchPage';
// import SearchResult from './serverF/routes/searchRoute';   // ✅ 검색 결과 컴포넌트

function App() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  return (
    <Router>
      <Routes>
        {/* 기본 페이지 */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/membership" element={<LinkPage />} />
        <Route path="/Id" element={<Id />} />
        <Route path="/password" element={<Password />} />
        <Route path="/customCalendar" element={<CustomCalendar />} />

        {/* ✅ 검색 라우트만 추가 */}
        <Route path="/search" element={<SearchPage />} />

        {/* 보호된 라우트 */}
        <Route
          path="/main"
          element={
            <ProtectedRoute>
              <DashboardOverview setTheme={setTheme} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ChatApp"
          element={
            <ProtectedRoute>
              <JobResumeAnalysis />
            </ProtectedRoute>
          }
        />
        <Route
          path="/file"
          element={
            <ProtectedRoute>
              <ApplicationManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sendEmail"
          element={
            <ProtectedRoute>
              <InterviewPreparation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <AccountSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/account/profile"
          element={<ProtectedRoute><ProfileSettings /></ProtectedRoute>}
        />
        <Route
          path="/account/notifications"
          element={<ProtectedRoute><NotificationSettings /></ProtectedRoute>}
        />
      </Routes>
    </Router>
  );
}

export default App;
