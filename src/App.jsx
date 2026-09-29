import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './LoginApp';
import LinkPage from './membership';
import Id from './ID';
import Password from './password';
import CustomCalendar from './calender/calender';
import DashboardOverview from './components/dashboard/DashboardOverview.jsx';
import ProfileSettings from './components/account/ProfileSettings.jsx';
import AccountSettings from './components/account/AccountSettings.jsx';
import NotificationSettings from './components/account/NotificationSettings.jsx';
import ProtectedRoute from './components/ProtectedRoute';
import GitHubCallback from './components/github/GitHubCallback';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/github/callback" element={<GitHubCallback />} />
        <Route path="/demo/projects" element={<DashboardOverview demo view="projects" />} />
        <Route path="/demo/issues" element={<DashboardOverview demo view="issues" />} />
        <Route path="/demo/activity" element={<DashboardOverview demo view="activity" />} />
        <Route path="/holdings" element={<Navigate to="/projects" replace />} />
        <Route path="/transactions" element={<Navigate to="/issues" replace />} />
        <Route path="/watchlist" element={<Navigate to="/projects" replace />} />
        <Route path="/demo" element={<DashboardOverview demo />} />
        <Route path="/job-analysis" element={<Navigate to="/projects" replace />} />
        <Route path="/applications" element={<Navigate to="/issues" replace />} />
        <Route path="/interview-preparation" element={<Navigate to="/activity" replace />} />
        {/* 기본 페이지 */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/membership" element={<LinkPage />} />
        <Route path="/Id" element={<Id />} />
        <Route path="/password" element={<Password />} />
        <Route path="/customCalendar" element={<CustomCalendar />} />

        {/* 프로젝트 검색 */}
        <Route path="/search" element={<Navigate to="/projects" replace />} />

        {/* 보호된 라우트 */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardOverview />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <DashboardOverview view="projects" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/issues"
          element={
            <ProtectedRoute>
              <DashboardOverview view="issues" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/activity"
          element={
            <ProtectedRoute>
              <DashboardOverview view="activity" />
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
        <Route path="/main" element={<Navigate to="/dashboard" replace />} />
        <Route path="/ChatApp" element={<Navigate to="/job-analysis" replace />} />
        <Route path="/file" element={<Navigate to="/applications" replace />} />
        <Route path="/sendEmail" element={<Navigate to="/interview-preparation" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
