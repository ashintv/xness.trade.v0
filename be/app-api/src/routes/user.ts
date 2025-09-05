import express from "express";
import { userSchema } from "../schema/v0";
import { JWT_SECRET, users_v0 } from "../config";
import jwt from "jsonwebtoken";
import { authMiddleware } from "../middlewares/auth";

/**
 * User API
 * POST /api/v1/user/signup
 * POST /api/v1/user/signin
 * GET /api/v1/user/balance
 */
export const userRouter = express.Router();


userRouter.post("/signup", (req, res) => {
	const result = userSchema.safeParse(req.body);
	if (!result.success) {
		console.log(result.error);
		return res.status(403).json({ message: "Error while signing up" });
	}
	const uuid = crypto.randomUUID();
	users_v0.push({
		userId: uuid,
		email: result.data.email,
		password: result.data.password,
		balance: {
			usd_balance: 500000,
			locked_balance: 0,
		},
	});
	return res.status(201).json({ userId: uuid });
});



userRouter.post("/signin", (req, res) => {
	const result = userSchema.safeParse(req.body);
	if (!result.success) {
		console.log(result.error);
		return res.status(403).json({ message: "Incorrect credentials" });
	}
	const user = users_v0.find((u) => u.email === result.data.email);
	if (!user) {
		console.log("User not found with email:", result.data.email);
		return res.status(404).json({ message: "Incorrect credentials" });
	}
	if (user.password !== result.data.password) {
		console.log("Invalid password for user:", user.email);
		return res.status(403).json({ message: "Incorrect credentials" });
	}
	const token = jwt.sign({ userId: user.userId }, JWT_SECRET!);
	return res.status(200).json({ token });
});



userRouter.get("/balance", authMiddleware, (req, res) => {
	const userId = req.userId;
	const user = users_v0.find((u) => u.userId === userId);
	if (!user) {
		return res.status(404).json({ message: "User not found" });
	}
	return res.status(200).json({ usd_balance: user.balance.usd_balance });
});
