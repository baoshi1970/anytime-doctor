// frontend/src/components/Chat/ChatComponent.tsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext'; // To get user info for client ID

const ChatComponent: React.FC = () => {
  const [message, setMessage] = useState<string>('');
  const [receivedMessages, setReceivedMessages] = useState<string[]>([]);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const { user } = useAuth(); // Get user from AuthContext

  // Use user's ID as client_id if available, otherwise generate a random one
  // This ensures that if the same user opens multiple tabs/windows, they might have different client_ids for WebSocket
  // For a more persistent client_id across sessions for the same user, consider a stable identifier.
  const [clientId] = useState<string>(user?.id?.toString() || `guest-${Math.floor(Math.random() * 100000)}`);

  useEffect(() => {
    // Ensure WebSocket connection is only attempted if authenticated or if guest chat is allowed
    // For now, assuming it's tied to authenticated user or a generated ID
    const WS_URL = process.env.REACT_APP_WS_URL || "ws://localhost:8000/ws";
    console.log(`Attempting to connect WebSocket with Client ID: ${clientId}`);
    const ws = new WebSocket(`${WS_URL}/${clientId}`);

    ws.onopen = () => {
      console.log(`WebSocket Connected for Client ID: ${clientId}`);
      setReceivedMessages(prev => [...prev, 'System: Connected to WebSocket server!']);
    };

    ws.onmessage = (event) => {
      console.log(`Message from server for ${clientId}: `, event.data);
      setReceivedMessages(prev => [...prev, event.data]);
    };

    ws.onerror = (error) => {
      console.error(`WebSocket Error for ${clientId}: `, error);
      setReceivedMessages(prev => [...prev, 'System: WebSocket error occurred.']);
    };

    ws.onclose = (event) => {
      console.log(`WebSocket Disconnected for ${clientId}. Code: ${event.code}, Reason: ${event.reason}`);
      setReceivedMessages(prev => [...prev, `System: Disconnected from WebSocket server. (Code: ${event.code})`]);
    };

    setSocket(ws);

    // Cleanup function to close the WebSocket connection when the component unmounts or clientId changes
    return () => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
        console.log(`WebSocket closed for Client ID: ${clientId} on component unmount.`);
      }
    };
  }, [clientId]); // Re-run effect if clientId changes (e.g., user logs in/out)

  const sendMessage = () => {
    if (socket && socket.readyState === WebSocket.OPEN && message.trim() !== '') {
      socket.send(message);
      // Optimistically add sent message to log - server will broadcast it back too
      // setReceivedMessages(prev => [...prev, `Me: ${message}`]);
      setMessage(''); // Clear input after sending
    } else {
      console.log('Cannot send message. WebSocket is not connected or message is empty.');
      setReceivedMessages(prev => [...prev, 'System: Cannot send message. WebSocket not connected or message empty.']);
    }
  };

  return (
    <div className="chat-container" style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
      <h1>Real-time Chat</h1>
      <p>Your Chat ID: <strong>{clientId}</strong> {user?.email ? `(${user.email})` : '(Guest)'}</p>
      <div className="message-input" style={{ display: 'flex', marginBottom: '10px' }}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
          style={{ flexGrow: 1, padding: '10px', marginRight: '10px' }}
          disabled={!socket || socket.readyState !== WebSocket.OPEN}
        />
        <button
          onClick={sendMessage}
          disabled={!socket || socket.readyState !== WebSocket.OPEN}
          style={{ padding: '10px' }}
        >
          Send
        </button>
      </div>
      <div className="messages-log" style={{ height: '300px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px', background: '#f9f9f9' }}>
        <h2>Messages:</h2>
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {receivedMessages.map((msg, index) => (
            <li key={index} style={{ marginBottom: '5px', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>{msg}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ChatComponent;
