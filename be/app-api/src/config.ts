
import { createClient } from "redis";
import { ClosedOrder, OpenOrder, User } from "./types/v0-types";
import dotenv from "dotenv";
import { redisSubscriber } from "./classses/redisSubscriber";
dotenv.config();

export const users_v0: User[] = [];

export const open_orders_v0: OpenOrder[] = [];

export const closed_orders_v0: ClosedOrder[] = [];

export const JWT_SECRET = process.env.JWT_SECRET;

export const redisClient = createClient({ url: "redis://localhost:6370" });

export const selectTradesQuery =
	"SELECT * FROM %s WHERE symbol = %L AND timestamp BETWEEN to_timestamp(%s / 1000) AND to_timestamp(%s / 1000) ORDER BY timestamp ASC";

export const AssetMeddata = {
	BTCUSDT: {
		name: "Bitcoin",
		imageUrl: "image_url",
        decimals: 8
	},
	ETHUSDT: {
		name: "Ethereum",
		imageUrl: "image_url",
		decimals: 8
	},
	BNBUSDT: {
		name: "BNB",
		imageUrl: "image_url",
		decimals: 8
	},
	XRPUSDT: {
		name: "XRP",
		imageUrl: "image_url",
		decimals: 8
	},
	ADAUSDT: {
		name: "Cardano",
		imageUrl: "image_url",
		decimals: 8
	},
};
