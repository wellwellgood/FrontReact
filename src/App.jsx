import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './LoginApp';
import LinkPage from './membership';
import Id from './ID';
import Password from './password';
import CustomCalendar from './calender/calender';
import Main from './main';
import Section2 from './components/Chat/section2';
import File from './components/File/section3';
import Section4SendEmail from './components/email/section4';
import AccountSetting from './AccountSetting';
import ProtectedRoute from './components/ProtectedRoute';
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
        {/* <Route path="/search" element={<SearchResult />} /> */}

        {/* 보호된 라우트 */}
        <Route
          path="/main"
          element={
            <ProtectedRoute>
              <Main setTheme={setTheme} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ChatApp"
          element={
            <ProtectedRoute>
              <Section2 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/file"
          element={
            <ProtectedRoute>
              <File />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sendEmail"
          element={
            <ProtectedRoute>
              <Section4SendEmail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <AccountSetting />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
