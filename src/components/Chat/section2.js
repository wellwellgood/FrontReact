import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import styles from "./section2.module.css";
import Search from "../../search";
import { useNavigate } from "react-router-dom";
import { FaPaperclip } from "react-icons/fa";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../firebase/firebase";
import { ReactComponent as Icon } from '../../image/download-svgrepo-com.svg';

const API = "https://react-server-wmqa.onrender.com";

const Section2 = () => {
  const navigate = useNavigate();
  const chatBoxRef = useRef(null);
  const fileInputRef = useRef(null);

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

  // 초기 로그인 정보 확인
  useEffect(() => {
    const u = sessionStorage.getItem("username");
    const n = sessionStorage.getItem("name");
    if (!u || !n) {
      navigate?.("/login") || (window.location.href = "/login");
    } else {
      setUsername(u);
      setName(n);
    }
  }, [navigate]);

  // 테마 반영
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // 소켓 연결 및 메시지 수신 처리
  useEffect(() => {
    if (!username) return;

    const s = io(API, { transports: ["websocket"] });
    setSocket(s);

    s.on("message", (msg) => {
      if (!msg || msg.sender_username === username) return;
      const safeMsg = {
        ...msg,
        time: msg.time || new Date().toISOString(),
        read: msg.read || false,
        content: msg.content || '',
        id: msg.id || `socket_${Date.now()}`
      };

      const isCurrentChat = (
        (safeMsg.sender_username === selectedUser?.username && safeMsg.receiver_username === username) ||
        (safeMsg.sender_username === username && safeMsg.receiver_username === selectedUser?.username)
      );
      if (!isCurrentChat) return;

      setMessages((prev) => {
        const isDuplicate = prev.some((m) =>
          m.id === safeMsg.id ||
          (m.sender_username === safeMsg.sender_username &&
            m.receiver_username === safeMsg.receiver_username &&
            m.content === safeMsg.content &&
            Math.abs(new Date(m.time) - new Date(safeMsg.time)) < 2000)
        );
        return isDuplicate ? prev : [...prev, safeMsg];
      });
    });

    s.on("messageRead", ({ messageId }) => {
      setReadMessages((prev) => new Set([...prev, messageId]));
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, read: true } : msg
        )
      );
    });

    return () => s.disconnect();
  }, [username, selectedUser]);

  // 자동 스크롤
  useEffect(() => {
    chatBoxRef.current?.scrollTo(0, chatBoxRef.current.scrollHeight);
  }, [messages]);

  // 사용자 목록 불러오기
  useEffect(() => {
    if (!username) return;

    setIsLoading(true);
    axios.get(`${API}/users`, { params: { exclude: username } })
      .then((res) => {
        setUsers(res.data);
        setUserListError("");
      })
      .catch((err) => {
        console.error("❌ 유저 목록 불러오기 실패:", err);
        setUserListError("유저 목록을 불러오지 못했습니다.");
      })
      .finally(() => setIsLoading(false));
  }, [username]);

  // 대화 상대 변경 시 메시지 불러오기 + 읽음 처리
  useEffect(() => {
    if (!username || !selectedUser) return;

    axios.post(`${API}/api/messages/read`, {
      sender_username: selectedUser.username,
      receiver_username: username,
    }).then(() => {
      axios.get('${APi}/api/messages', {
        params: {
          username, target: selectedUser,username
        },
      }).then((res) => setMessages(res.data));
    }).catch((err) => {
      console.error("❌ 읽음 처리 실패:", err);
    });

    axios.get(`${API}/api/messages`, {
      params: {
        username,
        target: selectedUser.username,
      },
    })
      .then((res) => setMessages(res.data))
      .catch((err) => {
        console.error("❌ 메시지 불러오기 실패:", err);
      });
  }, [selectedUser, username]);

  // 메시지 전송
  const handleSend = async () => {
    if (!input.trim() && !selectedFile) return;

    try {
      let fileUrl = null, fileName = null, fileSize = null;

      if (selectedFile) {
        const uniqueName = `${Date.now()}-${selectedFile.name}`;
        const fileRef = storageRef(storage, `chat/${uniqueName}`);
        await uploadBytes(fileRef, selectedFile);
        fileUrl = await getDownloadURL(fileRef);
        fileName = selectedFile.name;
        fileSize = selectedFile.size;
      }

      const res = await axios.post(`${API}/api/messages`, {
        sender_username: username,
        receiver_username: selectedUser.username,
        receiver_name: selectedUser.name,
        content: input.trim() || "[파일]",
        file_url: fileUrl,
        file_name: fileName,
        file_size: fileSize,
        read: false,
      });

      setMessages((prev) => [...prev, res.data]);
      socket?.emit("sendMessage", res.data);
      setInput("");
      setSelectedFile(null);
      fileInputRef.current.value = "";
    } catch (err) {
      console.error("❌ 메시지 전송 실패:", err);
      alert("메시지 전송 중 오류 발생");
    }
  };

  // 키 이벤트
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 메시지 읽음 표시
  const getMessageReadStatus = (msg) => {
    if (msg.sender_username !== username) return null;
    return msg.read || readMessages.has(msg.id) ? '읽음' : '안읽음';
  };

  // 메시지 필터
  const getFilteredMessages = () => {
    if (!selectedUser) return [];
    return messages.filter((msg) =>
      (msg.sender_username === username && msg.receiver_username === selectedUser.username) ||
      (msg.receiver_username === username && msg.sender_username === selectedUser.username)
    );
  };

  // 하이퍼링크 자동 처리
  const convertTextToLink = (text) => {
    const regex = /\b((?:https?:\/\/|ftp:\/\/|www\.)[^\s\/]+(?:\/[^\s\/]+)*)(?:\/)?/gi;
    return text.split(regex).map((part, i) =>
      regex.test(part) ? (
        <a key={i} href={part.startsWith("http") ? part : `https://${part}`} target="_blank" rel="noopener noreferrer" style={{ color: "#4caf50" }}>
          {part}
        </a>
      ) : part
    );
  };

  // 용량 포맷
  const formatBytes = (bytes) => {
    if (!bytes) return "0 B";
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + " " + sizes[i];
  };

  // 다운로드
  const forceDownload = async (url, filename) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(blobUrl);
    } catch (e) {
      console.error("❌ 다운로드 실패:", e);
    }
  };

  // 파일 선택
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleNavigation = (path) => {
    navigate?.(path) || (window.location.href = path);
  };

  const handleLogout = () => {
    sessionStorage.clear();
    socket?.disconnect();
    setUsername(""); setName(""); setUsers([]);
    setMessages([]); setSelectedUser(null); setReadMessages(new Set());
    navigate?.("/login") || (window.location.href = "/login");
  };

  const fetchSearchData = () => {
    console.log("🔍 검색 요청");
  };

  const DownIcon = () => (
    <Icon style={{ width: 16, height: 16, color: "black", marginLeft: "5px" }} />
  );

  const s = io(API, { 
    ransports: ["websocket"],
    reconnectionAttempts: 3,
    timeout: 5000,
  });
  s.emit("online", username);

  useEffect(() => {
    if (!socket) return;
    socket.on("onlineUsers", (list) => {
      setOnlineUsers(list); // ✅ 상태로 관리
    });
  }, [socket]);

  return (
    <div className={styles.container}>
      {/* 네비게이션 바 */}
      <nav>
        <div className={styles.nav}>
          <div className={styles.logo1}>
            <h2>Logo</h2>
          </div>
          <ul className={styles.navmenu}>
            <li><button onClick={() => handleNavigation("/main")}>Home</button></li>
            <li><button onClick={() => handleNavigation("/ChatApp")}>Chat</button></li>
            <li><button onClick={() => handleNavigation("/file")}>File</button></li>
            <li><button onClick={() => handleNavigation("/sendEmail")}>Email</button></li>
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
              <button 
                onClick={() => window.location.reload()}
                style={{ marginTop: '5px', padding: '5px 10px' }}
              >
                새로고침
              </button>
              <button 
                onClick={() => {
                  setUserListError("");
                  setIsLoading(true);
                  // 수동으로 다시 로드
                  window.location.reload();
                }}
                style={{ marginTop: '5px', marginLeft: '5px', padding: '5px 10px' }}
              >
                다시 시도
              </button>
            </div>
          )}
          
          {!isLoading && !userListError && users.length === 0 && (
            <div className={styles.noUsers}>
              <div>등록된 다른 사용자가 없습니다.</div>
              <button 
                onClick={() => {
                  console.log("🔄 수동 새로고침 시도");
                  window.location.reload();
                }}
                style={{ marginTop: '10px', padding: '5px 10px', fontSize: '12px' }}
              >
                새로고침
              </button>
            </div>
          )}
          
          {users.map((user) => {
            // 각 유저와의 안읽은 메시지 수 계산
            const unreadCount = messages.filter(msg => 
              msg.sender_username === user.username && 
              msg.receiver_username === username && 
              !msg.read
            ).length;

            return (
              <div
                key={user.username}
                className={`${styles.userItem} ${selectedUser?.username === user.username ? styles.selected : ""}`}
                onClick={() => {
                  setSelectedUser(user);
                }}
              >
                <span>
                  {user.name} ({user.username})
                  {onlineUsers.includes(user.username) && <span className={styles.onlineDot}>●</span>}
                </span>
              </div>
            );
          })}
        </div>

        {/* 채팅 박스 */}
        <div className={styles.chatBox}>
          <div className={styles.chatHeaderContainer}>
            <div className={styles.chatHeader}>
              {selectedUser ? `${selectedUser.name}님과 채팅중...` : "채팅할 유저를 선택하세요"}
            </div>
          
            {/* 메시지 표시 영역 */}
            <div className={styles.messages} ref={chatBoxRef}>
              {(() => {
                const filteredMessages = getFilteredMessages();

                return filteredMessages.map((msg, index) => {
                  const isMine = msg.sender_username === username;
                  const readStatus = getMessageReadStatus(msg);

                  return (
                    <div 
                      key={msg.id || index} 
                      className={isMine ? styles.myMessage : styles.theirMessage}
                    >
                      {!isMine && (
                        <div className={styles.profileIcon}>
                        </div>
                      )}
                      <div className={styles.bubbleWrapper}>
                        <div className={styles.messageBubble}>
                          <div className={styles.messageText}>
                          {msg.fileurl && msg.file_name &&(
                            <div className={styles.filePreview}>
                              <button className={styles.downBtn} onClick={() => forceDownload(msg.fileurl, msg.file_name)}>
                              {msg.file_name} ({formatBytes(msg.file_size || 0)})
                              <DownIcon />
                              </ button>
                            </div>
                          )}
                            {convertTextToLink(msg.content || '내용 없음')}
                          </div>
                          <div className={styles.messageMeta}>
                            <span className={styles.time}>
                              {msg.time
                                ? new Date(msg.time).toLocaleTimeString("ko-KR", {
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
                          {name?.[0] || "?"}
                        </div>
                      )}
                    </div>
                  );
                });
              })()}
            </div>
          </div>

          {/* 메시지 입력 영역 */}
          <div className={styles.inputBox}>
            <button
              type="button"
              className={styles.fileButton}
              onClick={() => fileInputRef.current?.click()}
              title="파일 첨부"
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
            />

            <button 
              className={styles.submit} 
              onClick={handleSend} 
              disabled={(!input.trim() && !selectedFile) || !selectedUser}
            >
              전송
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Section2;