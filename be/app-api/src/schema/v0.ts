import { z } from "zod";

export const userSchema = z.object({
	email: z.string().email("Invalid email address"),
	password: z
		.string()
		.min(4, "Password must be at least 4 characters long")
		.max(10, "Password must be at most 10 characters long"),
});

export const extendedUserSchema = userSchema.extend({
	userId: z.string().uuid(),
	balance: z.object({
		usd_balance: z.number().min(0).default(0),
		locked_balance: z.number().min(0).default(0),
	}),
});
