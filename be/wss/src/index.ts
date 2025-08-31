import { createClient } from "redis";
import { WebSocketServer } from "ws";

const subscriber = createClient({ url: "redis://localhost:6370" }); // replace with your Redis URL
async function connectSubscriber() {
	await subscriber.connect();
	console.log("✅ Connected to Redis Subscriber");
}
connectSubscriber();

/**
 * WebSocket server for real-time updates with rounded values (less accurate)
 * Listens for messages from Redis and forwards them to connected clients
 * Done for simplicity and bootstraping project
 */
const wss = new WebSocketServer({ port: 8080 });
wss.on("connection", async (ws) => {
	




	ws.on("message", (message) => {
		ws.send(`Echo: ${message}`);
	});
	await subscriber.subscribe("trades", (message) => {
		ws.send(message);
	});
});


/**
 * WebSocket server for real-time updates with original decimal precision (more accurate)
 * Done for V0_spec
 */
const wss_V0 = new WebSocketServer({ port: 8081 });
wss_V0.on("connection", async (ws) => {
	await subscriber.subscribe("trades_v0", (message) => {
		ws.send(message);
	});
});