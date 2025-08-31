import { NextFunction, Request, Response } from "express";
import { JWT_SECRET } from "../config";
import jwt from "jsonwebtoken";

export const authMiddleware = (
	req: Request,
	res: Response,
	next: NextFunction
) => {

	const token = req.headers["authorization"];
	if (!token) {
		return res.status(401).json({ message: "Unauthorized" });
	}
	const verify = jwt.verify(token, JWT_SECRET!);
	if (!verify) {
		return res.status(403).json({ message: "Forbidden" });
	}
	//@ts-ignore
	req.userId = verify.userId;
	next();
};
