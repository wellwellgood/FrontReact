const { Server } = require("socket.io");
const pool = require("./DB"); // PostgreSQL Pool

module.exports = (server) => {
  const io = new Server(server, {
    cors: {
      origin: [
        "http://localhost:3000",
        "http://localhost:4000",
        "https://myappboard.netlify.app"
      ],
      methods: ["GET", "POST"],
      credentials: true
    },
  });

  io.on("connection", (socket) => {
    console.log("📡 Client connected", socket.id);

    // ✅ 사용자 소켓 join 처리
    socket.on("join", (username) => {
      socket.join(username);
      console.log(`👤 ${username} joined their personal room`);
    });

    // ✅ 메시지 수신 및 저장 + id 반환
    socket.on("message", async (msg) => {
      console.log("💬 message received:", msg);

      try {
        const client = await pool.connect();
        const result = await client.query(
          `INSERT INTO messages 
            (sender_username, receiver_username, sender_name, receiver_name, content, time, read) 
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING id`,
          [
            msg.sender_username,
            msg.receiver_username,
            msg.sender_name,
            msg.receiver_name,
            msg.content,
            msg.time,
            msg.read ?? false
          ]
        );
        client.release();

        const insertedId = result.rows[0].id;
        msg.id = insertedId; // ✅ ID 추가해서 다시 클라이언트에게 전송
      } catch (err) {
        console.error("❌ 메시지 저장 실패:", err);
      }

      io.emit("message", msg); // ✅ 전체 클라이언트에게 전송
    });

    // ✅ 메시지 읽음 처리
    socket.on("markAsRead", async ({ messageId, readBy }) => {
      try {
        const client = await pool.connect();
        await client.query(
          `UPDATE messages SET read = TRUE WHERE id = $1`,
          [messageId]
        );
        client.release();
      } catch (err) {
        console.error("❌ 메시지 읽음 상태 업데이트 실패:", err);
      }
    });

    // ✅ 읽음 확인 알림 (to 유저 방으로 전송)
    socket.on("messageRead", ({ messageId, readBy, to }) => {
      io.to(to).emit("messageRead", { messageId, readBy });
      console.log(`📨 messageRead → ${to}:`, messageId);
    });

    socket.on("disconnect", () => {
      console.log("❌ Client disconnected", socket.id);
    });
  });
};
