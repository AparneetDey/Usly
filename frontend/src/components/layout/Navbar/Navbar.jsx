import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Heart, Calendar, Mail, AlertCircle, Image, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext.jsx';
import Button from '../../ui/Button/Button.jsx';
import styles from './Navbar.module.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Home', path: '/', icon: Heart },
    { label: 'Calendar', path: '/calendar', icon: Calendar },
    { label: 'Letters', path: '/letters', icon: Mail },
    { label: 'Complaints', path: '/complaints', icon: AlertCircle },
    { label: 'Memories', path: '#', icon: Image, badge: 'Soon' },
  ];

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  return (
    <header className={styles.navbar}>
      <div className={styles.inner}>
        <Link to="/" className={styles.brand}>
          <span className={styles.brandIcon}>❤️</span>
          <span>Usly</span>
        </Link>

        <nav>
          <ul className={styles.navLinks}>
            {navItems.map((item) => {
              const Icon = item.icon;
              if (item.badge) {
                return (
                  <li key={item.label}>
                    <span className={`${styles.navLink} ${styles.disabledNavLink}`}>
                      <Icon size={16} />
                      <span>{item.label}</span>
                      <span className="text-[10px] bg-accent/30 text-primary px-1.5 py-0.5 rounded-full font-bold">
                        {item.badge}
                      </span>
                    </span>
                  </li>
                );
              }
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `${styles.navLink} ${isActive ? styles.activeNavLink : ''}`
                    }
                  >
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className={styles.userMenu}>
          {user && (
            <div className={styles.userInfo}>
              <div className={styles.avatar}>
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className={styles.avatarImg} />
                ) : (
                  getInitials(user.name)
                )}
              </div>
              <span className={styles.userName}>{user.name}</span>
            </div>
          )}

          <Button variant="ghost" size="sm" onClick={handleLogout} title="Logout">
            <LogOut size={16} />
            <span className="hidden md:inline">Logout</span>
          </Button>

          <button
            className={styles.mobileMenuBtn}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className={`${styles.mobileNav} ${styles.mobileNavOpen}`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            if (item.badge) {
              return (
                <span
                  key={item.label}
                  className={`${styles.navLink} ${styles.disabledNavLink} py-3`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                  <span className="text-[10px] bg-accent/30 text-primary px-1.5 py-0.5 rounded-full font-bold ml-auto">
                    {item.badge}
                  </span>
                </span>
              );
            }
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `${styles.navLink} ${isActive ? styles.activeNavLink : ''} py-3`
                }
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      )}
    </header>
  );
};

export default Navbar;
