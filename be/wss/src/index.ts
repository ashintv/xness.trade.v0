import { createClient } from "redis";
import { WebSocketServer } from "ws";

const subscriber = createClient({ url: "redis://localhost:6370" }); // replace with your Redis URL
async function connectSubscriber() {
	await subscriber.connect();
	console.log("✅ Connected to Redis Subscriber");
}
connectSubscriber();
const wss = new WebSocketServer({ port: 8080 });
wss.on("connection", async (ws) => {
	console.log("Client connected");
	ws.on("message", (message) => {
		ws.send(`Echo: ${message}`);
	});
	await subscriber.subscribe("trades", (message) => {
		ws.send(message);
	});
});
