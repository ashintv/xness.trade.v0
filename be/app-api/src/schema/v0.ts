import { z } from "zod";
import { ta } from "zod/locales";

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


export const openTradeSchema = z.object({
	asset: z.enum(["BTCUSDT", "ETHUSDT", "XRPUSDT" , "ADAUSDT", "BNBUSDT"],"Invalid asset"),
	type: z.enum(["buy", "sell"], "Invalid order type"),
	margin: z.number().min(0).optional(),
	leverage: z.number().min(1, "Leverage must be at least 1").max(10, "Leverage must be at most 10").optional(),
    takeProfit: z.number().min(0).optional(),
	stopLoss: z.number().min(0).optional()

});
