// server/server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // or http://localhost:3000 for local frontend
    methods: ['GET', 'POST']
  }
});

let users = {};

io.on('connection', (socket) => {
  console.log('🟢 A user connected:', socket.id);

  // Handle new user joining
  socket.on('join', (username) => {
    users[socket.id] = username;
    console.log(`${username} joined the chat`);
    io.emit('userList', Object.values(users));
  });

  // Handle new message
  socket.on('message', (data) => {
    console.log('💬 Message:', data);
    io.emit('message', data); // broadcast message to all clients
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('🔴 User disconnected:', socket.id);
    delete users[socket.id];
    io.emit('userList', Object.values(users));
  });
});

app.get('/', (req, res) => {
  res.send('Real-Time Chat Server is running...');
});

const PORT = 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
