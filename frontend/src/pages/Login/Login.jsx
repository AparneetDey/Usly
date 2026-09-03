import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartIcon, WarningIcon } from '../../components/icons/index.js';
import { useAuth } from '../../context/AuthContext.jsx';
import Button from '../../components/ui/Button/Button.jsx';
import Input from '../../components/ui/Input/Input.jsx';
import Loader from '../../components/ui/Loader/Loader.jsx';
import styles from './Login.module.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [loading, isAuthenticated, navigate]);

  if (loading) {
    return <Loader fullScreen message="Unlocking your romantic space..." />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.box}>
        <div className={styles.logo}>
          <img src="/usly-logo.png" alt="Usly Logo" className="h-12 w-auto mx-auto mb-2" />
        </div>
        <h1 className={styles.title}>Usly</h1>
        <p className={styles.subtitle}>Welcome back to our private corner</p>

        {error && (
          <div className={styles.alert}>
            <WarningIcon size={18} className="text-highlight shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            label="Email Address"
            type="email"
            placeholder="your.email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button type="submit" variant="primary" fullWidth loading={submitting}>
            <span>Log In</span>
            <HeartIcon size={16} filled className="ml-1" />
          </Button>
        </form>

        <p className={styles.footerNote}>Private romantic space for two</p>
      </div>
    </div>
  );
};

export default Login;
