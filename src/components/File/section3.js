import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./section3.module.css";
import Search from "../../search";

// ✅ 환경에 따라 API 주소 자동 선택
const API = process.env.REACT_APP_API || "http://localhost:4000";

export default function FileUploadPage() {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => {
      return localStorage.getItem("theme") || "light";
    });
    const [searchResults, setSearchResults] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [showResults, setShowResults] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    

  const gotoHome = () => navigate("/main");
  const gotoLink1 = () => navigate("/ChatApp");
  const gotoLink2 = () => navigate("/file");
  const gotoLink3 = () => navigate("/sendEmail");

  const fetchSearchData = () => {};

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userId");
    alert("로그아웃 되었습니다.");
    navigate("/");
  };

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleUpload = async () => {
    if (!file) return alert("파일을 선택하세요.");
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await axios.post(`${API}/api/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.data.success) {
        alert("파일 업로드 완료!");
        setFile(null);
        inputRef.current.value = "";
        fetchFiles();
      } else {
        alert("업로드 실패");
      }
    } catch (error) {
      console.error("업로드 실패:", error);
      alert("업로드 중 오류 발생");
    }
  };

    useEffect(() => {
      document.documentElement.setAttribute("data-theme", theme);
      localStorage.setItem("theme", theme);
    }, [theme]);
  


  const fetchFiles = async () => {
    try {
      const response = await axios.get(`${API}/api/upload`);
      if (response.data.success) {
        setUploadedFiles(response.data.files);
      }
    } catch (error) {
      console.error("파일 목록 불러오기 실패:", error);
    }
  };

  const handleDownload = async (file) => {
    try {
      const response = await axios.get(`${API}/api/upload/download/${file.type}/${file.name}`, {
        responseType: "blob",
      });
  
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", file.name);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("다운로드 실패:", error);
      alert("다운로드 중 오류 발생");
    }
  };

  const handleChange = (e) => setText(e.target.value);

  useEffect(() => {
    fetchFiles();
  }, []);

  return (
    <div className={styles.body}>
      <nav>
        <div className={styles.nav}>
          <div className={styles.logo1}>
            <h2>Logo</h2>
              <span></span>
            </div>
          <ul>
            <li><button className={styles.button} onClick={gotoHome}>Home</button></li>
            <li><button className={styles.button} onClick={gotoLink1}>Chat</button></li>
            <li><button className={styles.button} onClick={gotoLink2}>File</button></li>
            <li><button className={styles.button} onClick={gotoLink3}>Email</button></li>
          </ul>
          {/* <div className={styles.setting}><Link to="/">Setting</Link></div> */}
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
      />
      <div className={styles.fileUpload}>
        <h2>파일 업로드 및 다운로드</h2>
        <div className={styles.upload}>
          <input 
            type="file"
            ref={inputRef}
            onChange={handleFileChange}
            className={styles.fileInput}
          />
          <button onClick={handleUpload}>업로드</button>
        </div>

        <h3>업로드된 파일 목록</h3>
        <div className={styles.fileList}>
          {uploadedFiles.length === 0 ? (
            <p>업로드된 파일이 없습니다.</p>
          ) : (
            uploadedFiles.map((file, index) => (
              <div key={index} className={styles.fileItem}>
                {file.type === "images" ? (
                  <img
                    src={`${API}/uploads/images/${file.name}`}
                    alt={file.name}
                    className={styles.previewImage}
                  />
                ) : (
                  <span>{file.name}</span>
                )}
                <button onClick={() => handleDownload(file)}>다운로드</button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
