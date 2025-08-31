import { User } from "./types/v0-types";
import dotenv from "dotenv";
dotenv.config();

export const users_v0: User [] = [];

export const JWT_SECRET = process.env.JWT_SECRET