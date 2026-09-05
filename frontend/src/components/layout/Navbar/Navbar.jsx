import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  HomeIcon,
  CalendarIcon,
  MailIcon,
  ComplaintIcon,
  ImageIcon,
  UserIcon,
  LogOutIcon,
  MenuIcon,
  CloseIcon,
  BellIcon,
} from '../../icons/index.js';
import { useAuth } from '../../../context/AuthContext.jsx';
import { useNotifications } from '../../../context/NotificationContext.jsx';
import NotificationCenter from '../../notifications/NotificationCenter.jsx';
import Button from '../../ui/Button/Button.jsx';
import styles from './Navbar.module.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Home', path: '/', icon: HomeIcon },
    { label: 'Calendar', path: '/calendar', icon: CalendarIcon },
    { label: 'Letters', path: '/letters', icon: MailIcon },
    { label: 'Complaints', path: '/complaints', icon: ComplaintIcon },
    { label: 'Memories', path: '#', icon: ImageIcon, badge: 'Soon' },
  ];

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  return (
    <header className={styles.navbar}>
      <div className={styles.inner}>
        <Link to="/" className={styles.brand}>
          <img src="/usly-logo.png" alt="Usly Logo" className={styles.logoImg} />
        </Link>

        <nav>
          <ul className={styles.navLinks}>
            {navItems.map((item) => {
              const IconComp = item.icon;
              if (item.badge) {
                return (
                  <li key={item.label}>
                    <span className={`${styles.navLink} ${styles.disabledNavLink}`}>
                      <IconComp size={16} />
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
                    <IconComp size={16} />
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className={styles.userMenu}>
          {/* Notification Bell Button with Unread Badge & Dropdown */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2 text-muted hover:text-primary transition-colors relative rounded-full hover:bg-surface-alt flex items-center justify-center"
              title="Notifications"
              aria-label="Notifications"
            >
              <BellIcon size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-accent text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border-2 border-surface shadow-sm animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            <NotificationCenter
              isOpen={notificationsOpen}
              onClose={() => setNotificationsOpen(false)}
            />
          </div>

          {user && (
            <Link to="/settings" className={`${styles.userInfo} hover:opacity-90 transition-opacity`} title="Account Settings">
              <div className={styles.avatar}>
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className={styles.avatarImg} />
                ) : (
                  getInitials(user.name)
                )}
              </div>
              <span className={styles.userName}>{user.name}</span>
            </Link>
          )}

          <Button variant="ghost" size="sm" onClick={handleLogout} title="Logout">
            <LogOutIcon size={16} />
            <span className="hidden md:inline">Logout</span>
          </Button>

          <button
            className={`${styles.mobileMenuBtn} ${mobileOpen ? styles.mobileMenuBtnActive : ''}`}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <CloseIcon size={22} /> : <MenuIcon size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className={`${styles.mobileNav} ${styles.mobileNavOpen}`}>
          {navItems.map((item) => {
            const IconComp = item.icon;
            if (item.badge) {
              return (
                <span
                  key={item.label}
                  className={`${styles.navLink} ${styles.disabledNavLink} py-3`}
                >
                  <IconComp size={18} />
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
                <IconComp size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}

          <NavLink
            to="/settings"
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.activeNavLink : ''} py-3 border-t border-border mt-2 pt-3`
            }
          >
            <UserIcon size={18} />
            <span>Account Settings</span>
          </NavLink>
        </div>
      )}
    </header>
  );
};

export default Navbar;
