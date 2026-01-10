import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// Create Context - this will be available to all components
export const AuthContext = createContext();

// AuthProvider component - wraps entire app to provide auth state
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Current logged-in user
  const [loading, setLoading] = useState(true); // Loading state for initial check
  const [token, setToken] = useState(localStorage.getItem('token')); // JWT token

  // Check if user is already logged in on app load
  useEffect(() => {
    const checkAuth = async () => {
      const savedToken = localStorage.getItem('token');
      
      if (!savedToken) {
        setLoading(false);
        return;
      }

      try {
        // Verify token by calling /me endpoint
        const response = await axios.get('http://localhost:7000/api/auth/me', {
          headers: { Authorization: `Bearer ${savedToken}` },
          timeout: 5000 // 5 second timeout
        });
        
        console.log('✅ Token valid, user logged in:', response.data.user.name);
        setUser(response.data.user); // Set user data
        setToken(savedToken);
      } catch (error) {
        console.error('Auth check error:', error.response?.status, error.message);
        
        // Only clear token if it's actually an auth error (401)
        if (error.response?.status === 401) {
          console.log('❌ Token invalid (401), clearing...');
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        } else {
          // Network error or timeout - DON'T clear token yet
          // Try to load user anyway (offline mode)
          console.log('⚠️ Network error, attempting to continue with saved token');
          setToken(savedToken);
          // Don't set user yet, wait for connection
        }
      } finally {
        setLoading(false); // Always stop loading
      }
    };

    checkAuth();
  }, []);

  // REGISTER function - create new account
  const register = async (name, email, password) => {
    try {
      const response = await axios.post('http://localhost:7000/api/auth/register', {
        name,
        email,
        password
      });

      const { user, token } = response.data;
      
      // Save token to localStorage (persists across page refreshes)
      localStorage.setItem('token', token);
      
      setUser(user);
      setToken(token);
      
      return { success: true, message: response.data.message };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        message: error.response?.data?.error || error.message || 'Registration failed. Please check if backend is running.' 
      };
    }
  };

  // LOGIN function - authenticate existing user
  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:7000/api/auth/login', {
        email,
        password
      });

      const { user, token } = response.data;
      
      console.log('🔐 Login successful, saving token...');
      console.log('Token length:', token?.length);
      console.log('User:', user?.name);
      
      localStorage.setItem('token', token);
      
      setUser(user);
      setToken(token);
      
      console.log('✅ Token saved to localStorage');
      
      return { success: true, message: response.data.message };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: error.response?.data?.error || error.message || 'Login failed. Please check if backend is running.' 
      };
    }
  };

  // LOGOUT function - clear user session
  const logout = () => {
    console.log('👋 Logging out, clearing token...');
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
  };

  // Provide these values to all child components
  const value = {
    user,        // Current user object
    token,       // JWT token
    loading,     // Is initial auth check happening?
    register,    // Function to register
    login,       // Function to login
    logout,      // Function to logout
    isAuthenticated: !!user  // Boolean: is user logged in?
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
