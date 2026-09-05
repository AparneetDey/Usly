import crypto from 'crypto';
import User from '../models/user.model.js';
import emailService from '../services/email.service.js';
import imageKitService from '../services/imagekit.service.js';
import { getEmailChangeVerificationTemplate } from '../templates/email/email-change-verification.template.js';
import { ApiError, ApiResponse, asyncHandler, generateToken } from '../utils/index.js';

// Secure Cookie Options for JWT authentication
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
};

/**
 * Helper to return sanitized safe user object
 */
const getSafeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  avatar: user.avatar,
  avatarFileId: user.avatarFileId,
  partner: user.partner,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

/**
 * @desc    Register a new user (Max 2 users allowed)
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = asyncHandler(async (req, res) => {
  const userCount = await User.countDocuments();
  if (userCount >= 2) {
    throw new ApiError(
      403,
      'Registration limit reached. Usly is a private website restricted to exactly two users.'
    );
  }

  const { name, email, password, avatar, partner } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, 'Please provide name, email, and password');
  }

  const userExists = await User.findOne({ email: email.toLowerCase() });
  if (userExists) {
    throw new ApiError(400, 'User with this email already exists');
  }

  const passwordHash = await User.hashPassword(password);

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    passwordHash,
    avatar: avatar || '',
    partner: partner || null,
  });

  const token = generateToken(user._id);
  const safeUserData = getSafeUser(user);

  res.cookie('token', token, cookieOptions);

  res.status(201).json(
    new ApiResponse(
      201,
      { user: safeUserData, token },
      'User registered successfully'
    )
  );
});

/**
 * @desc    Authenticate user, set cookie & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, 'Please provide email and password');
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select(
    '+passwordHash'
  );

  if (!user || !(await user.matchPassword(password))) {
    throw new ApiError(401, 'Invalid email or password credentials');
  }

  const token = generateToken(user._id);
  const safeUserData = getSafeUser(user);

  res.cookie('token', token, cookieOptions);

  res.status(200).json(
    new ApiResponse(
      200,
      { user: safeUserData, token },
      'Login successful'
    )
  );
});

/**
 * @desc    Logout user & clear auth cookie
 * @route   POST /api/auth/logout
 * @access  Private
 */
export const logout = asyncHandler(async (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });

  res.status(200).json(
    new ApiResponse(200, null, 'Logged out successfully')
  );
});

/**
 * @desc    Get currently logged in user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getCurrentUser = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const user = await User.findById(userId).select('-passwordHash').populate('partner', 'name email avatar');

  if (!user) {
    throw new ApiError(404, 'User profile not found');
  }

  res.status(200).json(
    new ApiResponse(200, user, 'Current user profile retrieved successfully')
  );
});

/**
 * @desc    Get partner details for the currently logged-in user
 * @route   GET /api/auth/partner
 * @access  Private
 */
export const getPartnerDetails = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const currentUser = await User.findById(userId);

  if (!currentUser) {
    throw new ApiError(404, 'User profile not found');
  }

  let partner = null;

  if (currentUser.partner) {
    partner = await User.findById(currentUser.partner).select('-passwordHash');
  } else {
    partner = await User.findOne({ _id: { $ne: userId } }).select('-passwordHash');
  }

  if (!partner) {
    throw new ApiError(404, 'Partner details not found');
  }

  res.status(200).json(
    new ApiResponse(200, partner, 'Partner details retrieved successfully')
  );
});

/**
 * @desc    Update user profile (name, avatar, avatarFileId)
 * @route   PATCH /api/auth/me
 * @access  Private
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const { name, avatar, avatarFileId } = req.body;

  const oldAvatarFileId = user.avatarFileId;

  if (name !== undefined) {
    if (!name || typeof name !== 'string' || !name.trim()) {
      throw new ApiError(400, 'Name cannot be empty');
    }
    user.name = name.trim();
  }

  if (avatar !== undefined) {
    user.avatar = typeof avatar === 'string' ? avatar.trim() : avatar?.url || '';
  }

  if (avatarFileId !== undefined) {
    user.avatarFileId = avatarFileId ? avatarFileId.trim() : '';
  }

  await user.save();

  // If avatar was replaced or removed, delete the old file from ImageKit AFTER DB save succeeds
  if (oldAvatarFileId && oldAvatarFileId !== user.avatarFileId) {
    imageKitService.deleteFile(oldAvatarFileId).catch((err) => {
      console.error('[updateProfile] Non-critical ImageKit old avatar cleanup error:', err.message);
    });
  }

  const safeUserData = getSafeUser(user);

  res.status(200).json(
    new ApiResponse(200, safeUserData, 'Profile updated successfully')
  );
});

/**
 * @desc    Request email change & send verification link to new email
 * @route   POST /api/auth/change-email/request
 * @access  Private
 */
