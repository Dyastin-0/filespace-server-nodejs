import express from "express";
import passport from "../middlewares/passport.js";
import { handleAuth, handleGoogleAuth } from "../controllers/auth.js";
import handleRefreshAccessToken from "../controllers/refreshAccessToken.js";
import handleSignout from "../controllers/signout.js";
import handleSignup from "../controllers/signup.js";
import {
  handleSendVerification,
  handleVerifyEmail,
} from "../controllers/security.js";

const router = express.Router();

router.post("/", handleAuth);
router.get("/refresh", handleRefreshAccessToken);
router.post("/sign-up", handleSignup);
router.post("/sign-out", handleSignout);
router.post("/verify", handleVerifyEmail);
router.post("/send/verification", handleSendVerification);

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.BASE_CLIENT_URL}/sign-in?gae=true`,
  }),
  handleGoogleAuth
);

export default router;
