import { NextFunction, Request, Response } from "express";
import { JWT_SECRET } from "../config";
import jwt, { JwtPayload } from "jsonwebtoken";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
	let token = req.headers["authorization"];
	if (!token && req.query.token) {
		token = req.query.token as string;
	}
	if (!token) {
		return res.status(401).json({ message: "Unauthorized" });
	}
	const verify = jwt.verify(token, JWT_SECRET!) as JwtPayload;
	if (!verify) {
		return res.status(403).json({ message: "Forbidden" });
	}
	//@ts-ignore
	req.userId = verify.userId;
	next();
};
