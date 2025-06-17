require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const socketHandler = require('./socket');
const userRoutes = require('./routes/user');
const messageRoutes = require('./routes/message');

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);

// 소켓 연결
socketHandler(server);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
