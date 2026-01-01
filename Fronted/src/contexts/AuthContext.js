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
      
      if (savedToken) {
        try {
          // Verify token by calling /me endpoint
          const response = await axios.get('http://localhost:7000/api/auth/me', {
            headers: { Authorization: `Bearer ${savedToken}` }
          });
          
          setUser(response.data.user); // Set user data
          setToken(savedToken);
        } catch (error) {
          // Token invalid or expired, clear it
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      
      setLoading(false); // Done checking
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
      return { 
        success: false, 
        message: error.response?.data?.error || 'Registration failed' 
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
      
      localStorage.setItem('token', token);
      
      setUser(user);
      setToken(token);
      
      return { success: true, message: response.data.message };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.error || 'Login failed' 
      };
    }
  };

  // LOGOUT function - clear user session
  const logout = () => {
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
