import { z } from "zod";

import { ApiError } from "@/errors";

const createUserSchema = z.object({
  password: z.string().min(8),
  username: z.string().min(4),
});

const updateSubscriptionSchema = z.object({
  subscriptionType: z.enum(["ESSENTIAL", "PREMIUM"]),
});

type CreateUser = z.infer<typeof createUserSchema>;

export class AccountValidator {
  public static create(account: CreateUser) {
    const result = createUserSchema.safeParse(account);
    if (!result.success) throw new ApiError(z.prettifyError(result.error), 400);
  }
  public static updateSubscription(data: { subscriptionType: "ESSENTIAL" | "PREMIUM" }) {
    const result = updateSubscriptionSchema.safeParse(data);
    if (!result.success) throw new ApiError(z.prettifyError(result.error), 400);
  }
}
