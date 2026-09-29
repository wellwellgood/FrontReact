import React, { useState } from 'react';
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
// import SearchResult from './serverF/routes/searchRoute';   // ✅ 검색 결과 컴포넌트

function App() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  return (
    <Router>
      <Routes>
        <Route path="/demo" element={<DashboardOverview demo />} />
        <Route path="/job-analysis" element={<Navigate to="/holdings" replace />} />
        <Route path="/applications" element={<Navigate to="/transactions" replace />} />
        <Route path="/interview-preparation" element={<Navigate to="/watchlist" replace />} />
        {/* 기본 페이지 */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/membership" element={<LinkPage />} />
        <Route path="/Id" element={<Id />} />
        <Route path="/password" element={<Password />} />
        <Route path="/customCalendar" element={<CustomCalendar />} />

        {/* ✅ 검색 라우트만 추가 */}
        <Route path="/search" element={<Navigate to="/watchlist" replace />} />

        {/* 보호된 라우트 */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardOverview setTheme={setTheme} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/holdings"
          element={
            <ProtectedRoute>
              <DashboardOverview view="holdings" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transactions"
          element={
            <ProtectedRoute>
              <DashboardOverview view="transactions" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/watchlist"
          element={
            <ProtectedRoute>
              <DashboardOverview view="watchlist" />
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
      </Routes>
    </Router>
  );
}

export default App;
