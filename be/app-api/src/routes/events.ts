import express from "express";
import { authMiddleware } from "../middlewares/auth";
import { users_v0 } from "../config";
export const eventsRouter = express.Router();

eventsRouter.get("/", authMiddleware, (req, res) => {
	res.setHeader("Content-Type", "text/event-stream");
	res.setHeader("Cache-Control", "no-cache");
	res.setHeader("Connection", "keep-alive");
	const userId = req.userId;
	const user = users_v0.find((u) => u.userId === userId);
	if (!user) {
		return res.status(404).json({ message: "User not found" });
	}
    user.res = res
	user.res.write("data: " + JSON.stringify({ message: "Connected to SSE" }) + "\n\n");
	req.on('close',()=>{
		user.res = undefined
		res.end()
	})
});
