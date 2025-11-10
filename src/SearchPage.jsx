// src/pages/SearchPage.jsx
import { useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

const API = process.env.REACT_APP_API || "https://react-server-wmqa.onrender.com";

export default function SearchPage() {
  const [params] = useSearchParams();
  const keyword = params.get("keyword") || "";
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!keyword.trim()) return;
    setLoading(true);
    axios
      .get(`${API}/api/search?query=${encodeURIComponent(keyword)}`)
      .then((res) => setResults(res.data || []))
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [keyword]);

  return (
    <main style={{ padding: 24 }}>
      {keyword ? (
        <>
          <h2>검색 결과: {keyword}</h2>
          {loading && <p>검색 중...</p>}
          {!loading && results.length === 0 && <p>결과 없음</p>}
          <ul>
            {results.map((r, i) => (
              <li key={i}>
                [{r.type}] {r.title || r.label || JSON.stringify(r)}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <h2>검색어를 입력하세요</h2>
      )}
    </main>
  );
}
