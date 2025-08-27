import { z } from "zod";
const ASSETS = ["BTCUSDT", "ETHUSDT", "XRPUSDT" , "ADAUSDT", "BNBUSDT"] ;

 /*req = {
        type: "buy" | "sell",
        qty: number,
        asset: string,
        stopLoss?: number,
        takeProfit?: number
    }
*/

//add error messages
export const orderSchema = z.object({
    username: z.string().min(2).max(100 ,"invalid username"),
	type: z.enum(["buy", "sell"],"invalid option"),
	qty: z.number("invalid quantity"),
	asset: z.enum(ASSETS,"invalid asset"),
	stopLoss: z.number().min(0,"invalid stop loss").optional(),
	takeProfit: z.number().min(0,"invalid take profit").optional(),
});

export const userSchema = z.object({
	username: z.string().min(2).max(100 ,"invalid username"),
	password: z.string().min(6).max(100 ,"invalid password"),
});
