import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import styles from "./section2.module.css";
import Search from "../../search.js";
import { useNavigate } from "react-router-dom";
import { FaPaperclip } from "react-icons/fa";
import AccountSetting from '../../AccountSetting.js';
import Logo from "../../image/logo.png";
import { 
  loadMessages, 
  sendMessage, 
  fetchUsers, 
  monitorConnectionStatus,
  addMessageWithDeduplication,
  API
} from '../../serverF/middlewares/cors.js';


const Section2 = () => {
  const navigate = useNavigate();
  const chatBoxRef = useRef(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // 상태 관리
  const [socket, setSocket] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  const [selectedFile, setSelectedFile] = useState(null);
  const [readMessages, setReadMessages] = useState(new Set());
  const [searchResults, setSearchResults] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userListError, setUserListError] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState({ status: 'disconnected' });

  // 연결 상태 모니터링
  useEffect(() => {
    const cleanup = monitorConnectionStatus((status) => {
      setConnectionStatus(status);
    });
    
    return cleanup;
  }, []);

  // 사용자 인증 확인
  useEffect(() => {
    const u = sessionStorage.getItem("username");
    const n = sessionStorage.getItem("name");
    if (!u || !n) {
      navigate("/login");
    } else {
      setUsername(u);
      setName(n);
    }
  }, [navigate]);

  // 테마 설정
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // 메시지 스크롤 처리
  useEffect(() => {
    scrollToBottom();
  
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg?.id && selectedUser?.username) {
        const key = `${selectedUser.username}_lastMessageId`;
        localStorage.setItem(key, lastMsg.id);
      }
    }
  }, [messages, selectedUser]);

  // 소켓 연결 및 메시지 수신 처리
  useEffect(() => {
    if (!username) return;
  
    const s = io(API, {
      transports: ["websocket"],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  
    setSocket(s);
  
    s.on("connect", () => {
      console.log("🔌 소켓 연결됨");
      s.emit("join", username);
    });
  
    s.on("message", (msg) => {
      console.log("📥 수신된 메시지:", msg);
      setMessages(prev => addMessageWithDeduplication(prev, msg));
    });
  
    s.on("messageRead", ({ messageId }) => {
      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId
            ? { ...msg, read: true }
            : msg
        )
      );
    });

    s.on("disconnect", () => {
      console.log("🔌 소켓 연결 해제");
    });

    s.on("reconnect", () => {
      console.log("🔄 소켓 재연결됨");
    });

    s.on("connect_error", (error) => {
      console.error("❌ 소켓 연결 오류:", error);
    });
  
    return () => {
      console.log("🧹 소켓 정리");
      s.disconnect();
    };
  }, [username]);

  // 사용자 목록 가져오기
  useEffect(() => {
    if (username) {
      fetchUsers(setUsers, setIsLoading, setUserListError);
    }
  }, [username]);

  // 사용자 선택 시 메시지 로드
  useEffect(() => {
    if (!username || !selectedUser) return;
  
    const loadMessagesWithErrorHandling = async () => {
      try {
        await loadMessages(username, selectedUser.username, socket, setMessages);
      } catch (error) {
        console.error('메시지 로드 실패:', error);
        setUserListError(`메시지 로드 실패: ${error.message}`);
      }
    };
  
    loadMessagesWithErrorHandling();
  }, [selectedUser, username, socket]);

  useEffect(() => {
    if (socket && username && selectedUser) {
      socket.emit("enterChat", {
        myUsername: username,
        withUser: selectedUser.username,
      });
    }
  }, [selectedUser, socket, username]);

  // 메시지 전송 처리 (개선된 버전)
  const handleSend = async () => {
    if (!input.trim() && !selectedFile) return;
    if (!selectedUser) return;
    if (isSending) return;

    setIsSending(true);

    try {
      let fileUrl = null, fileName = null, fileSize = null;
      
      // 파일 업로드 처리
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
  
        const res = await axios.post(`${API}/api/chat-upload`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
  
        fileUrl = res.data.url;       // 서버에서 반환한 URL
        fileName = selectedFile.name;
        fileSize = selectedFile.size;
      }

      // 메시지 데이터 준비
      const messageData = {
        sender_username: username,
        receiver_username: selectedUser.username,
        receiver_name: selectedUser.name,
        content: input.trim() || "[파일]",
        file_url: fileUrl,
        file_name: fileName,
        file_size: fileSize,
        read: false,
      };

      // cors.js의 sendMessage 함수 사용
      const savedMessage = await sendMessage(messageData);

      // 로컬 state에 즉시 추가 (중복 방지)
      setMessages(prev => addMessageWithDeduplication(prev, savedMessage));

      // 입력 필드 초기화
      setInput("");
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      console.log("📤 메시지 전송 완료:", savedMessage.id);

    } catch (err) {
      console.error("❌ 메시지 전송 실패:", err);
      alert(`메시지 전송에 실패했습니다: ${err.message}`);
    } finally {
      setIsSending(false);
    }
  };

  // 사용자 정렬 (나 먼저, 나머지는 이름순)
  const sortedUsers = [
    ...users.filter(u => u.username === username),
    ...users.filter(u => u.username !== username)
      .sort((a, b) => a.name.localeCompare(b.name))
  ];

  // 키보드 이벤트 처리
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 메시지 읽음 상태 확인
  const getMessageReadStatus = (msg) => {
    if (msg.sender_username !== username) return null;
    return msg.read || readMessages.has(msg.id) ? '읽음' : '안읽음';
  };

  // 필터링된 메시지 가져오기
  const getFilteredMessages = () => {
    console.log("📂 메시지 데이터:", messages);
    if (!selectedUser) return [];
    
    const filtered = messages.filter(msg =>
      (msg.sender_username === username && msg.receiver_username === selectedUser.username) ||
      (msg.receiver_username === username && msg.sender_username === selectedUser.username)
    );
    
    // 시간순 정렬
    return filtered.sort((a, b) => new Date(a.time) - new Date(b.time));
  };

  // 텍스트를 링크로 변환
  const convertTextToLink = (text) => {
    const regex = /\b((?:https?:\/\/|ftp:\/\/|www\.)[^\s\/]+(?:\/[^\s\/]+)*)(?:\/)?/gi;
    return text.split(regex).map((part, i) =>
      regex.test(part) ? (
        <a 
          key={i} 
          href={part.startsWith("http") ? part : `https://${part}`} 
          target="_blank" 
          rel="noopener noreferrer" 
          style={{ color: "#4caf50" }}
        >
          {part}
        </a>
      ) : part
    );
  };

  // 파일 크기 포맷팅
  const formatBytes = (bytes) => {
    if (!bytes) return "0 B";
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + " " + sizes[i];
  };

  // 파일 강제 다운로드
  const forceDownload = async (url, filename) => {
    try {
      const absoluteUrl = url.startsWith("http")
        ? url
        : `${API}${url.startsWith("/") ? url : "/" + url}`;
  
      const res = await fetch(absoluteUrl, { mode: 'cors' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
  
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
    } catch (e) {
      console.error("❌ 파일 다운로드 실패:", e);
      alert("파일을 다운로드할 수 없습니다.");
    }
  };

  // 파일 선택 처리
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      console.log("📎 파일 선택:", file.name);
    }
  };

  // 로그아웃 처리
  const handleLogout = () => {
    sessionStorage.clear();
    socket?.disconnect();
    setUsername("");
    setName("");
    setUsers([]);
    setMessages([]);
    setSelectedUser(null);
    setReadMessages(new Set());
    navigate("/login");
  };

  // 검색 데이터 가져오기
  const fetchSearchData = async () => {
    try {
      const res = await axios.get(`${API}/api/search`, { params: { q: searchText } });
      setSearchResults(res.data || []);
      setShowResults(true);
    } catch (err) {
      console.error("❌ 검색 실패:", err);
    }
  };

  // 스크롤 최하단으로 이동
  const scrollToBottom = () => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  };

  // 스크롤 자동 최하단 고정
  useEffect(() => {
    const observer = new MutationObserver(() => {
      if (chatBoxRef.current) {
        chatBoxRef.current.scrollTo({ 
          top: chatBoxRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }
    });

    if (chatBoxRef.current) {
      observer.observe(chatBoxRef.current, { childList: true, subtree: true });
    }

    return () => observer.disconnect();
  }, []);


  return (
    <div className={styles.container}>
      {/* 네비게이션 바 */}
      <nav>
        <div className={styles.nav}>
          <div className={styles.logo1}>
            <img src={Logo} className={styles.logo} alt="로고" />
          </div>
          <ul className={styles.navmenu}>
            <li className={styles.homebtn}>
              <button className={styles.button} onClick={() => navigate("/main")}>
                Home
              </button>
            </li>
            <li className={styles.infobtn}>
              <button className={styles.button} onClick={() => navigate("/ChatApp")}>
                Chat
              </button>
            </li>
            <li className={styles.filebtn}>
              <button className={styles.button} onClick={() => navigate("/file")}>
                File
              </button>
            </li>
            <li className={styles.emailbtn}>
              <button onClick={() => navigate("/sendEmail")}>
                Email
              </button>
            </li>
          </ul>
        </div>
      </nav>

      {/* 검색 컴포넌트 */}
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

      {/* 메인 채팅 화면 */}
      <div className={styles.chatscreen}>
        {/* 사용자 목록 */}
        <div className={styles.userList}>
          <h3>유저 목록 {users.length > 0 && `(${users.length}명)`}</h3>

          {isLoading && <div className={styles.loading}>로딩 중...</div>}

          {userListError && (
            <div className={styles.error}>
              <div>{userListError}</div>
              <button onClick={() => window.location.reload()}>새로고침</button>
              <button
                onClick={() => {
                  setUserListError("");
                  setIsLoading(true);
                  window.location.reload();
                }}
              >
                다시 시도
              </button>
            </div>
          )}

          {!isLoading && !userListError && users.length === 0 && (
            <div className={styles.noUsers}>
              <div>등록된 다른 사용자가 없습니다.</div>
              <button onClick={() => window.location.reload()}>새로고침</button>
            </div>
          )}

          {sortedUsers.map(user => {
            const unreadCount = messages.filter(msg =>
              msg.sender_username === user.username &&
              msg.receiver_username === username &&
              !msg.read
            ).length;

            return (
              <div
                key={user.username}
                className={`${styles.userItem} ${
                  selectedUser?.username === user.username ? styles.selected : ""
                }`}
                onClick={() => setSelectedUser(user)}
              >
                <span>
                  {onlineUsers.includes(user.username) && (
                    <span className={styles.onlineDot}>●</span>
                  )}
                  {user.name} ({user.username})
                  {unreadCount > 0 && (
                    <span className={styles.unreadBadge}>{unreadCount}</span>
                  )}
                </span>
              </div>
            );
          })}
        </div>

        {/* 채팅 박스 */}
        <div className={styles.chatBox}>
          <div className={styles.chatHeaderContainer} ref={chatBoxRef}>
            <div className={styles.chatHeader}>
              {selectedUser ? `${selectedUser.name}님과 채팅중...` : "채팅할 유저를 선택하세요"}
            </div>
          
            {/* 메시지 표시 영역 */}
            <div className={styles.messages}>
              {getFilteredMessages().map((msg, index) => {
                const isMine = msg.sender_username === username;
                const readStatus = getMessageReadStatus(msg);

                return (
                  <div 
                    key={`${msg.id}-${index}`}
                    id={`msg-${msg.id}`}
                    className={isMine ? styles.myMessage : styles.theirMessage}
                  >
                    {!isMine && (
                      <div className={styles.profileIcon}>
                        {msg.sender_username?.[0]?.toUpperCase() || "?"}
                      </div>
                    )}
                    <div className={styles.bubbleWrapper}>
                      <div className={styles.messageBubble}>
                        <div className={styles.messageText}>
                          {msg.file_url && msg.file_name && (
                            <div className={styles.filePreview}>
                              <button 
                                className={styles.downBtn} 
                                onClick={() => forceDownload(msg.file_url, msg.file_name)}
                              >
                                {msg.file_name} ({formatBytes(msg.file_size || 0)})
                              </button>
                            </div>
                          )}
                          {convertTextToLink(msg.content || '내용 없음')}
                        </div>
                        <div className={styles.messageMeta}>
                          <span className={styles.time}>
                            {msg.time
                              ? new Date(msg.time).toLocaleTimeString("ko-KR", {
                                  timeZone: "Asia/Seoul",
                                  year: "2-digit",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : ""}
                          </span>
                          {isMine && readStatus && (
                            <span className={`${styles.readMark} ${readStatus === '읽음' ? styles.read : styles.unread}`}>
                              {readStatus}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {isMine && (
                      <div className={styles.profileIcon}>
                        {name?.[0]?.toUpperCase() || "?"}
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* 메시지 입력 영역 */}
          <div className={styles.inputBox}>
            <button
              type="button"
              className={styles.fileButton}
              onClick={() => fileInputRef.current?.click()}
              title="파일 첨부"
              disabled={isSending}
            >
              <FaPaperclip size={20} />
            </button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              style={{ display: "none" }}
            />

            {selectedFile && (
              <div className={styles.selectedFile}>
                📎 {selectedFile.name}
                <button onClick={() => setSelectedFile(null)}>×</button>
              </div>
            )}

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="메시지를 입력하세요"
              disabled={isSending}
            />

            <button 
              className={styles.submit} 
              onClick={handleSend} 
              disabled={(!input.trim() && !selectedFile) || !selectedUser || isSending}
            >
              {isSending ? "전송 중..." : "전송"}
            </button>
          </div>
        </div>
      </div>

      {/* 계정 설정 모달 */}
      {showSettings && (
        <AccountSetting onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
};

export default Section2;