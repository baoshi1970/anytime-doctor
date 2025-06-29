// frontend/src/pages/LoginPage.tsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
// import './AuthPage.css'; // Already imported in App.tsx or import here if preferred

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, isLoading, error: authError, clearError } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        clearError(); // Clear previous auth errors
        try {
            await login(email, password);
            navigate('/dashboard'); // Redirect to a dashboard or home page after login
        } catch (err: any) {
            // Error is already set in AuthContext by the login function
            console.error("Login failed on page:", err.message);
        }
    };

    return (
        <div className="auth-page-container">
            <form onSubmit={handleSubmit} className="auth-form">
                <h2>Login</h2>
                {authError && <p className="error-message">{authError}</p>}
                <div className="form-group">
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" disabled={isLoading} className="submit-button">
                    {isLoading ? 'Logging in...' : 'Login'}
                </button>
                <p style={{ textAlign: 'center', marginTop: '1rem' }}>
                    Don't have an account? <Link to="/register-patient">Register as Patient</Link>
                </p>
                 <p style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                    {/* <Link to="/forgot-password">Forgot Password?</Link> */}
                </p>
            </form>
        </div>
    );
};

export default LoginPage;
