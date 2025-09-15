import WebSocket from "ws";
import { Client } from "pg";
import { createClient } from "redis";
import { storeValue } from "./heplers/decimal-converts";
import { CHANNEL_V0, Decimals, query, query_V0, SPREAD } from "./config";
import { batchPushToDb } from "./db";


const publisher = createClient({
	socket: {
		host: process.env.REDIS_HOST || "localhost",
		port: Number(process.env.REDIS_PORT!) || 6379,
	},
});

const round2 = (num: number) => Math.round(num * 100) / 100;

async function ConnectPubsub() {
	await publisher.connect();
	console.log("✅ Connected to Redis");
}
ConnectPubsub();
const channel = "trades";

const URL =
	"wss://stream.binance.com:9443/stream?streams=" +
	[
		"btcusdt@aggTrade", // BTCUSDT aggregated trades
		"ethusdt@aggTrade", // ETHUSDT aggregated trades
		"bnbusdt@aggTrade", // BNBUSDT aggregated trades
		"xrpusdt@aggTrade", // XRPUSDT aggregated trades
		"adausdt@aggTrade", // ADAUSDT aggregated trades
	].join("/");

const BATCH_SIZE = 200;
/**
 * Batch of trades with their original values.
 */
const batch: [timeStamp: string, asset: string, price: number][] = [];

/**
 * Batch of trades with their original decimal precision.
 */
const batch_v0: [
	timeStamp: string,
	asset: string,
	price: number,
	quantity: number,
	isBuyerMaker: boolean,
	decimals: number
][] = [];

let curr = 0;



const client_v0 = new Client({
	user: process.env.POSTGRES_USER || "postgres",
	host: process.env.POSTGRES_HOST || "timescaledb", // must be "timescaledb"
	database: process.env.POSTGRES_DB || "xnessdbdev",
	password: process.env.POSTGRES_PASSWORD || "pass",
	port: Number(process.env.POSTGRES_PORT) || 5432,
});

/**
 * Connect to PostgreSQL for xness_v0 accurate integer values
 */
async function connect_v0() {
	await client_v0.connect();
	console.log("✅ Connected to PostgreSQL for xness_v0 accurate integer values");
}
connect_v0();

const wss = new WebSocket(URL);
wss.on("open", () => {
	console.log("WebSocket connection established");
});

wss.on("message", async (event) => {
	const data = event.toString();
	const parsed = JSON.parse(data);
	const ts = new Date(Number(parsed.data.T)).toISOString().replace("T", " ").replace("Z", "");
	const raw_price = parsed.data.p;
	const decimal = Decimals[parsed.data.s as keyof typeof Decimals];
	console.log("Received message from WebSocket", parsed.data.T);
	// store batches

	const price_v0 = storeValue(raw_price, decimal);
	const ask_v0 = storeValue(raw_price * (1 + SPREAD), decimal);
	const bid_v0 = storeValue(raw_price * (1 - SPREAD), decimal);

	batch_v0.push([ts, parsed.data.s, price_v0, 1, parsed.data.m, decimal]);
	batch.push([ts, parsed.data.s, parseFloat(raw_price)]);

	// flush batches when full
	// publish rounded (float-based)
	const ask = round2(raw_price * (1 + SPREAD));
	const bid = round2(raw_price * (1 - SPREAD));
	await publisher.publish(
		channel,
		JSON.stringify({ ts, asset: parsed.data.s, price: parseFloat(raw_price), ask, bid })
	);

	// publish integer v0 (accurate)
	await publisher.publish(
		CHANNEL_V0,
		JSON.stringify({
			ts,
			asset: parsed.data.s,
			price: price_v0,
			ask: ask_v0,
			bid: bid_v0,
			decimal,
		})
	);
});

wss.on("error", (error) => {
	console.error("WebSocket error:", error);
});

const intervel = setInterval(async () => {
	console.log(`Flushing ${batch_v0.length} trades to DB...`);
	const filters_batchV0 = batch_v0.filter((row) => row.every((val) => val !== undefined && val !== null));
	const filteres_batch = batch.filter((row) => row.every((val) => val !== undefined && val !== null));
	if (filteres_batch.length === 0 || filters_batchV0.length === 0) {
		console.log("No valid trades to flush");
		console.log("V0", filteres_batch);
		console.log("V1", filters_batchV0);
		return;
	}
	await batchPushToDb(client_v0, query_V0, batch_v0);
	batch.length = 0;
	batch_v0.length = 0;
}, 10 * 1000);
