import { RequestHandler } from "express";

import { ApiError } from "@/errors";
import { GoogleAuthService } from "@/services/google-auth-services";

export class GoogleAuthController {
  static readonly signInWithIdToken: RequestHandler = async (req, res, next) => {
    try {
      const { idToken } = req.body;
      if (!idToken) throw new ApiError("idToken is required", 400);

      const googleUser = await GoogleAuthService.verifyGoogleIdToken(idToken);
      const result = await GoogleAuthService.findOrCreateAccount(googleUser);

      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  static readonly signInWithCode: RequestHandler = async (req, res, next) => {
    try {
      const { code, redirectUri, codeVerifier } = req.body;

      if (!code) throw new ApiError("code is required", 400);
      if (!redirectUri) throw new ApiError("redirectUri is required", 400);

      const googleUser = await GoogleAuthService.exchangeCodeForUserInfo(code, redirectUri, codeVerifier);
      const result = await GoogleAuthService.findOrCreateAccount(googleUser);

      res.json(result);
    } catch (err) {
      next(err);
    }
  };
}
