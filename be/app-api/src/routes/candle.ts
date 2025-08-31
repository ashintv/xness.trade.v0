import  format  from 'pg-format';
import express from 'express'   
import { Pool } from "pg";
import { timeStampToDate } from '../lib/timeStamp';
/**
 * Candle API
 * GET /api/v1/candles
 */
export const candleRouter = express.Router();
const pool = new Pool({
	host: "localhost",
	port: 5432,
	user: "postgres",
	password: "pass",
	database: "xness_v0",
});


export const selectTradesQuery =
	"SELECT * FROM %s WHERE symbol = %L AND timestamp BETWEEN to_timestamp(%s / 1000) AND to_timestamp(%s / 1000) ORDER BY timestamp ASC";



candleRouter.get("/",async (req, res) => {
    const { asset, startTime, endTime, ts } = req.query;
    if (!asset || !startTime || !endTime || !ts) {
        return res.status(400).json({ message: "Missing required query parameters" });
    }
    const sql =  format.withArray(selectTradesQuery, ['trades_1m', "ADAUSDT", startTime, endTime]);
    const { rows } = await pool.query(sql);
    return res.json(rows);

});


