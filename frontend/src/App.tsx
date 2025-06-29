import React, { useEffect, useState } from 'react';
import './App.css';

const WS_URL = "ws://localhost:8000/ws"; // Assuming backend runs on port 8000

function App() {
  const [message, setMessage] = useState<string>('');
  const [receivedMessages, setReceivedMessages] = useState<string[]>([]);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [clientId] = useState<number>(Math.floor(Math.random() * 1000)); // Simple client ID

  useEffect(() => {
    const ws = new WebSocket(`${WS_URL}/${clientId}`);

    ws.onopen = () => {
      console.log('WebSocket Connected');
      setReceivedMessages(prev => [...prev, 'Connected to WebSocket server!']);
    };

    ws.onmessage = (event) => {
      console.log('Message from server: ', event.data);
      setReceivedMessages(prev => [...prev, event.data]);
    };

    ws.onerror = (error) => {
      console.error('WebSocket Error: ', error);
      setReceivedMessages(prev => [...prev, 'WebSocket error occurred.']);
    };

    ws.onclose = () => {
      console.log('WebSocket Disconnected');
      setReceivedMessages(prev => [...prev, 'Disconnected from WebSocket server.']);
      // Optionally, try to reconnect
    };

    setSocket(ws);

    // Cleanup function to close the WebSocket connection when the component unmounts
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [clientId]);

  const sendMessage = () => {
    if (socket && socket.readyState === WebSocket.OPEN && message.trim() !== '') {
      socket.send(message);
      setMessage(''); // Clear input after sending
    } else {
      console.log('WebSocket is not connected or message is empty.');
      setReceivedMessages(prev => [...prev, 'Cannot send message. WebSocket not connected or message empty.']);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Real-time Chat App</h1>
        <div>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
          />
          <button onClick={sendMessage}>Send</button>
        </div>
        <div className="messages">
          <h2>Messages:</h2>
          <ul>
            {receivedMessages.map((msg, index) => (
              <li key={index}>{msg}</li>
            ))}
          </ul>
        </div>
      </header>
    </div>
  );
}

export default App;
