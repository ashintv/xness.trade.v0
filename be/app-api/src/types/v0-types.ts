import z from "zod";
import { extendedUserSchema } from "../schema/v0";


export type User = z.infer<typeof extendedUserSchema>;
