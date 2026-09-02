import bcrypt from 'bcryptjs';

/**
 * Hashes a plain text password using bcrypt with salt rounds = 10.
 * @param {string} password - Plain text password to hash
 * @returns {Promise<string>} Hashed password
 */
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

/**
 * Compares a plain text password against a stored bcrypt hash.
 * @param {string} enteredPassword - Plain text password
 * @param {string} passwordHash - Stored bcrypt hash
 * @returns {Promise<boolean>} True if match, false otherwise
 */
export const comparePassword = async (enteredPassword, passwordHash) => {
  return await bcrypt.compare(enteredPassword, passwordHash);
};
