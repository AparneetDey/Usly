import jwt from 'jsonwebtoken';

/**
 * Generates a signed JWT token for a given user ID
 * @param {string} userId - User ObjectId string
 * @returns {string} Signed JWT token
 */
export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'usly_default_secret_key_change_in_production', {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });
};
