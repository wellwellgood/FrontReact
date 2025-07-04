import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./search.module.css";
import { FaSearch } from "react-icons/fa";

const Search = () => {
  const [searchText, setSearchText] = useState("");
  const [suggestResults, setSuggestResults] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    setSearchText(e.target.value);
  };

  // 🔍 자동완성 useEffect
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!searchText.trim()) {
        setSuggestResults([]);
        return;
      }

      try {
        const res = await axios.get(`/api/search/suggest?keyword=${searchText}`);
        setSuggestResults(Array.isArray(res.data) ? res.data : []);
        setShowResults(true);
      } catch (err) {
        console.error("자동완성 실패:", err);
        setSuggestResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchText]);

  // 🔍 실제 검색 실행
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchText.trim()) return;

    try {
      setIsLoading(true);
      const res = await axios.get(`/api/search?query=${encodeURIComponent(searchText)}`);
      const rawData = Array.isArray(res.data) ? res.data : [];

      const formatted = rawData.map((item) => {
        let label = "";

        if (item.type === "user") {
          label = item.name || item.username || "이름 없음";
        } else if (item.type === "file") {
          label = item.file_name || "파일 없음";
        } else if (item.type === "content") {
          label = item.content?.slice(0, 50) || "내용 없음";
        } else {
          label = "Unknown";
        }

        return { type: item.type || "unknown", label };
      });

      setSearchResults(formatted);
      setShowResults(true);
    } catch (err) {
      console.error("❌ 검색 실패:", err);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResultClick = (value) => {
    console.log("선택한 결과:", value);
    setSearchText(value);
    setShowResults(false);
  };

  return (
    <div className={styles.search}>
      {/* 🔍 자동완성 결과 */}
      {showResults && suggestResults.length > 0 && (
        <div className={styles.suggestPanel}>
          <p className={styles.suggestTitle}>🔍 자동완성</p>
          {suggestResults.map((s, i) => (
            <div
              key={`s-${i}`}
              className={styles.resultItem}
              onClick={() => handleResultClick(s.label || s.name || s.file_name || "")}
            >
              [{s.type}] {s.label || s.name || s.file_name || "값 없음"}
            </div>
          ))}
        </div>
      )}

      {/* 🔍 검색 결과 */}
      {showResults && (
        <div className={styles.resultsPanel}>
          <p className={styles.suggestTitle}>📄 검색 결과</p>
          {Array.isArray(searchResults) && searchResults.length > 0 ? (
            searchResults.map((s, i) => (
              <div
                key={`r-${i}`}
                className={styles.resultItem}
                onClick={() => handleResultClick(s.label)}
              >
                [{s.type}] {s.label}
              </div>
            ))
          ) : (
            <div className={styles.resultItem}>결과 없음</div>
          )}
        </div>
      )}
    </div>
  );
};

export default Search;
