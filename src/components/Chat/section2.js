// section2.js
import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import styles from "./section2.module.css";
import Search from "../../search";
import { useNavigate } from "react-router-dom";

const Section2 = ({ username, name }) => {
  const [socket, setSocket] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const chatBoxRef = useRef(null);
  const [theme, setTheme] = useState("light");
  const [searchResults, setSearchResults] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const fetchSearchData = () => {};
  const handleLogout = () => {};

  const API = process.env.REACT_APP_API || "http://localhost:4000";

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const newSocket = io(API);
    setSocket(newSocket);

    newSocket.on("message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => newSocket.disconnect();
  }, []);

  useEffect(() => {
    axios.get(`${API}/api/users`).then((res) => {
      console.log("유저 응답 데이터:", res.data);
      const userList = Array.isArray(res.data) ? res.data : [];
      if (userList.length && userList.filter) {
        setUsers(userList.filter((u) => u.username !== username));
      } else {
        console.warn("⚠️ 유저 데이터가 배열이 아님:", userList);
        setUsers([]);
      }
    });
    axios.get(`${API}/api/messages`).then((res) => {
      setMessages(res.data);
    });
  }, [username]);

  useEffect(() => {
    chatBoxRef.current?.scrollTo(0, chatBoxRef.current.scrollHeight);
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !selectedUser) return;

    const msg = {
      sender_username: username,
      receiver_username: selectedUser.username,
      sender_name: name,
      content: input,
    };

    try {
      axios.post(`${API}/api/messages`, msg)
      socket.emit("message", msg);
      setMessages((prev) => [...prev, { ...msg, time: new Date().toISOString() }]);
      setInput("");
    } catch (err) {
      console.error("❌ 메시지 전송 오류:", err);
    }
  };

  return (
    <div className={styles.container}>
      <nav>
        <div className={styles.nav}>
          <div className={styles.logo1}>
            <h2>Logo</h2>
            <span></span>
          </div>
          <ul className={styles.navmenu}>
            <li className={styles.homebtn}><button className={styles.button} onClick={() => navigate("/main")}>Home</button></li>
            <li className={styles.infobtn}><button className={styles.button} onClick={() => navigate("/ChatApp")}>Chat</button></li>
            <li className={styles.filebtn}><button className={styles.button} onClick={() => navigate("/file")}>File</button></li>
            <li className={styles.emailbtn}><button onClick={() => navigate("/sendEmail")}>Email</button></li>
          </ul>
          {/* <div className={styles.setting}><Link to="/">Setting</Link></div> */}
        </div>
      </nav>

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
      
      <div className={styles.userList}>
        <h3>유저 목록</h3>
        {users.map((user) => (
          <div
            key={user.username}
            className={`${styles.userItem} ${
              selectedUser?.username === user.username ? styles.selected : ""
            }`}
            onClick={() => setSelectedUser(user)}
          >
            {user.name} ({user.username})
          </div>
        ))}
      </div>

      <div className={styles.chatBox}>
        <div className={styles.chatHeader}>
          {selectedUser ? `${selectedUser.name}님과 채팅중` : "채팅할 유저를 선택하세요"}
        </div>
        <div className={styles.messages} ref={chatBoxRef}>
          {messages
            .filter(
              (msg) =>
                (msg.sender_username === username && msg.receiver_username === selectedUser?.username) ||
                (msg.receiver_username === username && msg.sender_username === selectedUser?.username)
            )
            .map((msg, index) => (
              <div
                key={index}
                className={
                  msg.sender_username === username
                    ? styles.myMessage
                    : styles.theirMessage
                }
              >
                <div className={styles.messageMeta}>
                  <span className={styles.sender}>{msg.sender_name}</span>
                  <span className={styles.time}>
                    {new Date(msg.time).toLocaleTimeString("ko-KR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className={styles.messageText}>{msg.content}</div>
              </div>
            ))}
        </div>
        <div className={styles.inputBox}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="메시지를 입력하세요"
          />
          <button onClick={handleSend}>전송</button>
        </div>
      </div>
    </div>
  );
};

export default Section2;
