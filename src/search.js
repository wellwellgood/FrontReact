import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import axios from 'axios';
import styles from './search.module.css';
import personIcon from './image/person-circle.jpg';
import AccountSetting from './AccountSetting.js';

const Search = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({ profile_image: "" });
  const [profileImage, setProfileImage] = useState("");
  const [username, setUsername] = useState("");
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [showInfoForm, setShowInfoForm] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const infoRef = useRef();
  const [showSettings, setShowSettings] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedImage = sessionStorage.getItem("profileImage");
    const storedUsername = sessionStorage.getItem("username");
    const receiverUsername = sessionStorage.getItem("receiver_username");
    const input = document.getElementById("searchInput");
    const wrapper = document.querySelector(".inputWrapper");

    if (!storedUsername) return;

    setProfileImage(storedImage);
    setUsername(receiverUsername || storedUsername);

    axios.get(`/api/users/${storedUsername}`)
      .then(res => setUser(res.data))
      .catch(err => console.error("유저 로딩 실패:", err));
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!searchText.trim()) {
        setSearchResults([]);
        return;
      }

      try {
        const res = await axios.get(`/api/search/suggest?keyword=${searchText}`);
        const rawData = Array.isArray(res.data) ? res.data : [];

        const formatted = rawData.map((item) => {
          let label = "";

          if (item.type === "user") label = item.name || item.username || "이름 없음";
          else if (item.type === "file") label = item.file_name || "파일 없음";
          else if (item.type === "content") label = item.content?.slice(0, 50) || "내용 없음";
          else label = "Unknown";

          return { type: item.type || "unknown", label };
        });

        setSearchResults(formatted);
        setShowResults(true);
      } catch (err) {
        console.error("자동완성 실패:", err);
        setSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchText]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchText.trim()) return;

    try {
      setIsLoading(true);
      const res = await axios.get(`/api/search?query=${encodeURIComponent(searchText)}`);
      const rawData = Array.isArray(res.data) ? res.data : [];

      const formatted = rawData.map((item) => {
        let label = "";

        if (item.type === "user") label = item.name || item.username || "이름 없음";
        else if (item.type === "file") label = item.file_name || "파일 없음";
        else if (item.type === "content") label = item.content?.slice(0, 50) || "내용 없음";
        else label = "Unknown";

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

  const handleInputChange = (e) => {
    setSearchText(e.target.value);
    setShowResults(e.target.value.trim() !== '');
  };

  const handleResultClick = (label) => {
    navigate(`/search?keyword=${label}`);
    setShowResults(false);
    setSearchText('');
  };

  const toggleTheme = (theme) => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    setShowThemeMenu(false);
  };

  const handleProfileClick = () => {
    setShowInfoForm((prev) => !prev);
    setShowThemeMenu(false);
  };

  const toggleThemeMenu = () => {
    setShowThemeMenu((prev) => !prev);
  };

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/';
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!searchText.trim()) {
        setResults([]);
        setShowResults(false);
        return;
      }

      try {
        setLoading(true);
        const res = await axios.get(`${API}/api/search`, {
          params: { q: searchText }
        });
        setResults(res.data);
        setShowResults(true);
      } catch (err) {
        console.error("❌ 검색 실패:", err);
        setResults([]);
        setShowResults(true);
      } finally {
        setLoading(false);
      }
    };

    const delay = setTimeout(fetchData, 300); // ✅ 디바운스
    return () => clearTimeout(delay);
  }, [searchText]);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("🔍 검색 실행:", searchText);
  };

  
input.addEventListener("input", () => {
  const textWidth = input.value.length * 9; // 글자 폭 대충 계산
  wrapper.style.setProperty("--cursor-pos", `${textWidth + 12}px`);
});

  return (
    <>
    {/* ✅ 설정창이 중앙에 떠야 하니까 topbar 바깥에 둬야 함 */}
    {showSettings && (
      <AccountSetting onClose={() => setShowSettings(false)} />
    )}

    {/* ✅ 기존 topbar */}
    <div className={styles.topbar}>
      <div className={styles.topbarContainer}>
        <div className={styles.search}>
          <form onSubmit={handleSearch} className={styles.searchForm}>
           <div className={styles.inputWrapper}>
            <input
                type="text"
                value={searchText}
                onChange={handleInputChange}
                placeholder="검색어 입력..."
                className={styles.searchInput}
              />
           </div>
            <button type="submit" className={styles.searchButton}>
              <FaSearch />
            </button>
          </form>

          {showResults && Array.isArray(searchResults) && (
            <div className={styles.resultsPanel}>
              {searchResults.length === 0 ? (
                <div className={styles.resultItem}>결과 없음</div>
              ) : (
                searchResults.map((s, i) => (
                  <div
                    key={i}
                    className={styles.resultItem}
                    onClick={() => handleResultClick(`/search?keyword=${s.label}`)}
                  >
                    [{s.type}] {s.label}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* ✅ 프로필 및 설정 버튼 */}
        <div className={styles.userInfoBox} ref={infoRef}>
          <img
            className={styles.profileImage}
            src={
              user.profile_image
                ? `https://react-server-wmqa.onrender.com${profileImage}`
                : personIcon
            }
            onClick={handleProfileClick}
            alt="프로필"
          />
          {showInfoForm && (
            <div className={styles.infoform}>
              <span className={styles.userInfo}>
                <h2>
                  {user.name
                    ? `${user.name}님, 환영합니다!`
                    : `${username}님, 환영합니다!`}
                </h2>
              </span>

              <div className={styles.menuItem}>
                <button
                  onClick={() => setShowSettings(true)}
                  className={styles.settingsButton}
                >
                  ⚙️ 설정 열기
                </button>
              </div>

              <div className={styles.menuItem}>
                <span onClick={toggleThemeMenu} className={styles.link}>
                  Theme
                </span>
                {showThemeMenu && (
                  <div className={styles.themeMenu}>
                    <div className={styles.light} onClick={() => toggleTheme("light")}>
                      Light
                    </div>
                    <div className={styles.dark} onClick={() => toggleTheme("dark")}>
                      Dark
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.user}>
                <button className={styles.logout} onClick={handleLogout}>
                  로그아웃
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  </>
  );
};

export default Search;
