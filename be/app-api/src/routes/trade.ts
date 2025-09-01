import crypto from "crypto";
import express from "express";
import { openTradeSchema } from "../schema/v0";
import { authMiddleware } from "../middlewares/auth";
import { tradeManager } from "..";

/**
 * Create a new trade
 *
 * POST /api/v1/trades
 */
export const tradeRouter = express.Router();
tradeRouter.post("/",authMiddleware,(req, res) => {
    const userId = req.userId!
	const parsed = openTradeSchema.safeParse(req.body);
	if (!parsed.success) {
		console.error("Invalid trade data:", parsed.error);
		return res.status(411).json({ message: "Incorrect inputs" });
	}
    const openPrice = tradeManager.getPrice(parsed.data.asset)![parsed.data.type == "buy" ? "ask" : "bid"]!;
    const margin  = parsed.data.margin!;
    const leverage = parsed.data.leverage!;
    const qty = (margin * leverage) / openPrice;
    const uuid = crypto.randomUUID();
	const order = {
        userId: userId,
		orderId: uuid,
		asset: parsed.data.asset,
		type: parsed.data.type,
		takeProfit: parsed.data.takeProfit ? parsed.data.takeProfit : null,
		stopLoss: parsed.data.stopLoss ? parsed.data.stopLoss : null,
		margin: parsed.data.margin!,
		leverage: parsed.data.leverage!,
		openPrice: openPrice,
		qty
	};
	tradeManager.openOrders(order)
	return res.status(201).json({
        orderId: uuid
    });
});
