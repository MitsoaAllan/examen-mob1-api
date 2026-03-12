import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { v4 } from "uuid";

import { getPrismaClient } from "@/configs";
import { ApiError } from "@/errors";

interface GoogleUserInfo {
  sub: string;
  email: string;
  name: string;
  picture?: string;
  email_verified?: boolean;
}

interface GoogleTokenPayload {
  aud: string;
  sub: string;
  email: string;
  name?: string;
  picture?: string;
  email_verified?: string;
}

interface GoogleTokenResponse {
  id_token?: string;
  access_token?: string;
  error?: string;
  error_description?: string;
}

export class GoogleAuthService {
  static async verifyGoogleIdToken(idToken: string): Promise<GoogleUserInfo> {
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);

    if (!response.ok) {
      throw new ApiError("Invalid Google token", 401);
    }

    const payload = (await response.json()) as GoogleTokenPayload;

    const validAudiences = [process.env.GOOGLE_WEB_CLIENT_ID, process.env.GOOGLE_ANDROID_CLIENT_ID].filter(Boolean);

    if (validAudiences.length > 0 && !validAudiences.includes(payload.aud)) {
      throw new ApiError("Google token audience mismatch", 401);
    }

    if (!payload.email) {
      throw new ApiError("Google token missing email", 401);
    }

    return {
      sub: payload.sub,
      email: payload.email,
      name: payload.name || payload.email.split("@")[0],
      picture: payload.picture,
      email_verified: payload.email_verified === "true",
    };
  }

  static async exchangeCodeForUserInfo(code: string, redirectUri: string, codeVerifier?: string) {
    const isAndroid = !!codeVerifier;

    const params: Record<string, string> = {
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    };

    if (isAndroid) {
      params.client_id = process.env.GOOGLE_ANDROID_CLIENT_ID!;
      params.code_verifier = codeVerifier;
    } else {
      params.client_id = process.env.GOOGLE_WEB_CLIENT_ID!;
      params.client_secret = process.env.GOOGLE_CLIENT_SECRET!;
    }

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(params).toString(),
    });

    const tokenData = (await tokenResponse.json()) as GoogleTokenResponse;

    if (!tokenResponse.ok || !tokenData.id_token) {
      console.error("Google token exchange failed:", tokenData);
      throw new ApiError(tokenData.error_description || "Failed to exchange Google code", 400);
    }

    return await this.verifyGoogleIdToken(tokenData.id_token);
  }

  static async findOrCreateAccount(googleUser: GoogleUserInfo) {
    const prisma = getPrismaClient();

    let account = await (prisma.account as any).findFirst({
      where: { googleId: googleUser.sub },
    });

    if (!account) {
      account = await prisma.account.findFirst({
        where: { email: googleUser.email },
      });

      if (account) {
        account = await (prisma.account as any).update({
          where: { id: account.id },
          data: { googleId: googleUser.sub },
        });
      }
    }

    if (!account) {
      let username = googleUser.name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "_")
        .replace(/_+/g, "_")
        .replace(/^_|_$/g, "")
        .slice(0, 20);

      if (!username || username.length < 3) {
        username = `user_${Date.now().toString().slice(-8)}`;
      }

      let finalUsername = username;
      let suffix = 1;
      while (await prisma.account.findFirst({ where: { username: finalUsername } })) {
        finalUsername = `${username.slice(0, 15)}_${suffix++}`;
      }

      const randomPassword = v4();
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(randomPassword, salt);

      account = await (prisma.account as any).create({
        data: {
          id: v4(),
          googleId: googleUser.sub,
          username: finalUsername,
          email: googleUser.email,
          password: hashedPassword,
        },
      });
    }

    const { password, ...safeAccount } = account as any;
    const token = jwt.sign(
      {
        id: account.id,
        username: account.username,
        email: account.email,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "10h" },
    );

    return { token, account: safeAccount };
  }
}
