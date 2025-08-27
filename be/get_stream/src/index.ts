import WebSocket from "ws";
import { Client } from "pg";
import format from "pg-format";

import { createClient } from "redis";

const redisUrl = "redis://localhost:6370"; // replace with your Redis URL
const publisher = createClient({ url: redisUrl });

//helper
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
const batch: [timeStamp: string, asset: string, price: number][] = [];
let curr = 0;

const client = new Client({
	host: "localhost",
	port: 5432,
	user: "postgres",
	password: "pass",
	database: "xness",
});

async function connect() {
	await client.connect();
}

connect();
const wss = new WebSocket(URL);

wss.on("open", () => {
	console.log("WebSocket connection established");
});

wss.on("message", async (event) => {
	const data = event.toString();
	const parsed = JSON.parse(data);
	const ts = new Date(Number(parsed.data.E))
		.toISOString()
		.replace("T", " ")
		.replace("Z", "");
	batch.push([ts, parsed.data.s, parseFloat(parsed.data.p)]);
	curr++;
	if (curr >= BATCH_SIZE) {
		try {
			const query = format(
				"INSERT INTO trade (time, asset, price) VALUES %L",
				batch
			);
			await client.query(query);
			console.log("Batch insert done", batch.length, "records");
		} catch (err) {
			console.error("Error inserting batch:", err);
		}
		batch.length = 0; // clear the batch
		curr = 0;
	}
	const price = parseFloat(parsed.data.p)
	const ask = round2(price + 0.00001 * price);
	const bid = round2(price - 0.00001 * price);

	await publisher.publish(
		channel,
		JSON.stringify({
			ts,
			asset: parsed.data.s,
			price,
			ask,
			bid
		})
	);
});

wss.on("error", (error) => {
	console.error("WebSocket error:", error);
});
