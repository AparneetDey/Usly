import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/auth.service.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPartner = async () => {
    try {
      const partnerData = await authService.getPartnerDetails();
      setPartner(partnerData);
    } catch {
      setPartner(null);
    }
  };

  /**
   * Restores user session on initial app mount by validating stored JWT via GET /api/auth/me
   */
  const checkAuth = async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      setUser(null);
      setPartner(null);
      setLoading(false);
      return;
    }

    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);
      await fetchPartner();
    } catch {
      // Token is invalid or expired
      localStorage.removeItem('token');
      setUser(null);
      setPartner(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    const loggedInUser = data.user || data;
    setUser(loggedInUser);
    await fetchPartner();
    return loggedInUser;
  };

  const updateUser = (updatedUserData) => {
    setUser((prev) => ({
      ...prev,
      ...updatedUserData,
    }));
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      setPartner(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        partner,
        loading,
        login,
        logout,
        updateUser,
        isAuthenticated: !!user,
        refreshUser: checkAuth,
        fetchPartner,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
