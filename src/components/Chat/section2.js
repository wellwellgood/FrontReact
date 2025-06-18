import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import styles from "./section2.module.css";
import Search from "../../search";
import { useNavigate } from "react-router-dom";
import { FaPaperclip } from "react-icons/fa";
import { flushSync } from "react-dom";

import { ReactComponent as Icon } from '../../image/download-svgrepo-com.svg';

const Section2 = () => {
  // Navigate 훅을 먼저 선언
  const navigate = useNavigate();
  
  // Socket 관련 상태
  const [socket, setSocket] = useState(null);
  
  // 사용자 관련 상태
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  
  // 메시지 관련 상태
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [readMessages, setReadMessages] = useState(new Set());
  
  // UI 관련 상태
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  const [searchResults, setSearchResults] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userListError, setUserListError] = useState("");
  
  // 파일 관련 상태
  const [selectedFile, setSelectedFile] = useState(null);
  
  // Refs
  const chatBoxRef = useRef(null);
  const fileInputRef = useRef(null);

  const API = "https://react-server-wmqa.onrender.com";

  // 초기 사용자 인증 확인
  useEffect(() => {
    const storedUsername = sessionStorage.getItem("username");
    const storedName = sessionStorage.getItem("name");
    
    if (storedUsername && storedName) {
      setUsername(storedUsername);
      setName(storedName);
    } else {
      console.warn("세션 저장소에 username 또는 name 없음");
      // navigate가 정의되어 있는지 확인
      if (navigate) {
        navigate("/login");
      } else {
        // navigate가 없으면 window.location 사용
        window.location.href = "/login";
      }
    }
  }, [navigate]);

  // 테마 설정
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // 소켓 연결 및 이벤트 리스너 설정
  useEffect(() => {
    if (!username) return;

    const newSocket = io(API, {
      transports: ["websocket"],
    });
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("소켓 연결됨");
    });

    // 새 메시지 수신 (다른 사용자로부터)
    newSocket.on("message", (msg) => {
      if (!msg) {
        console.warn("⚠️ 수신된 메시지가 null입니다.");
        return;
      }
      
      // 내가 보낸 메시지는 이미 handleSend에서 처리했으므로 무시
      if (msg.sender_username === username) {
        return;
      }
      
      const safeMsg = {
        ...msg,
        content: msg.content || '',
        time: msg.time || new Date().toISOString(),
        read: msg.read || false,
        id: msg.id || `socket_${Date.now()}`,
      };

      console.log("✅ 다른 사용자 메시지 추가:", safeMsg);
      
      setMessages((prev) => {
        // 중복 확인
        const isDuplicate = prev.some((m) =>
          (m.id && safeMsg.id && m.id === safeMsg.id) ||
          (m.sender_username === safeMsg.sender_username &&
          m.receiver_username === safeMsg.receiver_username &&
          m.content === safeMsg.content &&
          Math.abs(new Date(m.time) - new Date(safeMsg.time)) < 2000)
        );
        
        if (isDuplicate) {
          console.log("🔄 중복 메시지 무시");
          return prev;
        }
        
        return [...prev, safeMsg];
      });
    });

    // 읽음 확인 수신
    newSocket.on("messageRead", ({ messageId, readBy }) => {
      console.log("📖 메시지 읽음 확인:", messageId, readBy);
      setReadMessages(prev => new Set([...prev, messageId]));
      
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? { ...msg, read: true, isTemporary: false }
            : msg
        )
      );
    });

    newSocket.on("disconnect", () => {
      console.log("소켓 연결 해제됨");
    });

    return () => newSocket.disconnect();
  }, [username]);

  // 사용자 목록 및 메시지 로드
  useEffect(() => {
    if (!username) return;

    axios.get(`${API}/users`, {
      params: { exclude: username } // 현재 로그인한 유저 제외 가능
    })
    .then(res => {
      setUsers(res.data);
      setUserListError("");
    })
    .catch(err => {
      console.error("❌ 유저 목록 불러오기 실패:", err);
      setUserListError("유저 목록을 불러오지 못했습니다.");
    })
    .finally(() => {
      setIsLoading(false);
    });
  
    const newSocket = io(API, {
      transports: ["websocket"],
    });
    setSocket(newSocket);
  
    newSocket.on("connect", () => {
      console.log("소켓 연결됨");
    });
  
    // ✅ null 체크를 통한 메시지 처리 개선
    newSocket.on("message", (msg) => {
      if (!msg) {
        console.warn("⚠️ 수신된 메시지가 null입니다.");
        return;
      }
      
      // ✅ 메시지에 필수 정보가 있는지 확인
      if (!msg.sender_username || !msg.receiver_username) {
        console.warn("⚠️ 메시지에 필수 정보가 없습니다:", msg);
        return;
      }
      
      // 내가 보낸 메시지는 이미 handleSend에서 처리했으므로 무시
      if (msg.sender_username === username) {
        return;
      }
      
      const safeMsg = {
        ...msg,
        content: msg.content || '',
        time: msg.time || new Date().toISOString(),
        read: msg.read || false,
        id: msg.id || `socket_${Date.now()}`,
      };
  
      console.log("✅ 다른 사용자 메시지 추가:", safeMsg);
      
      setMessages((prev) => {
        // 중복 확인
        const isDuplicate = prev.some((m) =>
          (m.id && safeMsg.id && m.id === safeMsg.id) ||
          (m.sender_username === safeMsg.sender_username &&
          m.receiver_username === safeMsg.receiver_username &&
          m.content === safeMsg.content &&
          Math.abs(new Date(m.time) - new Date(safeMsg.time)) < 2000)
        );
        
        if (isDuplicate) {
          console.log("🔄 중복 메시지 무시");
          return prev;
        }
        
        return [...prev, safeMsg];
      });
    });
  
    // 읽음 확인 수신
    newSocket.on("messageRead", ({ messageId, readBy }) => {
      console.log("📖 메시지 읽음 확인:", messageId, readBy);
      setReadMessages(prev => new Set([...prev, messageId]));
      
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? { ...msg, read: true, isTemporary: false }
            : msg
        )
      );
    });
  
    newSocket.on("disconnect", () => {
      console.log("소켓 연결 해제됨");
    });
  
    return () => newSocket.disconnect();
  }, [username]);

  // 메시지 읽음 상태 확인 함수
  const getMessageReadStatus = (msg) => {
    if (!msg || msg.sender_username !== username) {
      return null; // 내가 보낸 메시지가 아니면 읽음 상태 표시 안함
    }
    
    // 읽음 상태 확인
    if (msg.read || readMessages.has(msg.id)) {
      return '읽음';
    }
    
    return '안읽음';
  };

  // 필터링된 메시지 가져오기
  const getFilteredMessages = () => {
    if (!selectedUser) {
      return [];
    }

    return messages.filter((msg) => {
      const isMyMessage = msg.sender_username === username && msg.receiver_username === selectedUser.username;
      const isTheirMessage = msg.receiver_username === username && msg.sender_username === selectedUser.username;
      return isMyMessage || isTheirMessage;
    });
  };

  // 메시지 전송 처리
