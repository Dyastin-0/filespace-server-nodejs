import Users from "../models/user.js";
import jwt from "jsonwebtoken";

/**
 * Handles the refresh of access tokens using a refresh token stored in cookies.
 * - Validates the refresh token and generates a new access token and refresh token if valid.
 * - Updates the user's refresh tokens in the database and sets a new refresh token in cookies.
 * - Clears the old refresh token from cookies.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.cookies - The cookies attached to the request.
 * @param {string} [req.cookies.jwt] - The refresh token stored in cookies (if available).
 * @param {Object} res - The response object.
 *
 * @returns {void}
 * - On success, sets a new refresh token in cookies and returns a JSON response with:
 *    - `accessToken` {string} - The new JWT access token.
 *    - `user` {Object} - The authenticated user's data excluding sensitive fields.
 * - On failure, sends an appropriate status code:
 *    - {401} - If no refresh token is found in cookies.
 *    - {403} - If the refresh token is invalid or does not match any user.
 *
 * @throws {Error} - If an internal server error occurs during token verification or user update.
 */
const handleRefreshAccessToken = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(401);
  const refreshToken = cookies.jwt;
  res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });

  const user = await Users.findOne({ refreshToken });
  if (!user) {
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      async (error, decoded) => {
        if (error) return res.sendStatus(403);
        const hackedUser = await Users.findOne({ email: decoded.email });
        await Users.updateOne(
          { email: hackedUser.email },
          { $set: { refreshToken: [] } }
        );
      }
    );
    return res.sendStatus(403);
  }

  let newRefreshTokens = user.refreshToken.filter((rt) => rt !== refreshToken);

  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    async (error, decoded) => {
      if (error) {
        await Users.updateOne(
          { email: user.email },
          { $set: { refreshToken: [...newRefreshTokens] } }
        );
      }
      if (error || user.email !== decoded.email) return res.sendStatus(403);
      const accessToken = jwt.sign(
        {
          user: {
            username: user.username,
            email: user.email,
            roles: user.roles,
            id: user._id,
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
      );

      const newRefreshToken = jwt.sign(
        { username: user.username, email: user.email },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "1d" }
      );
      await Users.updateOne(
        { email: user.email },
        { $set: { refreshToken: [...newRefreshTokens, newRefreshToken] } }
      );
      res.cookie("jwt", newRefreshToken, {
        httpOnly: true,
        sameSite: "None",
        secure: true,
        maxAge: 1 * 24 * 60 * 60 * 1000,
      });
      const {
        password,
        verificationToken,
        recoveryToken,
        __v,
        refreshToken,
        ...userData
      } = user.toJSON();
      res.json({
        accessToken,
        user: userData,
      });
    }
  );
};

export default handleRefreshAccessToken;
