import { Response } from "express";
import { z} from 'zod'
import { openTradeSchema } from "../schema/v0";

export interface UserBalance {
	usd_balance: number;
	locked_balance: number;
}

export interface User {
	email: string;
	password: string;
	userId: string;
	balance: UserBalance;
	res?: Response;
}

interface Order {
	userId: string;
	orderId: string;
	asset: "BTCUSDT" | "ETHUSDT" | "XRPUSDT" | "ADAUSDT" | "BNBUSDT";
	type: "buy" | "sell";
	takeProfit: number | null;
	stopLoss: number | null;
	qty: number;
}

export interface OpenOrder extends Order {
	margin: number;
	leverage: number;
	openPrice: number;
}

export interface ClosedOrder extends OpenOrder {
	closePrice: number;
	pnl: number;
	cause: "takeProfit" | "stopLoss" | "liquidation" | "user_closed";
}

export interface Asset {
	BTCUSDT: price;
	ETHUSDT: price;
	BNBUSDT: price;
	XRPUSDT: price;
	ADAUSDT: price;
}

interface price {
	ask: number | null;
	bid: number | null;
}

export interface NotificationType {
	email:string
	message: string;
	type: "confirmation" | "notification";
	balance: UserBalance;
	orderId: string;
}

export type OpenOrderRequest = z.infer<typeof openTradeSchema>;