export const requestEmailChange = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const { newEmail, currentPassword } = req.body;

  if (!newEmail || !currentPassword) {
    throw new ApiError(400, 'New email and current password are required');
  }

  const normalizedNewEmail = newEmail.trim().toLowerCase();
  const emailRegex = /^\S+@\S+\.\S+$/;

  if (!emailRegex.test(normalizedNewEmail)) {
    throw new ApiError(400, 'Please enter a valid email address');
  }

  const user = await User.findById(userId).select('+passwordHash');

  if (!user || !(await user.matchPassword(currentPassword))) {
    throw new ApiError(401, 'Current password is incorrect');
  }

  if (user.email === normalizedNewEmail) {
    throw new ApiError(400, 'New email address must be different from your current email');
  }

  // Check if new email is already used by another account
  const emailExists = await User.findOne({ email: normalizedNewEmail, _id: { $ne: userId } });
  if (emailExists) {
    throw new ApiError(400, 'This email address is already in use');
  }

  // Generate cryptographically secure verification token & hash
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

  user.pendingEmail = normalizedNewEmail;
  user.emailChangeTokenHash = tokenHash;
  user.emailChangeExpiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

  await user.save();

  const frontendUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'https://usly-gold.vercel.app';
  const verificationUrl = `${frontendUrl.replace(/\/$/, '')}/verify-email-change?token=${rawToken}`;

  const { subject, html, text } = getEmailChangeVerificationTemplate({
    userName: user.name,
    newEmail: normalizedNewEmail,
    verificationUrl,
  });

  const emailResult = await emailService.sendEmail({
    to: normalizedNewEmail,
    subject,
    html,
    text,
  });

  if (!emailResult.success) {
    throw new ApiError(500, 'Failed to send verification email. Please check server email setup.');
  }

  res.status(200).json(
    new ApiResponse(
      200,
      { pendingEmail: normalizedNewEmail },
      `Verification email sent to ${normalizedNewEmail}. Please check your inbox.`
    )
  );
});

/**
 * @desc    Verify email change token & update email address
 * @route   POST /api/auth/change-email/verify
 * @access  Public / Private
 */
export const verifyEmailChange = asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    throw new ApiError(400, 'Verification token is required');
  }

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    emailChangeTokenHash: tokenHash,
    emailChangeExpiresAt: { $gt: new Date() },
  }).select('+emailChangeTokenHash');

  if (!user || !user.pendingEmail) {
    throw new ApiError(400, 'This verification link is invalid or has expired');
  }

  // Re-verify email is not taken in the meantime
  const emailExists = await User.findOne({ email: user.pendingEmail, _id: { $ne: user._id } });
  if (emailExists) {
    throw new ApiError(400, 'This email address is already in use by another account');
  }

  // Apply new email
  user.email = user.pendingEmail;
  user.pendingEmail = null;
  user.emailChangeTokenHash = null;
  user.emailChangeExpiresAt = null;

  await user.save();

  const safeUserData = getSafeUser(user);

  res.status(200).json(
    new ApiResponse(200, safeUserData, 'Email address verified and updated successfully!')
  );
});

/**
 * @desc    Change user password requiring current password verification
 * @route   PATCH /api/auth/change-password
 * @access  Private
 */
export const changePassword = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmPassword) {
    throw new ApiError(400, 'Current password, new password, and confirmation are required');
  }

  if (newPassword !== confirmPassword) {
    throw new ApiError(400, 'New password and confirm password do not match');
  }

  if (newPassword.length < 6) {
    throw new ApiError(400, 'New password must be at least 6 characters long');
  }

  if (currentPassword === newPassword) {
    throw new ApiError(400, 'New password must be different from your current password');
  }

  const user = await User.findById(userId).select('+passwordHash');

  if (!user || !(await user.matchPassword(currentPassword))) {
    throw new ApiError(401, 'Current password is incorrect');
  }

  user.passwordHash = await User.hashPassword(newPassword);
  await user.save();

  res.status(200).json(
    new ApiResponse(200, null, 'Password changed successfully!')
  );
});