// Fixed handleSend function
const handleSend = async () => {
  if ((!input.trim() && !selectedFile) || !selectedUser || !username || !name) {
    console.warn("❌ 메시지 전송 조건 불충족");
    return;
  }

  const tempId = `temp_${Date.now()}`;
  const now = new Date().toISOString();

  const tempMessage = {
    id: tempId,
    sender_username: username,
    receiver_username: selectedUser.username,
    receiver_name: selectedUser.name,
    content: input.trim(),
    read: false,
    time: now,
    isTemporary: true,
  };

  // ✅ 즉시 채팅창에 표시
  flushSync(() => {
    setMessages((prev) => [...prev, tempMessage]);
  });
  setInput("");
  
  // ✅ 스크롤 보장
  setTimeout(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, 0);

  try {
    let response; // ✅ response 변수를 항상 정의

    if (selectedFile) {
      const formData = new FormData();
      formData.append("sender_username", username);
      formData.append("receiver_username", selectedUser.username);
      formData.append("receiver_name", selectedUser.name);
      formData.append("content", input.trim());
      formData.append("read", false);
      formData.append("file", selectedFile);

      console.log("전송되는 formData 값들", {
        sender_username: username,
        receiver_username: selectedUser.username,
        receiver_name: selectedUser.name,
        content: input.trim()
      });
      console.log("formData.has(file):", formData.has("file")); 
      console.log("file:", selectedFile);

      // ✅ response에 결과 저장
      response = await axios.post(`${API}/api/messages`, formData);

      setSelectedFile(null);
    } else {
      response = await axios.post(`${API}/api/messages`, {
        sender_username: username,
        receiver_username: selectedUser.username,
        receiver_name: selectedUser.name,
        content: input.trim(),
        read: false,
      });
    }

    // ✅ response가 존재하고 data가 있는지 확인
    if (response && response.data) {
      const savedMessage = response.data;
      console.log("✅ 저장된 메시지 응답:", savedMessage);
      console.log("📎 메시지 내용 확인:", savedMessage);

      // ✅ 임시 메시지를 실제 메시지로 교체
      setMessages((prev) =>
        prev.map((msg) => (msg.id === tempId ? savedMessage : msg))
      );
    } else {
      console.warn("⚠️ 응답이 없거나 데이터가 없습니다:", response);
      // 응답이 없어도 임시 메시지는 유지 (서버에서 저장되었을 가능성)
      setMessages((prev) =>
        prev.map((msg) => (msg.id === tempId ? { ...msg, isTemporary: false } : msg))
      );
    }

  } catch (err) {
    console.error("❌ 메시지 전송 실패:", err.response?.data || err.message);
    alert("메시지 전송 실패");

    // ❗ 실패한 임시 메시지 제거 또는 회색 처리 유지
    setMessages((prev) => prev.map((msg) =>
      msg.id === tempId ? { ...msg, content: "(전송 실패)", failed: true } : msg
    ));
  }
};

  // 키보드 이벤트 처리
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 검색 데이터 가져오기
  const fetchSearchData = () => {
    console.log("🔍 검색 데이터 가져오기");
  };

  // 로그아웃 처리
  const handleLogout = () => {
    console.log("🚪 로그아웃 처리");
    
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("name");
    sessionStorage.clear();
    
    if (socket) {
      socket.disconnect();
    }
    
    setUsername("");
    setName("");
    setUsers([]);
    setMessages([]);
    setSelectedUser(null);
    setReadMessages(new Set());
    
    // navigate 사용 시도, 실패하면 window.location 사용
    try {
      if (navigate) {
        navigate("/login");
      } else {
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("네비게이션 오류:", error);
      window.location.href = "/login";
    }
  };

  // 파일 선택 처리
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      console.log("📎 파일 선택됨:", file.name);
    }
  };

  // 네비게이션 핸들러들
  const handleNavigation = (path) => {
    try {
      if (navigate) {
        navigate(path);
      } else {
        window.location.href = path;
      }
    } catch (error) {
      console.error("네비게이션 오류:", error);
      window.location.href = path;
    }
  };
  useEffect(() => {
    if (!username || !selectedUser || !selectedUser.username) return;
  
    axios.get(`${API}/api/messages`, {
      params: {
        username: username,
        target: selectedUser.username,
      },
    })
      .then((res) => {
        console.log("📥 받은 메시지:", res.data);
        setMessages(res.data);
      })
      .catch((err) => {
        console.error("❌ 메시지 불러오기 실패:", err);
      });
  }, [selectedUser]);

  const DownIcon = () => (
    <Icon style={{ width: 16, height: 16, color: "black", marginLeft: "5px" }} />
  );

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
                <div className={styles.userInfo}>
                  <span>{user.name} ({user.username})</span>
                  {unreadCount > 0 && (
                    <span className={styles.unreadBadge}>{unreadCount}</span>
                  )}
                </div>
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
                          {msg.file_name && msg.file && (
                            <div className={styles.filePreview}>
                              <a
                                href={`${API}/uploads/${msg.file}`}
                                download={msg.file_name}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ display: "flex", alignItems: "center", gap: "4px" }}
                              >
                                {(msg.file_name || "파일").toString()}
                                <DownIcon />
                              </a>
                            </div>
                          )}
                            {msg.content || '내용 없음'}
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