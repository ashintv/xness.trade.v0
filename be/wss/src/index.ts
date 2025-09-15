import { createClient } from "redis";
import { WebSocketServer } from "ws";

const subscriber = createClient({
	socket: {
		host: process.env.REDIS_HOST || "localhost",
		port: Number(process.env.REDIS_PORT!) || 6379,
	},
});
async function connectSubscriber() {
	await subscriber.connect();
	console.log("✅ Connected to Redis Subscriber");
}
connectSubscriber();

/**
 * WebSocket server for real-time updates with original decimal precision (more accurate)
 * Done for V0_spec
 */
const wss_V0 = new WebSocketServer({ port: 8080 });
wss_V0.on("connection", async (ws) => {
	await subscriber.subscribe("trades_v0", (message) => {
		ws.send(message);
	});
});
