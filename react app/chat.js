import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000'); // connect to backend

const Chat = () => {
  const [username, setUsername] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Listen for incoming messages
    socket.on('message', (data) => {
      setMessages((prev) => [...prev, data]);
    });

    // Listen for user list updates
    socket.on('userList', (userList) => {
      setUsers(userList);
    });

    // Cleanup on unmount
    return () => {
      socket.off('message');
      socket.off('userList');
    };
  }, []);

  const joinChat = () => {
    if (username.trim()) {
      socket.emit('join', username);
      setIsJoined(true);
    }
  };

  const sendMessage = () => {
    if (message.trim()) {
      const msgData = { username, text: message, time: new Date().toLocaleTimeString() };
      socket.emit('message', msgData);
      setMessage('');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      {!isJoined ? (
        <div>
          <h2>👋 Join the Chat</h2>
          <input
            type="text"
            placeholder="Enter your name..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button onClick={joinChat}>Join</button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '20px' }}>
          {/* Chat area */}
          <div style={{ flex: 2 }}>
            <h2>💬 Chat Room</h2>
            <div
              style={{
                height: 300,
                border: '1px solid #ccc',
                padding: 10,
                overflowY: 'auto',
              }}
            >
              {messages.map((msg, index) => (
                <div key={index}>
                  <strong>{msg.username}</strong>: {msg.text} <em>({msg.time})</em>
                </div>
              ))}
            </div>
            <div>
              <input
                type="text"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              />
              <button onClick={sendMessage}>Send</button>
            </div>
          </div>

          {/* Online users */}
          <div style={{ flex: 1 }}>
            <h3>🟢 Online Users</h3>
            <ul>
              {users.map((user, index) => (
                <li key={index}>{user}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
