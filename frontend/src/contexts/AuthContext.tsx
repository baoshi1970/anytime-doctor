// frontend/src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, TokenResponse, AuthContextType } from '../types/auth';
import { API_BASE_URL, AUTH_ENDPOINTS, USER_ENDPOINTS } from '../services/apiConstants';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('authToken'));
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem('authToken'));
  const [isLoading, setIsLoading] = useState<boolean>(false); // For loading states during API calls
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  // Effect to fetch user details if token exists on initial load
  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        setIsLoading(true);
        try {
          const response = await fetch(USER_ENDPOINTS.ME, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          if (response.ok) {
            const userData: User = await response.json();
            setUser(userData);
            setIsAuthenticated(true);
          } else {
            // Token might be invalid or expired
            logout(); // Clear invalid token and user state
            setError('Session expired. Please log in again.');
          }
        } catch (err) {
          console.error("Failed to fetch user", err);
          logout(); // Clear token if fetch fails
          setError('Failed to verify session. Please log in again.');
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false); // No token, no user to fetch
      }
    };
    fetchUser();
  }, [token]);


  const login = async (email_: string, password_: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(AUTH_ENDPOINTS.LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ username: email_, password: password_ }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Login failed. Invalid credentials or server error.' }));
        throw new Error(errorData.detail || 'Login failed');
      }

      const data: TokenResponse = await response.json();
      localStorage.setItem('authToken', data.access_token);
      setToken(data.access_token);
      setIsAuthenticated(true);

      // Fetch user details after successful login
      const userResponse = await fetch(USER_ENDPOINTS.ME, {
        headers: { 'Authorization': `Bearer ${data.access_token}` },
      });
      if (userResponse.ok) {
        const userData: User = await userResponse.json();
        setUser(userData);
      } else {
        throw new Error('Failed to fetch user details after login.');
      }

    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || 'An unexpected error occurred during login.');
      setIsAuthenticated(false);
      setUser(null);
      setToken(null);
      localStorage.removeItem('authToken');
    } finally {
      setIsLoading(false);
    }
  };

  const registerPatient = async (userData: any) => { // Replace 'any' with specific patient registration data type
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(AUTH_ENDPOINTS.REGISTER_PATIENT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Registration failed.' }));
        throw new Error(errorData.detail || 'Patient registration failed');
      }
      const registeredUser: User = await response.json();
      // Optionally log in the user directly after registration
      // await login(userData.email, userData.password);
      return registeredUser;
    } catch (err: any) {
      console.error("Patient registration error:", err);
      setError(err.message || 'An unexpected error occurred during patient registration.');
      throw err; // Re-throw to allow component to handle it
    } finally {
      setIsLoading(false);
    }
  };

  const registerProfessional = async (userData: any) => { // Replace 'any' with specific professional registration data type
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(AUTH_ENDPOINTS.REGISTER_PROFESSIONAL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Registration failed.' }));
        throw new Error(errorData.detail || 'Professional registration failed');
      }
      const registeredUser: User = await response.json();
      // Optionally log in the user directly after registration
      return registeredUser;
    } catch (err: any) {
      console.error("Professional registration error:", err);
      setError(err.message || 'An unexpected error occurred during professional registration.');
      throw err; // Re-throw
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
    // Optionally: redirect to login page or notify backend about logout
    // window.location.href = '/login'; // Or use react-router for navigation
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, token, login, logout, registerPatient, registerProfessional, isLoading, error, clearError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
