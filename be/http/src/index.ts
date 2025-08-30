import express from "express";
import { Pool } from "pg";
import cors from "cors";
import jwt from "jsonwebtoken";
import { orderSchema, userSchema } from "./schema";
import { NotificationType, Orders, WsData } from "./types";
import { createClient } from "redis";
import {
	DB_HOST,
	DB_NAME,
	DB_PASSWORD,
	DB_PORT,
	DB_USER,
	JWT_SECRET,
} from "./config";
import { authMiddleware } from "./middlewares/auth-middleware";
const app = express();
app.use(cors());

app.use(express.json());


let orderID = 1;
let userCounter = 0;
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
					order.pl = pNl;
					const user = users.find((u) => u.username === order.username);
					if (user) {
						user.balance.locked -= order.margin;
						user.balance.tradable += order.margin + pNl;
						user.notification.push({
							type: "info",
							message: `Order ${order.id} closed, Pnl ${order.pl} Caused by Take Profit`,
						});
						console.log(
							`User ${user.username} TakesProfit $${pNl} new balance: ${user.balance}`
						);
					}
				}
				if (order.stopLoss && pNl <= -order.stopLoss) {
					order.ClosePrice = order.type === "long" ? bidPrice! : askPrice!;
					order.status = "closed";
					order.pl = pNl;
					
					const user = users.find((u) => u.username === order.username);
					if (user) {
						user.balance.locked -= order.margin;
						user.balance.tradable += order.margin + pNl;
						user.notification.push({
							type: "info",
							message: `Order ${order.id} closed, Pnl ${order.pl} Caused by Stop Loss`,
						});
						console.log(
							`User ${user.username} StopLoss $${pNl} new balance: ${user.balance}`
						);
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
						user.notification.push({
							type: "info",
							message: `Order ${order.id} closed, Pnl ${order.pl} Caused by Liquidation`,
						});
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
	id: string;
	username: string;
	password: string;
	notification: NotificationType[];
	balance: {
		tradable: number;
		locked: number;
	};
}[] = [
	{
		id: "1ashin",
		username: "ashin",
		password: "password",
		notification: [],
		balance: {
			tradable: 5000,
			locked: 0,
		},
	},
];

// pool
const pool = new Pool({
	host: DB_HOST,
	port: DB_PORT ? parseInt(DB_PORT) : 5432,
	user: DB_USER,
	password: DB_PASSWORD,
	database: DB_NAME,
});

app.use(express.json());
const port = 3000;

app.post("/api/signup", (req, res) => {
	const parse = userSchema.safeParse(req.body);
	if (!parse.success) {
		return res.status(400).json({ message: "Error while signing up" });
	}
	const { username, password } = parse.data;
	const existingUser = users.find((user) => user.username === username);
	if (existingUser) {
		console.log(`User ${username} already exists`);
		return res.status(403).json({ message: "Error while signing up" });
	}
	userCounter++;
	const id = userCounter + username;
	users.push({
		id,
		username,
		password,
		notification: [],
		balance: {
			tradable: 5000,
			locked: 0,
		},
	});
	console.log(`User ${username} signed up successfully`);
	console.log(users);
	return res.status(201).json({ userId: id });
});

app.post("/api/signin", (req, res) => {
	const parse = userSchema.safeParse(req.body);
	if (!parse.success) {
		return res.status(400).json({ error: parse.error });
	}
	const { username, password } = parse.data;
	const existingUser = users.find((user) => user.username === username);
	if (!existingUser) {
		console.log(`User ${username} not found`);
		return res.status(403).json({ message: "Incorrect credentials" });
	}
	if (existingUser.password !== password) {
		console.log(` ${password} provided invalid password`);
		return res.status(403).json({ message: "Incorrect credentials" });
	}
	// CHANGE IN REQUIRED RESPONSE FROM SCHEMA
	const token = jwt.sign({ username }, JWT_SECRET!);
	return res
		.status(200)
		.json({ token, username: username, balance: existingUser.balance });
});

app.get("/api/balance/", authMiddleware, (req, res) => {
	//@ts-ignore
	const username = req.username;
	console.log(username)
	const user = users.find((user) => user.username === username);
	if (!user) {
		return res.status(404).json({ error: "User not found" });
	}
	const notification = user.notification;
	user.notification = [];
	return res.status(200).json({ balance: user.balance, notification });
});

app.post("/api/order/open", authMiddleware, (req, res) => {
	const parse = orderSchema.safeParse(req.body);
	if (!parse.success) {
		return res.status(400).json({ error: parse.error });
	}
	//@ts-ignore
	const user = users.find((user) => user.username === req.username);
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
			takeProfit: parse.data.takeProfit == 0 ? null : parse.data.takeProfit!,
			stopLoss: parse.data.stopLoss == 0 ? null : parse.data.stopLoss!,
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
			takeProfit: parse.data.takeProfit == 0 ? null : parse.data.takeProfit!,
			stopLoss: parse.data.stopLoss == 0 ? null : parse.data.stopLoss!,
		});
		return res.status(200).json({
			username: user.username,
			balance: user.balance,
		});
	}
});

app.get("/api/orders/", authMiddleware, (req, res) => {
	//@ts-ignore
	const username = req.username;
	const userOrders = orders.filter((order) => order.username === username);
	return res.status(200).json({ orders: userOrders});
});

app.post("/api/order/close", authMiddleware, (req, res) => {
	const { orderID } = req.body;
	//@ts-ignore
	const user = users.find((user) => user.username === req.username);
	if (!user) {
		return res.status(404).json({ error: "User not found" });
	}

	const order = orders.find((order) => order.id === orderID);
	if (!order) {
		return res.status(404).json({ error: "Order not found" });
	}

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
