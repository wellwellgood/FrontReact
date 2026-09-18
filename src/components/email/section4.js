import api from "../../util/api.js";

import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Search from "../../search.js";
import emailjs from "@emailjs/browser";
import styles from "./AA/email.js/SendEmail.module.css"
import AccountSetting from '../../AccountSetting.js';
import axios from "axios";
import Logo from "../../image/logo.png";




const EmailForm = () => {
  const form = useRef();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState({ profile_image: "" });
  const [profileImage, setProfileImage] = useState("");
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  const [showSettings, setShowSettings] = useState(false);
  const navigate = useNavigate();

  const username = sessionStorage.getItem("username");
  const isLogtin = sessionStorage.getItem("isAuthenticated");


  const fetchSearchData = async (query) => {
    setIsLoading(true);
    try {
      const response = await axios.get(`/api/search?query=${encodeURIComponent(query)}`);
      setSearchResults(response.data);
      setShowResults(true);
    } catch (error) {
      console.error( error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      alert("파일을 선택해주세요.");
      return;
    }

    setUploading(true);

    try {
      const uploadData = new FormData();
      uploadData.append("file", file);
      const { data } = await api.post("/upload", uploadData);
      if (!data.success || !data.url) throw new Error("첨부 파일 업로드 실패");
      form.current.elements.namedItem("download_link").value = data.url;

      await emailjs.sendForm(
        "service_a9udeim",
        "template_3nu35ld",
        form.current,
        "s9Hb7DTTLBcp34TPu"
      );

      alert("이메일 전송 성공!");
      form.current.reset();
      setFile(null);
    } catch (error) {
      console.error(error);
      alert("실패: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.clear();
    alert("로그아웃 되었습니다.");
    navigate("/");
  };

  useEffect(() => {
    const img = sessionStorage.getItem("profileImage");

    setProfileImage(img);

    if (!username) return;

    axios.get(`/api/users/${username}`)
      .then((res) => {
        setUser(res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [username]);

    useEffect(() => {
      document.documentElement.setAttribute("data-theme", theme);
      localStorage.setItem("theme", theme);
    }, [theme]);

    return (
      <div className={styles.body}>
        <nav>
          <div className={styles.nav}>
          <div className={styles.logo1}><img src={Logo} className={styles.logo}></img></div>
            <ul className={styles.navmenu}>
              <li className={styles.homebtn}><button className={styles.button} onClick={() => navigate("/main")}>Home</button></li>
              <li className={styles.infobtn}><button className={styles.button} onClick={() => navigate("/ChatApp")}>Chat</button></li>
              <li className={styles.filebtn}><button className={styles.button} onClick={() => navigate("/file")}>File</button></li>
              <li className={styles.emailbtn}><button className={styles.button} onClick={() => navigate("/sendEmail")}>Email</button></li>
            </ul>
          </div>
        </nav>
    
        <Search
          setTheme={setTheme}
          fetchSearchData={fetchSearchData}
          searchResults={searchResults}
          isLoading={isLoading}
          setSearchText={setSearchText}
          searchText={searchText}
          showResults={showResults}
          setShowResults={setShowResults}
          handleLogout={handleLogout}
          setShowSettings={setShowSettings}
        />
    
        <form ref={form} onSubmit={handleSubmit} className={styles.mailform}>
        <div className={styles.inputGroup}>
            보내는사람 이메일
            <input
              type="email"
              name="user_email"
              placeholder="보내는 사람 이메일"
              required
              className={styles.input}
            />
          </div>

          <div className={styles.inputGroup}>
            받는사람 이메일
            <input
              type="email"
              name="to"
              placeholder="받는 사람 이메일"
              required
              className={styles.input}
            />
          </div>
    
          <div className={styles.inputGroup}>
            제목
            <input
              type="text"
              name="subject"
              placeholder="제목"
              required
              className={styles.input}
            />
          </div>
    
          <div className={styles.textAreaBox}>
            메시지
            <textarea
              name="message"
              placeholder="메시지"
              required
              className={styles.textArea}
            />
          </div>
    
          <div className={styles.inputGroup}>
            <input
              type="file"
              onChange={handleFileChange}
              required
              className={styles.fileButton}
            />
          </div>
    
          <input type="hidden" name="download_link" />
    
          <div className={styles.button}>
            <button
              type="submit"
              disabled={uploading}
              className={styles.submitButton}
            >
              {uploading ? "업로드 중..." : "보내기"}
            </button>
          </div>
    
          {showSettings && (
            <AccountSetting onClose={() => setShowSettings(false)} />
          )}
        </form>
      </div>
    );
  };
    
    export default EmailForm;
