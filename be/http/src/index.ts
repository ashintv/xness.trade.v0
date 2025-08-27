import express from "express";
import { Pool } from "pg";
import cors from "cors";
import jwt from "jsonwebtoken";
import { orderSchema, userSchema } from "./schema";

const app = express();
app.use(cors());

//in memory user store
const users: {
	username: string;
	password: string;
	balance: {
		usd: number;
		btc: number;
	};
}[] = [];

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
	users.push(newUser);
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
	/*req = {
        type: "buy" | "sell",
        qty: number,
        asset: string,
        stopLoss?: number,
        takeProfit?: number
    }
     */

	const parse = orderSchema.safeParse(req.body);
    if (!parse.success) {
        return res.status(400).json({ error: parse.error });
    }

	return res.status(200).json({
		orderId: 12345,
		balance: {
			usd: 5000,
			btc: 0,
		},
	});
});

app.get("/api/orders/", (req, res) => {
	// Get all orders
	return res.status(200).json({ orders: [] });
});

app.post("/api/order/close", (req, res) => {});

// TODO: /api/trades/:asset/:time
app.get("/api/trades/:time", async (req, res) => {
	const { time } = req.params;

	const table = `trades_${time}m`;

	try {
		const query = `SELECT * FROM ${table} WHERE asset = $1 ORDER BY timestamp ASC`;
		const { rows } = await pool.query(query, ["BTCUSDT"]);
		return res.json(rows);
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error: "db query failed" });
	}
});

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`);
});
