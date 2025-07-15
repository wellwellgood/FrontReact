import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import styles from "./section2.module.css";
import Search from "../../search.js";
import { useNavigate } from "react-router-dom";
import { FaPaperclip } from "react-icons/fa";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../firebase/firebase.js";
import AccountSetting from '../../AccountSetting.js';
import Logo from "../../image/logo.png";
// import { ReactComponent as Icon } from '../../image/download-svgrepo-com.svg';

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
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const u = sessionStorage.getItem("username");
    const n = sessionStorage.getItem("name");
    if (!u || !n) navigate("/login");
    else {
      setUsername(u);
      setName(n);
    }
  }, [navigate]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    scrollToBottom();
  
    // 마지막 메시지 ID 저장
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg?.id && selectedUser?.username) {
        const key = `${selectedUser.username}_lastMessageId`;
        localStorage.setItem(key, lastMsg.id);
      }
    }
  }, [messages]);


  useEffect(() => {
    if (!username) return;
  
    const s = io(API, {
      transports: ["websocket"],
      withCredentials: true,
    });
  
    setSocket(s);
  
    s.on("connect", () => {
      s.emit("join", username);
    });
  
    s.on("message", (msg) => {
      console.log("📥 수신된 메시지:", msg);
      setMessages((prev) => {
        const isDuplicate = prev.some((m) => m.id === msg.id);
        return isDuplicate ? prev : [...prev, msg];
      });
    });
  
    s.on("messageRead", ({ sender_username, receiver_username }) => {
      console.log("👁‍🗨 읽음 확인 이벤트 수신:", sender_username, "→", receiver_username);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.sender_username === username &&
          msg.receiver_username === sender_username &&
          !msg.read
            ? { ...msg, read: true }
            : msg
        )
      );
    });
  
    return () => s.disconnect();
  }, [username]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${API}/users`);
        console.log("🧾 받은 유저 목록:", res.data); // ← 이거 추가했는지 확인
        setUsers(res.data || []);
      } catch (err) {
        console.error("❌ 유저 목록 불러오기 실패:", err);
        setUserListError("유저 목록을 불러오는 데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, [username]);

  useEffect(() => {
    if (!username || !selectedUser || messages.length === 0) return;
  
    const timeout = setTimeout(() => {
      const hasUnread = messages.some(
        (msg) =>
          msg.sender_username === selectedUser.username &&
          msg.receiver_username === username &&
          !msg.read
      );
  
      if (!hasUnread) {
        console.log("✅ 모든 메시지 이미 읽음");
        return;
      }
  
      axios
        .post(`${API}/api/messages/read`, {
          sender_username: selectedUser.username,
          receiver_username: username,
        })
        .then(() => {
          console.log("✅ 읽음 처리 완료 → emit");
          socket?.emit("messageRead", {
            sender_username: username,
            receiver_username: selectedUser.username,
          });
        })
        .catch((err) => {
          console.error("❌ 읽음 처리 실패:", err);
        });
    }, 100); // ← 100ms 정도만 딜레이 줘도 충분
  
    return () => clearTimeout(timeout);
  }, [messages, selectedUser, username]);

useEffect(() => {
  if (!username || !selectedUser) return;

  axios.post(`${API}/api/messages/read`, {
    sender_username: selectedUser.username,
    receiver_username: username,
  })
  .then(() => axios.get(`${API}/api/messages`, {
    params: { username, target: selectedUser.username },
  }))
  .then((res) => {
    setMessages(Array.isArray(res.data) ? res.data : []);

    // ✅ 추가: 읽음 완료 후 서버에 socket으로 알림
    socket?.emit("messageRead", {
      sender_username: username,
      receiver_username: selectedUser.username,
    });
  })
  .catch((err) => {
    console.error(err);
  });
  socket.on("messageRead", ({ sender_username, receiver_username }) => {
    console.log("👁‍🗨 읽음 확인 이벤트 수신:", sender_username, "→", receiver_username);
  
    // 내가 보낸 메시지 중에서 읽힌 것들 read: true로 바꾸기
    setMessages((prevMessages) =>
      prevMessages.map((msg) =>
        msg.sender_username === username &&
        msg.receiver_username === sender_username &&
        !msg.read
          ? { ...msg, read: true }
          : msg
      )
    );
  });
}, [selectedUser, username]);

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

    const savedMessage = res.data;

    socket?.emit("sendMessage", savedMessage);      // 상대방에게 전달 ✅

    setInput("");
    setSelectedFile(null);
    fileInputRef.current.value = "";
  } catch (err) {
    console.error(err);
  }
};

const sortedUsers = [
  ...users.filter((u) => u.username === username), // 나 먼저
  ...users.filter((u) => u.username !== username), // 그 외 나머지
];

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getMessageReadStatus = (msg) => {
    if (msg.sender_username !== username) return null;
    return msg.read || readMessages.has(msg.id) ? '읽음' : '안읽음';
  };

  const getFilteredMessages = () => {
    if (!selectedUser) return [];
    return messages.filter(
      (msg) =>
        (msg.sender_username === username && msg.receiver_username === selectedUser.username) ||
        (msg.receiver_username === username && msg.sender_username === selectedUser.username)
    );
  };

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

  const formatBytes = (bytes) => {
    if (!bytes) return "0 B";
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + " " + sizes[i];
  };

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
      console.error(e);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleLogout = () => {
    sessionStorage.clear();
    socket?.disconnect();
    setUsername(""); setName(""); setUsers([]);
    setMessages([]); setSelectedUser(null); setReadMessages(new Set());
    navigate("/login");
  };

  const handleNavigation = (path) => {
    navigate?.(path) || (window.location.href = path);
  };

  const fetchSearchData = async () => {
    try {
      const res = await axios.get(`${API}/api/search`, { params: { q: searchText } });
      setSearchResults(res.data || []);
      setShowResults(true);
    } catch (err) {
      console.error(err);
    }
  };

  //스크롤 최 하단 고정
  useEffect(() => {
    const observer = new MutationObserver(() => {
      chatBoxRef.current?.scrollTo({ top: chatBoxRef.current.scrollHeight });
    });

    if (chatBoxRef.current) {
      observer.observe(chatBoxRef.current, { childList: true, subtree: true });
    }

    return () => observer.disconnect();
  }, []);

  const scrollToBottom = () => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  };

  // const DownIcon = () => (
  //   <Icon style={{ width: 16, height: 16, color: "black", marginLeft: "5px" }} />
  // );


  return (
    <div className={styles.container}>
      {/* 네비게이션 바 */}
      <nav>
        <div className={styles.nav}>
          <div className={styles.logo1}><img src={Logo} className={styles.logo}></img></div>
          <ul className={styles.navmenu}>
            <li className={styles.homebtn}><button className={styles.button} onClick={() => navigate("/main")}>Home</button></li>
            <li className={styles.infobtn}><button className={styles.button} onClick={() => navigate("/ChatApp")}>Chat</button></li>
            <li className={styles.filebtn}><button className={styles.button} onClick={() => navigate("/file")}>File</button></li>
            <li className={styles.emailbtn}><button onClick={() => navigate("/sendEmail")}>Email</button></li>
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

  {[
    ...users.filter((u) => u.username === username),
    ...users.filter((u) => u.username !== username),
  ].map((user) => {
    const unreadCount = messages.filter(
      (msg) =>
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
              {(() => {
                const filteredMessages = getFilteredMessages();

                return filteredMessages.map((msg, index) => {
                  const isMine = msg.sender_username === username;
                  const readStatus = getMessageReadStatus(msg);

                  return (
                    <div 
                      key={msg.id || index} 
                      id={`msg-${msg.id}`}
                      className={isMine ? styles.myMessage : styles.theirMessage}
                    >
                      {!isMine && (
                        <div className={styles.profileIcon}>
                        </div>
                      )}
                      <div className={styles.bubbleWrapper}>
                        <div className={styles.messageBubble}>
                          <div className={styles.messageText}>
                          {msg.file_url && msg.file_name &&(
                            <div className={styles.filePreview}>
                              <button className={styles.downBtn} onClick={() => forceDownload(msg.file_url, msg.file_name)}>
                              {msg.file_name} ({formatBytes(msg.file_size || 0)})
                              {/* <DownIcon /> */}
                              </ button>
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
                          {name?.[0] || "?"}
                        </div>
                      )}
                    </div>
                  );
                });
              })()}
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
      {showSettings && (
        <AccountSetting onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
};

export default Section2;