// socket.js
import { Server } from "socket.io";
import pool from "./DB.js";

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    },
  });

  io.on("connection", (socket) => {
    console.log("✅ Socket 연결됨:", socket.id);

    socket.on("join", (username) => {
      socket.join(username);
      console.log(`${username} 채팅방에 입장함.`);
    });

    socket.on("message", async (msg) => {
      try {
        const result = await pool.query(
          `INSERT INTO messages (
            sender_username, receiver_username, receiver_name,
            content, fileurl, file_name, file_size, time, read
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), false) RETURNING id`,
          [
            msg.sender_username,
            msg.receiver_username,
            msg.receiver_name,
            msg.content,
            msg.file_url || null,
            msg.file_name || null,
            msg.file_size || 0
          ]
        );

        msg.id = result.rows[0].id;
        msg.read = false;

        io.to(msg.receiver_username).emit("message", msg);
        console.log("📤 메시지 전송됨:", msg);
      } catch (err) {
        console.error("❌ 메시지 저장 오류:", err);
      }
    });

    socket.on("markAsRead", async ({ messageId }) => {
      try {
        await pool.query(`UPDATE messages SET read = true WHERE id = $1`, [messageId]);
        console.log("✅ 읽음 처리 완료:", messageId);
      } catch (err) {
        console.error("❌ 읽음 처리 실패:", err);
      }
    });

    socket.on("messageRead", ({ messageId, readBy, to }) => {
      io.to(to).emit("messageRead", { messageId, readBy });
      console.log(`📬 읽음 알림 전송 → ${to}`);
    });
  });

  return io;
};

const onlineUsers = new Set();

io.on("connection", (socket) => {
  socket.on("sendMessage", (msg) => {
    socket.broadcast.emit("message", msg);
  });
  
  socket.on("online", (username) => {
    onlineUsers.add(username);
    io.emit("onlineUsers", Array.from(onlineUsers)); // 전체에 브로드캐스트
  });

  socket.on("disconnect", () => {
    for (let user of onlineUsers) {
      // 단순하게 모든 연결 해제 시 제거
      if (socket.rooms.has(user)) {
        onlineUsers.delete(user);
        break;
      }
    }
    io.emit("onlineUsers", Array.from(onlineUsers));
  });
});

export default initializeSocket;
