import Users from "../models/user.js";

/**
 * Handles user sign-out by invalidating the refresh token.
 * - Clears the refresh token from cookies and removes it from the user's refresh tokens in the database.
 * - If the refresh token is not found in the database, it simply clears the cookie.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.cookies - The cookies attached to the request.
 * @param {string} [req.cookies.jwt] - The refresh token stored in cookies (if available).
 * @param {Object} res - The response object.
 *
 * @returns {void}
 * - On success, clears the refresh token cookie and sends a 204 (No Content) response.
 * - On failure or if no refresh token is found in cookies, clears the cookie and sends a 204 (No Content) response.
 *
 * @throws {Error} - If an internal server error occurs during database operations.
 */
const handleSignout = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies.jwt) return res.status(204);

  const refreshToken = cookies.jwt;
  const user = await Users.findOne({ refreshToken });

  if (!user) {
    res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
    return res.sendStatus(204);
  }

  await Users.updateOne(
    { refreshToken },
    {
      $set: {
        refreshToken: user.refreshToken.filter((rt) => rt !== refreshToken),
      },
    }
  );
  res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
  res.sendStatus(204);
};

export default handleSignout;
