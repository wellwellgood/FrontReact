import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginPage from './LoginApp';
import Main from "./main";
// import Example from './components/section1/section1.js';
import ChatApp from "./components/section2/section2.js";
import File from "./components/section3/section3.js";
import SendEmail from './components/section4/section4.js';

import Id from './ID.js';
import Password from './password.js';
import LinkPage from './membership.js';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/main" element={<Main />} />
        {/* <Route path="/example" element={<Example />} /> */}
        <Route path="/chatApp" element={<ChatApp />} />
        <Route path="/file" element={<File />} />
        <Route path="/sendemail" element={<SendEmail />} />
        <Route path="/membership" element={<LinkPage />} />
        <Route path="/id" element={<Id />} />
        <Route path="/password" element={<Password />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
