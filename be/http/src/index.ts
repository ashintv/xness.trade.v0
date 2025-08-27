import express from "express";
import { Pool } from "pg";
import cors from "cors";
import jwt from "jsonwebtoken";
import { orderSchema, userSchema } from "./schema";
import { Orders, WsData } from "./types";
import { createClient } from "redis";

const app = express();
app.use(cors());
let orderID = 1;
app.use(express.json());

const ASSETS: WsData = {
	BTCUSDT: null,
	ETHUSDT: null,
	BNBUSDT: null,
	XRPUSDT: null,
	ADAUSDT: null,
};

//
const orders: Orders[] = [];

//subscribe to redis channel
const subscriber = createClient({ url: "redis://localhost:6370" });
async function connectSubscriber() {
	await subscriber.connect();
	console.log("✅ Connected to Redis Subscriber");
	await subscriber.subscribe("trades", (message) => {
		const data = JSON.parse(message);

		ASSETS[data.asset as keyof WsData] = data.price;
	});
	console.log("READY TO TRADE !! Price updated");
}
connectSubscriber();

//in memory user store
const users: {
	username: string;
	password: string;
	balance: {
		USD: number;
		BTCUSDT: number;
		ETHUSDT: number;
		BNBUSDT: number;
		XRPUSDT: number;
		ADAUSDT: number;
	};
}[] = [
	{
		username: "ashin",
		password: "password",
		balance: {
			USD: 5000,
			BTCUSDT: 0,
			ETHUSDT: 0,
			BNBUSDT: 0,
			XRPUSDT: 0,
			ADAUSDT: 0,
		},
	},
];

// pool
const pool = new Pool({
	host: "localhost", // or your DB host
	port: 5432, // default Postgres port
	user: "postgres", // your username
	password: "pass", // your password
	database: "xness",
});

app.use(express.json());
const port = 3000;

app.post("/api/signup", (req, res) => {
	const parse = userSchema.safeParse(req.body);
	if (!parse.success) {
		return res.status(400).json({ error: parse.error });
	}

	const { username, password } = parse.data;

	// Check if user already exists
	const existingUser = users.find((user) => user.username === username);
	if (existingUser) {
		return res.status(409).json({ error: "User already exists" });
	}

	// Create new user
	const newUser = {
		username,
		password,
		balance: {
			usd: 5000,
			btc: 0,
		},
	};
	// users.push(newUser);
	return res.status(201).json({ message: "User created successfully" });
});

app.post("/api/signin", (req, res) => {
	const parse = userSchema.safeParse(req.body);
	if (!parse.success) {
		return res.status(400).json({ error: parse.error });
	}
	const { username, password } = parse.data;

	const existingUser = users.find((user) => user.username === username);
	if (!existingUser) {
		return res.status(404).json({ error: "User not found" });
	}

	if (existingUser.password !== password) {
		return res.status(401).json({ error: "Invalid password" });
	}
	return res.status(200).json({ message: "Signin successful" });
});

//should be verified using middleware
app.get("/api/balance/:username", (req, res) => {
	const { username } = req.params;

	if (!username) {
		return res.status(400).json({ error: "Username is required" });
	}

	const user = users.find((user) => user.username === username);
	if (!user) {
		return res.status(404).json({ error: "User not found" });
	}
	return res.status(200).json({ balance: user.balance });
});

app.post("/api/order/open", (req, res) => {
	const parse = orderSchema.safeParse(req.body);
	if (!parse.success) {
		return res.status(400).json({ error: parse.error });
	}
	// check if user exists //TODO:: actually done by middlewares
	const user = users.find((user) => user.username === parse.data.username);
	if (!user) {
		return res.status(404).json({ error: "User not found" });
	}
	// if its open for buy
	if (parse.data.type === "buy") {
		// check if has enough balance a
		if (
			user.balance.USD! <
			parse.data.qty * ASSETS[parse.data.asset as keyof WsData]!
		) {
			return res.status(400).json({ error: "Insufficient balance" });
		}
		// do operation
		user.balance.USD -=
			parse.data.qty * ASSETS[parse.data.asset as keyof WsData]!;
		user.balance[parse.data.asset as keyof WsData] += parse.data.qty;
		console.log(parse.data.qty * ASSETS[parse.data.asset as keyof WsData]!);
		orders.push({
			id: orderID++,
			username: user.username,
			type: parse.data.type,
			qty: parse.data.qty,
			asset: parse.data.asset,
			status: "open",
			createdAt: new Date(),
			updatedAt: new Date(),
		});
		return res.status(200).json({
			username: user.username,
			balance: user.balance,
		});
	} else {
		//TODO create selll
		return res.status(500).json({ msge: "feature is not implemented" });
	}
});

app.get("/api/orders/:username", (req, res) => {
	// Get all orders of user
	const { username } = req.params;

	// check if a user TODO:Done by middleware
	if (!username) {
		return res.status(400).json({ error: "Username is required" });
	}

	const userOrders = orders.filter((order) => order.username === username);
	return res.status(200).json({ orders: userOrders });
});

app.post("/api/order/close", (req, res) => {
	const { orderID, username } = req.body;
	//check if user exists
	const user = users.find((user) => user.username === username);
	if (!user) {
		return res.status(404).json({ error: "User not found" });
	}
	// if not order
	const order = orders.find((order) => order.id === orderID);
	if (!order) {
		return res.status(404).json({ error: "Order not found" });
	}
	// close the order
	if (order.type == "buy") {
		order.status = "closed";
		user.balance.USD += order.qty * ASSETS[order.asset as keyof WsData]!;
		user.balance[order.asset as keyof WsData]! -= order.qty;
		return res.status(200).json({ message: "Order closed successfully", user });
		// TODO: implement sell logic
	} else {
		// TODO: implement buy logic
        return res.status(500).json({ msge: "feature is not implemented" });
	}
});

// TODO: /api/trades/:asset/:time
app.get("/api/trades/:asset/:time", async (req, res) => {
	const { asset, time } = req.params;
	const table = `trades_${time}m`;

	try {
		const query = `SELECT * FROM ${table} WHERE asset = $1 ORDER BY timestamp ASC`;
		const { rows } = await pool.query(query, [asset]);
		return res.json(rows);
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error: "db query failed" });
	}
});

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`);
});
