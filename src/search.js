import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
// import { Link } from 'react-router-dom';
import axios from 'axios';
import styles from './search.module.css';
import personIcon from './image/person-circle.jpg'

const Search = ({
  showSettings = false,
  setShowSettings = () => {},
  showResults = false,
  setShowResults = () => {},
  searchText = '',
  setSearchText = () => {}
}) => {
  const navigate = useNavigate();
  const [user, setUser] = useState({ profile_image: "" });
  const [profileImage, setProfileImage] = useState("");
  const [username, setUsername] = useState(""); // 추가됨
  const [showInfoForm, setShowInfoForm] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const infoRef = useRef();
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const storedImage = sessionStorage.getItem("profileImage");
    const storedUsername = sessionStorage.getItem("username");
    const receiverUsername = sessionStorage.getItem("receiver_username");

    if (!storedUsername) return;

    setProfileImage(storedImage);
    setUsername(receiverUsername || storedUsername); // receiver 있으면 그걸 사용

    axios.get(`/api/users/${storedUsername}`)
      .then((res) => setUser(res.data))
      .catch((err) => console.error("유저 정보 가져오기 실패:", err));
  }, []);

  useEffect(() => {
    if (!searchText.trim()) return setSearchResults([]);
  
    const timer = setTimeout(async () => {
      try {
        const res = await axios.get(`/api/suggest?keyword=${searchText}`);
        setSearchResults(res.data);
        setShowResults(true);
      } catch (e) {
        console.error("자동완성 실패:", e);
      }
    }, 300); // ⏱️ debounce
  
    return () => clearTimeout(timer);
  }, [searchText]);
  

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchText.trim() === '') return;
  
    try {
      setIsLoading(true);
      const res = await axios.get(`/api/search?query=${encodeURIComponent(searchText)}`);
      setSearchResults(res.data);
      setShowResults(true);
    } catch (err) {
      console.error("🔍 검색 실패:", err);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };
  

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        !event.target.closest(`.${styles.search}`) &&
        !infoRef.current?.contains(event.target)
      ) {
        setShowResults(false);
        setShowInfoForm(false);
        setShowThemeMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    setSearchText(e.target.value);
    setShowResults(e.target.value.trim() !== '');
  };

  const handleResultClick = (path) => {
    navigate(path);
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

  return (
    <div className={styles.topbar}>
      <div className={styles.topbarContainer}>
        <div className={styles.search}>
          <form onSubmit={handleSearch} className={styles.searchForm}>
            <input
              type="text"
              value={searchText}
              onChange={handleInputChange}
              placeholder="검색어 입력..."
              className={styles.searchInput}
            />
            <button type="submit" className={styles.searchButton}><FaSearch /></button>
          </form>
          {showResults && (
            <div className={styles.resultsPanel}>
              {searchResults.map((s, i) => (
                <div key={i} className={styles.resultItem} onClick={() => handleResultClick(s.type === "user" ? `/user/${s.label}` : `/file`)}>
                  {s.type === "user" ? "👤" : "📁"} {s.label}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.userInfoBox} ref={infoRef}>
          <img
            className={styles.profileImage}
            src={user.profile_image ? `https://react-server-wmqa.onrender.com${profileImage}` : personIcon}
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
                  onClick={() => {
                    console.log("⚙️ 설정 버튼 클릭됨");
                    setShowSettings(true);
                  }}
                  className={styles.settingsButton}
                >
                  ⚙️ 설정 열기
                </button>
              </div>

              <div className={styles.menuItem}>
                <span onClick={toggleThemeMenu} className={styles.link}>Theme</span>
                {showThemeMenu && (
                  <div className={styles.themeMenu}>
                    <div className={styles.light} onClick={() => toggleTheme("light")}>Light</div>
                    <div className={styles.dark} onClick={() => toggleTheme("dark")}>Dark</div>
                  </div>
                )}
              </div>

              <div className={styles.user}>
                <span className={styles.userbox}>
                  <button className={styles.logout} onClick={handleLogout}>로그아웃</button>
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;
