import { RequestHandler } from "express";
import { v4 } from "uuid";

import { AccountServices } from "@/services";
import { errorWrapper } from "@/utilities";
import { AccountValidator } from "@/validator";

export class AccountController {
  static readonly signIn: RequestHandler = async (req, res, next) => {
    try {
      const { username, password } = req.body;
      AccountValidator.create({ username, password });
      const data = await AccountServices.signIn(username, password);
      res.json(data);
    } catch (err) {
      next(err);
    }
  };

  static readonly signUp: RequestHandler = async (req, res, next) => {
    try {
      const account = req.body;
      AccountValidator.create(account);
      const createdUser = await AccountServices.singUp(v4(), account);
      res.json(createdUser);
    } catch (err) {
      next(err);
    }
  };

  static readonly getMe: RequestHandler = async (req, res, next) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const user = await AccountServices.getUserById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({
        id: user.id,
        username: user.username,
        subscriptionType: user.subscriptionType,
      });
    } catch (err) {
      next(err);
    }
  };

  static readonly updateSubscription: RequestHandler = async (req, res, next) => {
    try {
      const accountId = (req as any).user?.id;
      if (!accountId) return res.status(401).json({ error: "Unauthorized" });

      const { subscriptionType } = req.body;

      AccountValidator.updateSubscription({ subscriptionType });

      const updated = await AccountServices.updateSubscription(accountId, subscriptionType);

      res.json({
        id: updated.id,
        username: updated.username,
        subscriptionType: updated.subscriptionType,
      });
    } catch (error) {
      next(error);
    }
  };
}
