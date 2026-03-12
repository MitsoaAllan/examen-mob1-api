import * as express from "express";

import { AccountController } from "@/controllers";
import { GoogleAuthController } from "@/controllers/google-auth-controllers";

export const authRouter = express.Router();

authRouter.post("/sign-up", AccountController.signUp);
authRouter.post("/sign-in", AccountController.signIn);

authRouter.post("/google", GoogleAuthController.signInWithIdToken);

authRouter.post("/google/callback", GoogleAuthController.signInWithCode);
