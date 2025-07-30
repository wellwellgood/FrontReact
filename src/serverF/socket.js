// socket.js
import { Server } from "socket.io";
import pool from "./DB.mjs";

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: [
      "https://kkydashboard.netlify.app",
      "http://localhost:10000"// ✅ 실제 프론트 배포 주소
      ],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  const onlineUsers = new Set();

  io.on("connection", (socket) => {
    // console.log("✅ Socket 연결됨:", socket.id);

    // ✅ 유저별 방 입장
    socket.on("join", (username) => {
      socket.join(username);
      console.log(`${username} 방에 입장`);
    });

    // ✅ 메시지 전송 처리 (클라이언트에서 emit: sendMessage)
    socket.on("chatMessage", async (msg) => {
      try {
        const result = await pool.query(
          `INSERT INTO messages 
            (sender_username, receiver_username, content, file_url, file_name, file_size, read) 
          VALUES ($1, $2, $3, $4, $5, $6, false) 
          RETURNING id`,
          [
            msg.sender_username,
            msg.receiver_username,
            msg.content,
            msg.file_url || null,
            msg.file_name || null,
            msg.file_size || null,
          ]
        );
    
        msg.id = result.rows[0].id;
        msg.read = false;
    
        // ✅ 수신자에게 실시간 메시지 전달
        io.to(msg.receiver_username).emit("message", msg);
        console.log("📤 메시지 저장 및 전송:", msg);
    
      } catch (err) {
        console.error("❌ 메시지 저장 오류:", err);
      }
    });

    // ✅ 읽음 처리 (서버 → 상대 유저에게 전달)
    socket.on("messageRead", async ({ sender_username, receiver_username }) => {
      const unreadResult = await pool.query(
        `SELECT id FROM messages WHERE sender_username = $1 AND receiver_username = $2 AND read = false`,
        [sender_username, receiver_username]
      );
    
      const unreadMessages = unreadResult.rows;
    
      if (unreadMessages.length === 0) return;
    
      await pool.query(
        `UPDATE messages SET read = true WHERE sender_username = $1 AND receiver_username = $2`,
        [sender_username, receiver_username]
      );
    
      unreadMessages.forEach(({ id }) => {
        io.to(receiver_username).emit("messageRead", { messageId: id });
      });
    });

    socket.on("enterChat", async ({ myUsername, withUser }) => {
      const unreadMessages = await pool.query(
        `SELECT id FROM messages WHERE sender_username = $1 AND receiver_username = $2 AND read = false`,
        [withUser, myUsername]
      );
    
      if (unreadMessages.rows.length > 0) {
        await pool.query(
          `UPDATE messages SET read = true WHERE sender_username = $1 AND receiver_username = $2`,
          [withUser, myUsername]
        );
    
        unreadMessages.rows.forEach(({ id }) => {
          io.to(withUser).emit("messageRead", { messageId: id });
        });
      }
    });
    

    // ✅ DB에서도 읽음 업데이트 처리
    socket.on("markAsRead", async ({ messageId }) => {
      try {
        await pool.query(`UPDATE messages SET read = true WHERE id = $1`, [messageId]);
        console.log("✅ 읽음 처리 완료:", messageId);
      } catch (err) {
        console.error("❌ 읽음 처리 실패:", err);
      }
    });

    // ✅ 온라인 유저 추적
    socket.on("online", (username) => {
      onlineUsers.add(username);
      socket.join(username); // 혹시 빠졌을 경우 대비
      io.emit("onlineUsers", Array.from(onlineUsers));
      console.log("🟢 온라인:", username);
    });

    // ✅ 연결 종료 시 온라인 목록 갱신
    socket.on("disconnect", () => {
      for (let user of socket.rooms) {
        if (onlineUsers.has(user)) {
          onlineUsers.delete(user);
          break;
        }
      }
      io.emit("onlineUsers", Array.from(onlineUsers));
      console.log("🔴 연결 종료:", socket.id);
    });
  });

  return io;
};

export default initializeSocket;
