import { Response, Request, NextFunction } from "express";
import { JWT_SECRET } from "../config";
import jwt from "jsonwebtoken";

export function authMiddleware(
	req: Request,
	res: Response,
	next: NextFunction
) {
	const token = req.headers["authorization"];
	if (!token) {
		return res.status(401).json({ error: "Unauthorized" });
	}
	jwt.verify(token, JWT_SECRET!, (err, decoded) => {
		if (err) {
			return res.status(401).json({ error: "Unauthorized" });
		}
        //@ts-ignore
		req.username = decoded.username;
		next();
	});
}
