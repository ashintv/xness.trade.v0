import express from "express";
import { z } from "zod";
import { Pool } from "pg";
import cors from "cors";
import jwt from "jsonwebtoken";

const app = express();
app.use(cors());
const users : {
    username: string;
    password: string;
    balance: {
        usd: number;
        btc: number;

    };
}[] = [];

app.use(express.json());
const port = 3000;

app.post('/api/signup', (req, res) => {
    const { username, password } = req.body;

    // Basic validation
    if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
    }

    // Check if user already exists
    const existingUser = users.find(user => user.username === username);
    if (existingUser) {
        return res.status(409).json({ error: "User already exists" });
    }

    // Create new user
    const newUser = {
        username,
        password,
        balance: {
            usd: 5000,
            btc: 0
        }
    };
    users.push(newUser);
    return res.status(201).json({ message: "User created successfully" });
});


app.post('/api/signin', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
    }

    const existingUser = users.find(user => user.username === username);
    if (!existingUser) {
        return res.status(404).json({ error: "User not found" });
    }

    if (existingUser.password !== password) {
        return res.status(401).json({ error: "Invalid password" });
    }

    return res.status(200).json({ message: "Signin successful" });
});






const pool = new Pool({
	host: "localhost", // or your DB host
	port: 5432, // default Postgres port
	user: "postgres", // your username
	password: "pass", // your password
	database: "xness",
});

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
