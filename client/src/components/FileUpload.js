import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]); // 서버에서 불러오는 파일 목록
  const inputRef = useRef(null);

  // 📌 파일 선택 핸들러
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // 📌 파일 업로드 핸들러
  const handleUpload = async () => {
    if (!file) return alert("파일을 선택하세요.");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("http://localhost:3000/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        alert("파일 업로드 완료!");
        setFile(null);
        inputRef.current.value = ""; // input 초기화
        fetchFiles(); // 📌 파일 목록 다시 불러오기
      } else {
        alert("업로드 실패");
      }
    } catch (error) {
      console.error("업로드 실패:", error);
      alert("업로드 중 오류 발생");
    }
  };

  // 📌 파일 목록 불러오기 (서버에서 데이터 가져옴)
  const fetchFiles = async () => {
    try {
      const response = await axios.get("http://localhost:3000/files");
      if (response.data.success) {
        setUploadedFiles(response.data.files); // 📌 서버에서 받은 파일 목록으로 상태 업데이트
      }
    } catch (error) {
      console.error("파일 목록 불러오기 실패:", error);
    }
  };

  // 📌 파일 다운로드 핸들러
  const handleDownload = async (fileName) => {
    try {
      const response = await axios.get(`http://localhost:3000/download/${fileName}`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("다운로드 실패:", error);
      alert("다운로드 중 오류 발생");
    }
  };

  // 📌 컴포넌트가 처음 렌더링될 때 서버에서 파일 목록 가져오기
  useEffect(() => {
    fetchFiles();
  }, []);

  return (
    <div>
      <h2>파일 업로드 및 다운로드</h2>
      <input type="file" ref={inputRef} onChange={handleFileChange} />
      <button onClick={handleUpload}>업로드</button>

      <h3>업로드된 파일 목록</h3>
      {uploadedFiles.length === 0 ? (
        <p>업로드된 파일이 없습니다.</p>
      ) : (
        <ul>
          {uploadedFiles.map((fileName, index) => (
            <li key={index}>
              {fileName}{" "}
              <button onClick={() => handleDownload(fileName)}>다운로드</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FileUpload;
