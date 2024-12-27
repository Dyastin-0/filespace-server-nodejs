import bcrypt from 'bcrypt';

const passwordSaltRounds = 10;

/**
 * Hashes a password using bcrypt.
 *
 * @param {string} password - The plain-text password to hash.
 *
 * @returns {Promise<string>} A promise that resolves to the hashed password.
 * @throws {Error} Throws an error if hashing fails.
 */
const hash = async (password) => {
  try {
    const hashed = await bcrypt.hash(password, passwordSaltRounds);
    return hashed;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

/**
 * Compares a plain-text password with a hashed password.
 *
 * @param {string} orig - The plain-text password.
 * @param {string} hashed - The hashed password to compare against.
 *
 * @returns {Promise<boolean>} A promise that resolves to `true` if the passwords match, otherwise `false`.
 * @throws {Error} Throws an error if the comparison fails.
 */
const compare = async (orig, hashed) => {
  try {
    const matched = await bcrypt.compare(orig, hashed);
    return matched;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export { hash, compare };
