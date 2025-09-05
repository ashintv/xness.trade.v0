
import express from "express";
import { authMiddleware } from "../middlewares/auth";
import { closed_orders_v0 } from "../config";
import { tradeManager } from "..";

/**
 * GET /api/v1/trades/open  --  get all open trades
 *
 * GET /api/v1/trades/closed --  get all closed trades
 */
export const tradesRouter = express.Router();

tradesRouter.get("/open",authMiddleware, (req, res) => {
    const userId = req.userId!;
    const openTrades = tradeManager.getOrderOf(userId);
    return res.status(200).json({
        trades: openTrades
    });
});


tradesRouter.get("/closed",authMiddleware, (req, res) => {
    const userId = req.userId!;
    const closedTrades = closed_orders_v0.filter(order => order.userId === userId);
    return res.status(200).json({
        trades: closedTrades
    });
});
