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
	BTCUSDT: {
		ask: null,
		bid: null,
	},
	ETHUSDT: {
		ask: null,
		bid: null,
	},
	BNBUSDT: {
		ask: null,
		bid: null,
	},
	XRPUSDT: {
		ask: null,
		bid: null,
	},
	ADAUSDT: {
		ask: null,
		bid: null,
	},
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
		ASSETS[data.asset as keyof WsData]["ask"] = data.ask;
		ASSETS[data.asset as keyof WsData]["bid"] = data.bid;
		orders.forEach((order) => {
			if (order.status === "open") {
				const asset = order.asset as keyof WsData;
				const askPrice = ASSETS[asset]["ask"];
				const bidPrice = ASSETS[asset]["bid"];
				let pNl = 0;
				if (order.type === "long") {
					pNl = (bidPrice! - order.OpenPrice) * order.qty * order.leverage;
				} else {
					pNl = (order.OpenPrice - askPrice!) * order.qty * order.leverage;
				}
				if (order.takeProfit && pNl >= order.takeProfit) {
					order.ClosePrice = order.type === "long" ? bidPrice! : askPrice!;
					order.status = "closed";
					const user = users.find((u) => u.username === order.username);
					if (user) {
						user.balance.locked -= order.margin;
						user.balance.tradable += order.margin + pNl;
						console.log(`User ${user.username} TakesProfit $${pNl} new balance: ${user.balance}`);
					}
				}
				if (order.stopLoss && pNl <= -order.stopLoss) {
					order.ClosePrice = order.type === "long" ? bidPrice! : askPrice!;
					order.status = 'closed';
					const user = users.find((u) => u.username === order.username);
					if (user) {
						user.balance.locked -= order.margin;
						user.balance.tradable += order.margin + pNl;
						console.log(`User ${user.username} StopLoss $${pNl} new balance: ${user.balance}`);
					}
				}

				if (pNl <= -order.margin * 0.95) {
					order.status = "closed";
					order.ClosePrice = order.type === "long" ? bidPrice! : askPrice!;
					order.pl = pNl;
					const user = users.find((u) => u.username === order.username);
					if (user) {
						user.balance.locked -= order.margin;
						user.balance.tradable += order.margin + pNl;
						console.log(`User ${user.username} new balance: ${user.balance}`);
					}
					console.log(`Order closed: ${JSON.stringify(order)} LIQUIDATED!!!!!`);
					console.log(
						`Open Price: ${order.OpenPrice}, Spot Price: ${order.ClosePrice}`
					);
					console.log(`PNL: ${pNl}`);
				}
			}
		});
	});
	console.log("READY TO TRADE !! Price updated");
}
connectSubscriber();

//in memory user store
const users: {
	username: string;
	password: string;
	balance: {
		tradable: number;
		locked: number;
	};
}[] = [
	{
		username: "ashin",
		password: "password",
		balance: {
			tradable: 5000,
			locked: 0,
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
	return res
		.status(200)
		.json({ username: existingUser.username, balance: existingUser.balance });
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
	const asset = parse.data.asset as keyof WsData;
	if (parse.data.type === "long") {
		const askPrice = ASSETS[asset]["ask"]!;
		const margin = (parse.data.qty * askPrice) / parse.data.leverage;
		// check if has enough balance
		if (user.balance.tradable <= margin) {
			console.log("insufficient balance");
			return res.status(400).json({ error: "Insufficient balance" });
		}
		// do operation

		user.balance.tradable -= margin;
		user.balance.locked += margin;
		orders.push({
			id: orderID++,
			username: user.username,
			type: "long",
			qty: parse.data.qty,
			asset: parse.data.asset,
			OpenPrice: askPrice,
			status: "open",
			createdAt: new Date(),
			updatedAt: new Date(),
			margin,
			leverage: parse.data.leverage,
		});
		return res.status(200).json({
			username: user.username,
			balance: user.balance,
		});
	} else if (parse.data.type === "short") {
		const bidPrice = ASSETS[asset]["bid"]!;
		const margin = (parse.data.qty * bidPrice) / parse.data.leverage;
		user.balance.tradable -= margin;
		user.balance.locked += margin;
		orders.push({
			id: orderID++,
			username: user.username,
			type: "short",
			qty: parse.data.qty,
			asset: parse.data.asset,
			OpenPrice: bidPrice,
			status: "open",
			createdAt: new Date(),
			updatedAt: new Date(),
			margin,
			leverage: parse.data.leverage,
			takeProfit: parse.data.takeProfit,
			stopLoss: parse.data.stopLoss,
		});
		return res.status(200).json({
			username: user.username,
			balance: user.balance,
		});
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
	if (order.status == "closed") {
		return res.status(400).json({ error: "Order is already closed" });
	}
	const asset = order.asset as keyof WsData;
	if (order.type == "long") {
		const closePrice = ASSETS[asset]["bid"]!;

		order.status = "closed";
		order.updatedAt = new Date();
		order.ClosePrice = closePrice;

		const pnl = (closePrice - order.OpenPrice) * order.qty * order.leverage;
		order.pl = pnl;
		user.balance.locked -= order.margin;
		user.balance.tradable += order.margin + pnl;

		return res.status(200).json({ message: "Order closed successfully", user });
	} else if (order.type == "short") {
		const closePrice = ASSETS[asset]["ask"]!;
		order.status = "closed";
		order.updatedAt = new Date();
		order.ClosePrice = closePrice;

		const pnl = (order.OpenPrice - closePrice) * order.qty * order.leverage;
		order.pl = pnl;
		user.balance.locked -= order.margin;
		user.balance.tradable += order.margin + pnl;
		return res.status(200).json({ message: "Order closed successfully", user });
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
