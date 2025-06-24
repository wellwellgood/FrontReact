const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    },
  });

  const onlineUsers = new Set();

  io.on("connection", (socket) => {
    console.log("✅ Socket 연결됨:", socket.id);

    socket.on("join", (username) => {
      socket.join(username);
      console.log(`${username} 채팅방에 입장함.`);
    });

    socket.on("message", async (msg) => {
      try {
        const result = await pool.query(
          `INSERT INTO messages (...) VALUES (...) RETURNING id`,
          [/* values */]
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

    // ✅ 추가된 부분: 온라인 감지
    socket.on("online", (username) => {
      onlineUsers.add(username);
      io.emit("onlineUsers", Array.from(onlineUsers));
    });

    // ✅ 연결 종료 시 처리
    socket.on("disconnect", () => {
      for (let user of onlineUsers) {
        if (socket.rooms.has(user)) {
          onlineUsers.delete(user);
          break;
        }
      }
      io.emit("onlineUsers", Array.from(onlineUsers));
    });
  });

  return io;
};
