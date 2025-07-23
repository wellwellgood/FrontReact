import React, { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from '../../firebase.js';
import styles from "./section3.module.css";

const Section3 = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const q = query(collection(db, "files"), orderBy("uploadedAt", "desc"));
        const querySnapshot = await getDocs(q);
        const fetchedFiles = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setFiles(fetchedFiles);
      } catch (error) {
        console.error("파일 목록 불러오기 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, []);

  return (
    <div className={styles.section3Container}>
      <h2>📂 업로드된 파일 목록</h2>
      {loading ? (
        <p>불러오는 중...</p>
      ) : files.length === 0 ? (
        <p>업로드된 파일이 없습니다.</p>
      ) : (
        <ul className={styles.fileList}>
          {files.map((file) => (
            <li key={file.id} className={styles.fileItem}>
              <span>📝 {file.originalname || file.name}</span>
              <span className={styles.uploadTime}>
                {file.uploadedAt?.toDate?.().toLocaleString?.() || "시간 없음"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Section3;
