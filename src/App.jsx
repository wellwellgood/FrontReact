import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';

// 페이지 컴포넌트
import Main from './main';
import Search from './search';
import Section2 from './components/Chat/section2';
import File from './components/File/section3';
import Section4SendEmail from './components/email/section4';
import CustomCalendar from './calender/calender';
import LinkPage from './membership';
import Id from './ID';
import Password from './password';
import LoginPage from './LoginApp';
import AccountSetting from './AccountSetting';

// 보호 라우터
import ProtectedRoute from './components/ProtectedRoute';

function AppContent() {
  const location = useLocation(); // 현재 경로 확인
  const [showSettings, setShowSettings] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [theme, setTheme] = useState(() => sessionStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    sessionStorage.setItem('theme', theme);
  }, [theme]);

  const hideSearch = location.pathname === "/" || location.pathname === "/login";

  return (
    <div>
      {!hideSearch && (
        <Search
          showSettings={showSettings}
          setShowSettings={setShowSettings}
          searchText={searchText}
          setSearchText={setSearchText}
          showResults={showResults}
          setShowResults={setShowResults}
        />
      )}

      {showSettings && (
        <AccountSetting onClose={() => setShowSettings(false)} />
      )}

      {/* 페이지 라우팅 */}
      <Routes>
        {/* 비로그인 허용 */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/membership" element={<LinkPage />} />
        <Route path="/Id" element={<Id />} />
        <Route path="/password" element={<Password />} />
        <Route path="/customCalendar" element={<CustomCalendar />} />

        {/* 로그인 보호 */}
        <Route path="/main" element={
          <ProtectedRoute>
            <Main setTheme={setTheme} />
          </ProtectedRoute>
        } />
        <Route path="/ChatApp" element={
          <ProtectedRoute>
            <Section2 />
          </ProtectedRoute>
        } />
        <Route path="/file" element={
          <ProtectedRoute>
            <File />
          </ProtectedRoute>
        } />
        <Route path="/sendEmail" element={
          <ProtectedRoute>
            <Section4SendEmail />
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}