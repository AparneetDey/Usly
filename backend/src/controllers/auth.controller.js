import User from '../models/user.model.js';
import { ApiError, ApiResponse, asyncHandler, generateToken } from '../utils/index.js';

/**
 * @desc    Register a new user (Max 2 users allowed)
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = asyncHandler(async (req, res) => {
  // Enforce Usly's strict 2-user application constraint
  const userCount = await User.countDocuments();
  if (userCount >= 2) {
    throw new ApiError(
      403,
      'Registration limit reached. Usly is a private website restricted to exactly two users.'
    );
  }

  const { name, email, password, avatar } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, 'Please provide name, email, and password');
  }

  // Prevent duplicate email registrations
  const userExists = await User.findOne({ email: email.toLowerCase() });
  if (userExists) {
    throw new ApiError(400, 'User with this email already exists');
  }

  // Hash password using User static method
  const passwordHash = await User.hashPassword(password);

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    passwordHash,
    avatar: avatar || '',
  });

  const token = generateToken(user._id);

  const safeUserData = {
    _id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  res.status(201).json(
    new ApiResponse(
      201,
      { user: safeUserData, token },
      'User registered successfully'
    )
  );
});

/**
 * @desc    Authenticate user & get token
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

  const safeUserData = {
    _id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  res.status(200).json(
    new ApiResponse(
      200,
      { user: safeUserData, token },
      'Login successful'
    )
  );
});

/**
 * @desc    Get currently logged in user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getCurrentUser = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const user = await User.findById(userId).select('-passwordHash');

  if (!user) {
    throw new ApiError(404, 'User profile not found');
  }

  res.status(200).json(
    new ApiResponse(200, user, 'Current user profile retrieved successfully')
  );
});
