import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './search.module.css';
import { FaSearch } from 'react-icons/fa';
import personIcon from './image/person-circle.jpg';
import AccountSetting from './AccountSetting.js';

const API = process.env.REACT_APP_API || "http://localhost:10000";

const Search = () => {
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const [user, setUser] = useState({ profile_image: "" });
  const [profileImage, setProfileImage] = useState("");
  const [username, setUsername] = useState("");
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [showInfoForm, setShowInfoForm] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // ✅ 유저 정보 로드
  useEffect(() => {
    const storedImage = sessionStorage.getItem("profileImage");
    const storedUsername = sessionStorage.getItem("username");
    const receiverUsername = sessionStorage.getItem("receiver_username");

    if (!storedUsername) return;

    setProfileImage(storedImage);
    setUsername(receiverUsername || storedUsername);

    axios.get(`/api/users/${storedUsername}`)
      .then(res => setUser(res.data))
      .catch(err => console.error("유저 로드 실패:", err));
  }, []);

  // ✅ 디바운스 검색 API
  const fetchSuggestions = useCallback(
    (() => {
      let timer;
      return (query) => {
        clearTimeout(timer);
        timer = setTimeout(async () => {
          if (!query.trim()) {
            setSearchResults([]);
            setShowResults(false);
            return;
          }
          try {
            const res = await axios.get(`${API}/api/search/suggest?keyword=${query}`);
            const raw = Array.isArray(res.data) ? res.data : [];
            setSearchResults(raw);
            setShowResults(true);
          } catch (err) {
            console.error("자동완성 실패:", err);
            setSearchResults([]);
          }
        }, 300);
      };
    })(),
    []
  );

  useEffect(() => {
    fetchSuggestions(searchText);
  }, [searchText, fetchSuggestions]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchText.trim()) return;
    try {
      setIsLoading(true);
      const res = await axios.get(`${API}/api/search?query=${encodeURIComponent(searchText)}`);
      setSearchResults(res.data || []);
      setShowResults(true);
    } catch (err) {
      console.error("검색 실패:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setSearchText(e.target.value);
    setShowResults(e.target.value.trim() !== "");
  };

  const handleProfileClick = () => {
    setShowInfoForm((prev) => !prev);
    setShowThemeMenu(false);
  };

  const toggleThemeMenu = () => setShowThemeMenu((prev) => !prev);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "/";
  };

  const handleResultClick = (label) => {
    navigate(`/search?keyword=${encodeURIComponent(label)}`);
  };

  return (
    <>
      {showSettings && <AccountSetting onClose={() => setShowSettings(false)} />}

      <div className={styles.topbar}>
        <div className={styles.topbarContainer}>
          
          {/* ✅ 검색창 */}
          <div className={styles.search}>
            <form onSubmit={handleSearch} className={styles.searchForm}>
              <input
                ref={inputRef}
                type="text"
                value={searchText}
                onChange={handleInputChange}
                placeholder="검색어 입력..."
                className={styles.searchInput}
              />
              <button type="submit" className={styles.searchButton}>
                <FaSearch />
              </button>
            </form>

            {showResults && (
              <div className={styles.resultsPanel}>
                {isLoading ? (
                  <div className={styles.resultItem}>검색 중...</div>
                ) : searchResults.length === 0 ? (
                  <div className={styles.resultItem}>결과 없음</div>
                ) : (
                  searchResults.map((s, i) => (
                    <div
                      key={i}
                      className={styles.resultItem}
                      onClick={() => handleResultClick(s.label || s.title)}
                    >
                      [{s.type}] {s.label || s.title}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* ✅ 유저 정보 / 메뉴 */}
          <div className={styles.userInfoBox}>
            <img
              className={styles.profileImage}
              src={user.profile_image
                ? `https://react-server-wmqa.onrender.com${profileImage}`
                : personIcon}
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
                      <div className={styles.light} onClick={() => document.documentElement.setAttribute('data-theme', 'light')}>
                        Light
                      </div>
                      <div className={styles.dark} onClick={() => document.documentElement.setAttribute('data-theme', 'dark')}>
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
