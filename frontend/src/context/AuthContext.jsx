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

  const checkAuth = async () => {
    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);

      // Fetch partner details
      await fetchPartner();
    } catch {
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
    setUser(data.user);
    await fetchPartner();
    return data.user;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setPartner(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        partner,
        loading,
        login,
        logout,
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
