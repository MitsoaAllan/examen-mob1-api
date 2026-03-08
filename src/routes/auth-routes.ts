import * as express from "express";

import { AccountController } from "@/controllers";
import { authHandler } from "@/middlewares";

export const authRouter = express.Router();

authRouter.post("/sign-up", AccountController.signUp);
authRouter.post("/sign-in", AccountController.signIn);
authRouter.get("/me", authHandler, AccountController.getMe);
authRouter.patch("/subscription", authHandler, AccountController.updateSubscription);
