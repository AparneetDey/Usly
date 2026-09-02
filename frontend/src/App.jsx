import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './routes/ProtectedRoute.jsx';

import Login from './pages/Login/Login.jsx';
import Home from './pages/Home/Home.jsx';
import Calendar from './pages/Calendar/Calendar.jsx';
import Letters from './pages/Letters/Letters.jsx';
import Complaints from './pages/Complaints/Complaints.jsx';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Login Route (No Registration Route) */}
          <Route path="/login" element={<Login />} />

          {/* Protected Romantic Private Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/letters" element={<Letters />} />
            <Route path="/complaints" element={<Complaints />} />
          </Route>

          {/* Catch-all Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
