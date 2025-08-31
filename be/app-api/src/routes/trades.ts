
import express from "express";

/**
 * GET /api/v1/trades/open  --  get all open trades
 *
 * GET /api/v1/trades/closed --  get all closed trades
 */
export const tradesRouter = express.Router();

tradesRouter.get("/open", (req, res) => {
  // return all open trades
});


tradesRouter.get("/closed", (req, res) => {

  // return all closed trades
});
