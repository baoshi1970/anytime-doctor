import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import './App.css';
import './pages/AuthPage.css'; // Import common auth styles
import { useAuth } from './contexts/AuthContext';

// Page Components
import HomePage from './pages/HomePage'; // Placeholder for HomePage
import LoginPage from './pages/LoginPage';
import RegisterPatientPage from './pages/RegisterPatientPage';
import RegisterProfessionalPage from './pages/RegisterProfessionalPage'; // To be created
// import DashboardPage from './pages/DashboardPage'; // Placeholder

// WebSocket Chat (can be moved to its own component/page later)
import ChatComponent from './components/Chat/ChatComponent'; // To be created

function App() {
  const { isAuthenticated, user, logout, isLoading } = useAuth();

  if (isLoading && !user) { // Only show loading on initial auth check
    return <div className="App-loading">Loading application...</div>;
  }

  return (
    <Router>
      <div className="App">
        <nav className="App-nav">
          <ul>
            <li><Link to="/">Home</Link></li>
            {isAuthenticated ? (
              <>
                {user?.role === 'patient' && <li><Link to="/dashboard/patient">Patient Dashboard</Link></li>}
                {user?.role === 'healthcare_professional' && <li><Link to="/dashboard/professional">Professional Dashboard</Link></li>}
                <li><Link to="/chat">Chat</Link></li>
                <li><button onClick={logout} className="logout-button">Logout ({user?.email})</button></li>
              </>
            ) : (
              <>
                <li><Link to="/login">Login</Link></li>
                <li><Link to="/register-patient">Register as Patient</Link></li>
                <li><Link to="/register-professional">Register as Professional</Link></li>
              </>
            )}
          </ul>
        </nav>

        <main className="App-main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />} />
            <Route path="/register-patient" element={isAuthenticated ? <Navigate to="/dashboard" /> : <RegisterPatientPage />} />
            <Route path="/register-professional" element={isAuthenticated ? <Navigate to="/dashboard" /> : <RegisterProfessionalPage />} />

            {/* Protected Routes Example */}
            <Route path="/dashboard" element={isAuthenticated ? <DashboardRedirect /> : <Navigate to="/login" />} />
            <Route path="/dashboard/patient" element={isAuthenticated && user?.role === 'patient' ? <PatientDashboard /> : <Navigate to="/login" />} />
            <Route path="/dashboard/professional" element={isAuthenticated && user?.role === 'healthcare_professional' ? <ProfessionalDashboard /> : <Navigate to="/login" />} />

            <Route path="/chat" element={isAuthenticated ? <ChatComponent /> : <Navigate to="/login" />} />

            {/* Add more routes as needed */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

// Placeholder components - these should be moved to their own files in pages/
const HomePageContent: React.FC = () => <h2>Welcome to the Application!</h2>;
const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  return <h2>Patient Dashboard - Welcome {user?.full_name || user?.email}!</h2>;
};
const ProfessionalDashboard: React.FC = () => {
  const { user } = useAuth();
  return <h2>Professional Dashboard - Welcome {user?.full_name || user?.email}!</h2>;
};
const NotFoundPage: React.FC = () => <h2>404 - Page Not Found</h2>;

// Helper component to redirect from /dashboard to role-specific dashboard
const DashboardRedirect: React.FC = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (user.role === 'patient') return <Navigate to="/dashboard/patient" />;
  if (user.role === 'healthcare_professional') return <Navigate to="/dashboard/professional" />;
  // Fallback or admin dashboard
  return <Navigate to="/" />;
};


// Create dummy HomePage, LoginPage, ChatComponent for now to avoid import errors
const HomePage = () => <HomePageContent />;

// Dummy LoginPage - will be properly implemented in its step
const LoginPage = () => {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const { login, isLoading, error } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login(email, password);
            navigate('/dashboard'); // Redirect on successful login
        } catch (err) {
            // Error is handled by AuthContext and displayed via `error`
            console.error("Login failed on page:", err);
        }
    };
    return (
        <div className="auth-page-container">
            <form onSubmit={handleSubmit} className="auth-form">
                <h2>Login</h2>
                {error && <p className="error-message">{error}</p>}
                <div className="form-group">
                    <label htmlFor="email">Email:</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password:</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                </div>
                <button type="submit" disabled={isLoading} className="submit-button">{isLoading ? 'Logging in...' : 'Login'}</button>
                <p>Don't have an account? <Link to="/register-patient">Register as Patient</Link></p>
            </form>
        </div>
    );
};

// Dummy ChatComponent - will be properly implemented later
const ChatComponent = () => {
  const [message, setMessage] = React.useState<string>('');
  const [receivedMessages, setReceivedMessages] = React.useState<string[]>([]);
  const [socket, setSocket] = React.useState<WebSocket | null>(null);
  const { user } = useAuth(); // Get user from AuthContext
  const clientId = user?.id || Math.floor(Math.random() * 1000); // Use user ID or random if not available

  React.useEffect(() => {
    const WS_URL = process.env.REACT_APP_WS_URL || "ws://localhost:8000/ws";
    const ws = new WebSocket(`${WS_URL}/${clientId}`);

    ws.onopen = () => {
      console.log('WebSocket Connected');
      setReceivedMessages(prev => [...prev, 'Connected to WebSocket server!']);
    };
    ws.onmessage = (event) => {
      console.log('Message from server: ', event.data);
      setReceivedMessages(prev => [...prev, event.data]);
    };
    ws.onerror = (error) => console.error('WebSocket Error: ', error);
    ws.onclose = () => {
        console.log('WebSocket Disconnected');
        setReceivedMessages(prev => [...prev, 'Disconnected from WebSocket server.']);
    };
    setSocket(ws);
    return () => {
      if (ws.readyState === WebSocket.OPEN) ws.close();
    };
  }, [clientId]);

  const sendMessage = () => {
    if (socket && socket.readyState === WebSocket.OPEN && message.trim() !== '') {
      socket.send(message);
      setMessage('');
    }
  };
    return (
        <div className="chat-container">
            <h1>Real-time Chat</h1>
            <p>Your Client ID: {clientId}</p>
            <div className="message-input">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message..."
                />
                <button onClick={sendMessage}>Send</button>
            </div>
            <div className="messages-log">
                <h2>Messages:</h2>
                <ul>
                    {receivedMessages.map((msg, index) => <li key={index}>{msg}</li>)}
                </ul>
            </div>
        </div>
    );
};


export default App;
