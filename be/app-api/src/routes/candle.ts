import  format  from 'pg-format';
import express from 'express'   
import { Pool } from "pg";
import { timeStampToDate } from '../lib/timeStamp';
import { selectTradesQuery } from '../config';
/**
 * Candle API
 * GET /api/v1/candles
 */
export const candleRouter = express.Router();
const pool = new Pool({
	user: process.env.POSTGRES_USER || "postgres", // default user
	host: process.env.POSTGRES_HOST || "timescaledb", // Docker service name
	database: process.env.POSTGRES_DB || "xnessdbdev", // default database
	password: process.env.POSTGRES_PASSWORD || "pass", // default password
	port: Number(process.env.POSTGRES_PORT) || 5432,
});



candleRouter.get("/",async (req, res) => {
    const { asset, startTime, endTime, ts } = req.query;
    if (!asset || !startTime || !endTime || !ts) {
        return res.status(400).json({ message: "Missing required query parameters" });
    }
    const sql =  format.withArray(selectTradesQuery, [`trades_${ts}`, asset, startTime, endTime]);
    const { rows } = await pool.query(sql);
    return res.json(rows);

});


