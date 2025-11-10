import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import styles from "./search.module.css";
import personIcon from "./image/person-circle.jpg";
import AccountSetting from "./AccountSetting.js";

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
  const [isLoading, setIsLoading] = useState(false);
  const [showInfoForm, setShowInfoForm] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // ✅ 유저 정보 로드
  useEffect(() => {
    const getUserKey = () =>
      sessionStorage.getItem("username") ||
      localStorage.getItem("username") ||
      "defaultUser";

    const storedUsername =
      sessionStorage.getItem("username") || localStorage.getItem("username");
    if (!storedUsername) return;

    const currentUser = getUserKey();
    const storedImage =
      sessionStorage.getItem(`profileImage_${currentUser}`) ||
      localStorage.getItem(`profileImage_${currentUser}`);

    const receiverUsername = sessionStorage.getItem("receiver_username");

    setProfileImage(storedImage);
    setUsername(receiverUsername ? receiverUsername : storedUsername);

    axios
      .get(`${API}/users/${storedUsername}`)
      .then((res) => setUser(res.data))
      .catch((err) => console.error("유저 로드 실패:", err));

    const handleStorageChange = (e) => {
      if (e.key === `profileImage_${getUserKey()}`) {
        setProfileImage(e.newValue);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // ✅ 디바운스 자동완성
  const fetchSuggestions = useCallback(() => {
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
          const res = await axios.get(
            `${API}/api/search/suggest?keyword=${query}`
          );
          const raw = Array.isArray(res.data) ? res.data : [];
          setSearchResults(raw);
          setShowResults(true);
        } catch (err) {
          console.error("자동완성 실패:", err);
          setSearchResults([]);
        }
      }, 300);
    };
  }, []);

  const debouncedFetch = fetchSuggestions();

  useEffect(() => {
    debouncedFetch(searchText);
  }, [searchText, debouncedFetch]);

  // ✅ 입력 핸들러
  const handleInputChange = (e) => {
    setSearchText(e.target.value);
    setShowResults(e.target.value.trim() !== "");
  };

  // ✅ 검색 제출 → 새 페이지로 이동
  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchText.trim()) return;
    navigate(`/search?keyword=${encodeURIComponent(searchText)}`);
    setShowResults(false);
  };

  // ✅ 자동완성 항목 클릭 시 이동
  const handleResultClick = (item) => {
    const label = item?.label || item?.title || "";
    navigate(`/search?keyword=${encodeURIComponent(label)}`);
    setShowResults(false);
  };

  // ✅ 프로필 관련
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

  return (
    <div>
      {showSettings && (
        <AccountSetting onClose={() => setShowSettings(false)} />
      )}

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

            {/* ✅ 자동완성 패널 */}
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
                      onClick={() => handleResultClick(s)}
                    >
                      [{s.type}] {s.label || s.title}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* ✅ 유저 메뉴 */}
          <div className={styles.userInfoBox}>
            <img
              className={styles.profileImage}
              src={profileImage || personIcon}
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
                      <div
                        className={styles.light}
                        onClick={() =>
                          document.documentElement.setAttribute(
                            "data-theme",
                            "light"
                          )
                        }
                      >
                        Light
                      </div>
                      <div
                        className={styles.dark}
                        onClick={() =>
                          document.documentElement.setAttribute(
                            "data-theme",
                            "dark"
                          )
                        }
                      >
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
    </div>
  );
};

export default Search;
