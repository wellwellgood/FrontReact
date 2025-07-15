// middlewares/cors.js (수정된 버전)
import cors from "cors";

const allowedOrigins = [
  "https://kivdashboard.netlify.app",
  "https://kkydashboard.netlify.app", 
  "http://localhost:3000",
  "http://localhost:10000",
  "https://react-server-wmqa.onrender.com"
];

const corsOptions = {
  origin: function (origin, callback) {
    console.log("🛰️ 요청 origin:", origin);
    
    // origin이 없는 경우 (같은 도메인, 모바일 앱, Postman 등)
    if (!origin) {
      console.log("✅ Origin이 없음 - 허용");
      callback(null, true);
      return;
    }
    
    // 슬래시 제거 후 비교
    const cleanOrigin = origin.replace(/\/$/, '');
    
    // 허용된 origin인지 확인
    if (allowedOrigins.includes(cleanOrigin)) {
      callback(null, true);
    } else {
      callback(new Error(`Not allowed by CORS: ${cleanOrigin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-HTTP-Method-Override'
  ],
  exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
  maxAge: 86400 // 24시간 프리플라이트 캐시
};

const corsMiddleware = cors(corsOptions);

// API 기본 URL
const API = "https://react-server-wmqa.onrender.com";

// 메시지 중복 제거 함수 (고급 버전)
const removeDuplicateMessagesAdvanced = (messages) => {
  if (!Array.isArray(messages)) return [];
  
  const uniqueMessages = new Map();
  
  messages.forEach(message => {
    // 고유 키 생성: sender + receiver + content + time
    const key = `${message.sender_username}_${message.receiver_username}_${message.content}_${message.time}`;
    
    if (!uniqueMessages.has(key)) {
      uniqueMessages.set(key, message);
    } else {
      // 같은 내용이지만 더 최신 id가 있다면 교체
      const existing = uniqueMessages.get(key);
      if (message.id > existing.id) {
        uniqueMessages.set(key, message);
      }
    }
  });
  
  return Array.from(uniqueMessages.values());
};

// 안전한 API 요청 함수 (개선된 버전)
const safeApiRequest = async (url, options = {}) => {
  const defaultOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    credentials: 'include',
    timeout: 10000, // 10초 타임아웃
    ...options
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), defaultOptions.timeout);
    
    const response = await fetch(url, {
      ...defaultOptions,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    // 응답 상태 확인
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ HTTP ${response.status}: ${errorText}`);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
    
  } catch (error) {
    console.error(`❌ API 요청 실패: ${url}`, error);
    
    // 타임아웃 에러 처리
    if (error.name === 'AbortError') {
      throw new Error('요청 시간이 초과되었습니다. 네트워크 연결을 확인해주세요.');
    }
    
    // 네트워크 에러 처리
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error('네트워크 연결을 확인해주세요');
    }
    
    // CORS 에러 처리
    if (error.message.includes('CORS')) {
      throw new Error('서버 연결 권한이 없습니다');
    }
    
    throw error;
  }
};

// 재시도 로직이 포함된 API 요청
const apiRequestWithRetry = async (url, options = {}, maxRetries = 3) => {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await safeApiRequest(url, options);
    } catch (error) {
      lastError = error;
      console.warn(`🔄 재시도 ${i + 1}/${maxRetries}: ${error.message}`);
      
      if (i < maxRetries - 1) {
        // 지수 백오프: 1초, 2초, 4초 대기
        const delay = 1000 * Math.pow(2, i);
        console.log(`⏳ ${delay}ms 후 재시도...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
};

// 개선된 읽음 처리 함수
const markMessagesAsRead = async (senderUsername, receiverUsername, socket) => {
  try {
    await apiRequestWithRetry(`${API}/api/messages/read`, {
      method: 'POST',
      body: JSON.stringify({
        sender_username: senderUsername,
        receiver_username: receiverUsername,
      })
    });
    
    // 소켓으로 읽음 상태 전송
    if (socket && socket.connected) {
      socket.emit("messageRead", {
        sender_username: receiverUsername,
        receiver_username: senderUsername,
      });
    }
    
  } catch (error) {
    console.error("❌ 읽음 처리 실패:", error);
    // 읽음 처리 실패는 치명적이지 않으므로 에러를 던지지 않음
  }
};

// 개선된 메시지 로드 함수
const loadMessages = async (username, targetUsername, socket, setMessages) => {
  try {
    // 읽음 처리 먼저 실행 (에러 무시)
    await markMessagesAsRead(targetUsername, username, socket);
    
    // 메시지 가져오기
    const messages = await apiRequestWithRetry(
      `${API}/api/messages?username=${encodeURIComponent(username)}&target=${encodeURIComponent(targetUsername)}`
    );
    
    const rawMessages = Array.isArray(messages) ? messages : [];
    
    // 중복 제거 후 시간순 정렬
    const uniqueMessages = removeDuplicateMessagesAdvanced(rawMessages)
      .sort((a, b) => new Date(a.time) - new Date(b.time));
    
    setMessages(uniqueMessages);
    
  } catch (error) {
    console.error("❌ 메시지 로드 실패:", error);
    setMessages([]);
    throw error;
  }
};

// 개선된 메시지 전송 함수
const sendMessage = async (messageData) => {
  try {
    const savedMessage = await apiRequestWithRetry(`${API}/api/messages`, {
      method: 'POST',
      body: JSON.stringify(messageData)
    });
    
    return savedMessage;
    
  } catch (error) {
    console.error("❌ 메시지 전송 실패:", error);
    throw error;
  }
};

// 개선된 사용자 목록 가져오기
const fetchUsers = async (setUsers, setIsLoading, setUserListError) => {
  try {
    setIsLoading(true);
    
    const users = await apiRequestWithRetry(`${API}/users`);
    
    setUsers(users || []);
    setUserListError("");
    
  } catch (error) {
    console.error("❌ 사용자 목록 로드 실패:", error);
    setUserListError(`사용자 목록을 불러오는 데 실패했습니다: ${error.message}`);
  } finally {
    setIsLoading(false);
  }
};

// 네트워크 상태 확인
const checkNetworkStatus = () => {
  if (!navigator.onLine) {
    console.warn("🔴 오프라인 상태");
    return false;
  }
  return true;
};

// 서버 상태 확인 (수정된 버전)
const checkServerHealth = async () => {
  try {
    // /health 엔드포인트 대신 기본 API 엔드포인트 사용
    const response = await fetch(`${API}/users`, {
      method: 'GET',
      timeout: 5000
    });
    return response.ok;
  } catch (error) {
    console.warn("🔴 서버 상태 확인 실패:", error.message);
    return false;
  }
};

// 연결 상태 모니터링
const monitorConnectionStatus = (callback) => {
  const checkConnection = async () => {
    const isOnline = checkNetworkStatus();
    const isServerUp = await checkServerHealth();
    
    callback({
      online: isOnline,
      serverUp: isServerUp,
      status: isOnline && isServerUp ? 'connected' : 'disconnected'
    });
  };
  
  // 초기 확인
  checkConnection();
  
  // 주기적 확인 (30초마다)
  const interval = setInterval(checkConnection, 30000);
  
  // 네트워크 상태 변경 이벤트 리스너
  window.addEventListener('online', checkConnection);
  window.addEventListener('offline', checkConnection);
  
  return () => {
    clearInterval(interval);
    window.removeEventListener('online', checkConnection);
    window.removeEventListener('offline', checkConnection);
  };
};

// 실시간 메시지 추가 시 중복 방지
const addMessageWithDeduplication = (currentMessages, newMessage) => {
  // ID 기반 체크
  const existsById = currentMessages.some(msg => msg.id === newMessage.id);
  
  if (existsById) {
    console.log('🚫 ID 기반 중복 차단:', newMessage.id);
    return currentMessages;
  }
  
  // 내용 기반 체크 (추가 보안)
  const existsByContent = currentMessages.some(msg => 
    msg.time === newMessage.time &&
    msg.content === newMessage.content &&
    msg.sender_username === newMessage.sender_username &&
    msg.receiver_username === newMessage.receiver_username
  );
  
  if (existsByContent) {
    console.log('🚫 내용 기반 중복 차단:', {
      time: newMessage.time,
      content: newMessage.content?.substring(0, 20) + '...'
    });
    return currentMessages;
  }
  
  // 중복이 아니면 추가

  return [...currentMessages, newMessage];
};

// 내보내기 (export)
export {
  corsMiddleware,
  removeDuplicateMessagesAdvanced,
  safeApiRequest,
  apiRequestWithRetry,
  markMessagesAsRead,
  loadMessages,
  sendMessage,
  fetchUsers,
  checkNetworkStatus,
  checkServerHealth,
  monitorConnectionStatus,
  addMessageWithDeduplication,
  API
};

export default corsMiddleware;