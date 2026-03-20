import * as express from "express";

import { AccountController } from "@/controllers";
import { authHandler } from "@/middlewares";
import { GoogleAuthController } from "@/controllers/google-auth-controllers";

export const authRouter = express.Router();

authRouter.post("/sign-up", AccountController.signUp);
authRouter.post("/sign-in", AccountController.signIn);
authRouter.get("/me", authHandler, AccountController.getMe);
authRouter.patch("/subscription", authHandler, AccountController.updateSubscription);

authRouter.post("/google", GoogleAuthController.signInWithIdToken);
authRouter.post("/google/callback", GoogleAuthController.signInWithCode);
