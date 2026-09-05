import React, { useState, useRef, useEffect } from 'react';
import {
  UserIcon,
  MailIcon,
  LockIcon,
  ImageIcon,
  TrashIcon,
  CheckIcon,
  BellIcon,
} from '../../components/icons/index.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNotifications } from '../../context/NotificationContext.jsx';
import PageContainer from '../../components/layout/PageContainer/PageContainer.jsx';
import Input from '../../components/ui/Input/Input.jsx';
import Button from '../../components/ui/Button/Button.jsx';
import Toast from '../../components/ui/Toast/Toast.jsx';
import { Skeleton } from '../../components/ui/Skeleton/index.js';
import authService from '../../services/auth.service.js';
import uploadToImageKit from '../../services/imagekit.service.js';
import styles from './Settings.module.css';

const Settings = () => {
  const { user, updateUser, loading: authLoading } = useAuth();
  const {
    pushSupported,
    pushPermission,
    pushSubscribed,
    requestAndEnablePush,
    disablePush,
  } = useNotifications();
  const fileInputRef = useRef(null);

  // Profile section state
  const [name, setName] = useState(user?.name || '');
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [togglingPush, setTogglingPush] = useState(false);

  // Sync state when user loads
  useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
  }, [user]);

  // Push notification toggle handler
  const handleTogglePush = async () => {
    setTogglingPush(true);
    try {
      if (pushSubscribed) {
        await disablePush();
        showToast('Web Push notifications disabled for this device.');
      } else {
        await requestAndEnablePush();
        showToast('Web Push notifications enabled successfully! 🔔');
      }
    } catch (err) {
      showToast(err.message || 'Failed to update push notification settings', 'error');
    } finally {
      setTogglingPush(false);
    }
  };

  // Email change section state
  const [newEmail, setNewEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [sendingEmailRequest, setSendingEmailRequest] = useState(false);

  // Password change section state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Global toast state
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const showToast = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
  };

  // 1. Profile Update Handler (Name only or Name + Avatar)
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Name cannot be empty.', 'error');
      return;
    }

    setUpdatingProfile(true);
    try {
      const updated = await authService.updateProfile({ name: name.trim() });
      updateUser(updated);
      showToast('Profile updated successfully!');
    } catch (err) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setUpdatingProfile(false);
    }
  };

  // 2. Avatar Upload Handler (Direct ImageKit upload)
  const handleAvatarFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file.', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image file size must be less than 5MB.', 'error');
      return;
    }

    setUploadingAvatar(true);
    try {
      const result = await uploadToImageKit({
        file,
        fileName: `avatar_${user?._id}_${Date.now()}`,
        folder: 'Home/Usly-Media/avatars',
      });

      const updated = await authService.updateProfile({
        name: name.trim() || user.name,
        avatar: result.url,
        avatarFileId: result.fileId,
      });

      updateUser(updated);
      showToast('New avatar uploaded successfully!');
    } catch (err) {
      showToast(err.message || 'Failed to upload avatar', 'error');
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // 3. Avatar Remove Handler
  const handleRemoveAvatar = async () => {
    if (!user?.avatar) return;

    setUploadingAvatar(true);
    try {
      const updated = await authService.updateProfile({
        name: name.trim() || user.name,
        avatar: '',
        avatarFileId: '',
      });

      updateUser(updated);
      showToast('Avatar removed.');
    } catch (err) {
      showToast(err.message || 'Failed to remove avatar', 'error');
    } finally {
      setUploadingAvatar(false);
    }
  };

  // 4. Change Email Request Handler
  const handleRequestEmailChange = async (e) => {
    e.preventDefault();
    if (!newEmail.trim() || !emailPassword) {
      showToast('Please enter both new email and current password.', 'error');
      return;
    }

    setSendingEmailRequest(true);
    try {
      await authService.requestEmailChange({
        newEmail: newEmail.trim(),
        currentPassword: emailPassword,
      });

      showToast(`Verification link sent to ${newEmail.trim()}. Check your inbox!`);
      setNewEmail('');
      setEmailPassword('');
    } catch (err) {
      showToast(err.message || 'Failed to request email change', 'error');
    } finally {
      setSendingEmailRequest(false);
    }
  };

  // 5. Change Password Handler
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast('Please fill out all password fields.', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match.', 'error');
      return;
    }

    if (newPassword.length < 6) {
      showToast('New password must be at least 6 characters.', 'error');
      return;
    }

    setUpdatingPassword(true);
    try {
      await authService.changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      showToast('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      showToast(err.message || 'Failed to change password', 'error');
    } finally {
      setUpdatingPassword(false);
    }
  };

  const getInitials = (nameStr) => {
    return nameStr ? nameStr.charAt(0).toUpperCase() : 'U';
  };

  return (
    <PageContainer>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Account Settings</h1>
          <p className={styles.subtitle}>Manage your profile, avatar, email, and security settings</p>
        </div>

        {/* SECTION 1: PROFILE INFORMATION */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <UserIcon size={20} className="text-primary" />
            <h2 className={styles.sectionTitle}>Profile</h2>
          </div>

          <div className={styles.avatarContainer}>
            {authLoading || !user ? (
              <Skeleton width="80px" height="80px" variant="circular" />
            ) : (
              <div className={styles.avatarPreview}>
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className={styles.avatarImg} />
                ) : (
                  getInitials(user?.name)
                )}
              </div>
            )}

            <div className={styles.avatarActions}>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleAvatarFileSelect}
                  className="hidden"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  loading={uploadingAvatar}
                  disabled={authLoading}
                >
                  <ImageIcon size={14} />
                  <span>{uploadingAvatar ? 'Uploading...' : 'Change Avatar'}</span>
                </Button>

                {user?.avatar && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveAvatar}
                    disabled={uploadingAvatar}
                  >
                    <TrashIcon size={14} />
                    <span>Remove Avatar</span>
                  </Button>
                )}
              </div>
              <p className={styles.avatarNote}>Max size 5MB (JPG, PNG, WebP). Saved in Usly-Media/avatars.</p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className={styles.formGrid}>
            {authLoading || !user ? (
              <div className="space-y-4">
                <Skeleton width="100%" height="40px" borderRadius="8px" />
                <Skeleton width="100%" height="40px" borderRadius="8px" />
              </div>
            ) : (
              <>
                <Input
                  label="Name"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />

                <div>
                  <Input
                    label="Email Address"
                    value={user?.email || ''}
                    disabled
                    readOnly
                  />
                  <p className={styles.helpText}>To change your email address, use the Change Email section below.</p>
                </div>
              </>
            )}

            <div className={styles.formFooter}>
              <Button type="submit" variant="primary" loading={updatingProfile} disabled={authLoading}>
                <CheckIcon size={16} />
                <span>Save Profile</span>
              </Button>
            </div>
          </form>
        </div>

        {/* SECTION 2: CHANGE EMAIL */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <MailIcon size={20} className="text-primary" />
            <h2 className={styles.sectionTitle}>Change Email</h2>
          </div>

          <form onSubmit={handleRequestEmailChange} className={styles.formGrid}>
            <Input
              label="Current Email"
              value={user?.email || ''}
              disabled
              readOnly
            />

            <Input
              label="New Email Address"
              type="email"
              placeholder="new.email@example.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              required
            />

            <Input
              label="Current Password"
              type="password"
              placeholder="••••••••"
              value={emailPassword}
              onChange={(e) => setEmailPassword(e.target.value)}
              required
            />

            <div className={styles.formFooter}>
              <Button type="submit" variant="primary" loading={sendingEmailRequest}>
                <MailIcon size={16} />
                <span>Send Verification Email</span>
              </Button>
            </div>
          </form>
        </div>

        {/* SECTION 3: CHANGE PASSWORD */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <LockIcon size={20} className="text-primary" />
            <h2 className={styles.sectionTitle}>Change Password</h2>
          </div>

          <form onSubmit={handleChangePassword} className={styles.formGrid}>
            <Input
              label="Current Password"
              type="password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />

            <Input
              label="New Password"
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />

            <Input
              label="Confirm New Password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <div className={styles.formFooter}>
              <Button type="submit" variant="primary" loading={updatingPassword}>
                <LockIcon size={16} />
                <span>Change Password</span>
              </Button>
            </div>
          </form>
        </div>

        {/* SECTION 4: WEB PUSH NOTIFICATIONS */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <BellIcon size={20} className="text-primary" />
            <h2 className={styles.sectionTitle}>Push Notifications</h2>
          </div>

          <div className="space-y-3 py-1">
            <p className={styles.helpText}>
              Stay updated with important actions like new letters, filed complaints, and event reminders even when Usly isn't open.
            </p>

            {pushPermission === 'denied' ? (
              <div className="p-3 bg-accent/10 border border-accent/30 rounded-lg text-xs text-text-secondary">
                ⚠️ Browser notification permission is currently <strong>denied</strong>. To receive alerts, please allow notification permissions for this website in your browser settings.
              </div>
            ) : pushSubscribed ? (
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 p-3 bg-surface-alt rounded-lg border border-border">
                <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                  <CheckIcon size={16} />
                  <span>Web Push notifications are active on this device.</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleTogglePush}
                  loading={togglingPush}
                >
                  Disable Push
                </Button>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 p-3 bg-surface-alt rounded-lg border border-border">
                <span className="text-xs text-text-secondary">
                  Push notifications are currently disabled on this device.
                </span>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleTogglePush}
                  loading={togglingPush}
                  disabled={!pushSupported}
                >
                  <BellIcon size={14} />
                  <span>Enable Push Notifications</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage('')} />
    </PageContainer>
  );
};

export default Settings;
