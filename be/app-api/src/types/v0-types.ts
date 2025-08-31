
import z from "zod";
import { extendedUserSchema } from "../schema/v0";


export type User = z.infer<typeof extendedUserSchema>;
interface Order {
    userId: string;
	orderId: string;
	asset: "BTCUSDT" | "ETHUSDT" | "XRPUSDT" | "ADAUSDT" | "BNBUSDT";
	type: "buy" | "sell";
	takeProfit: number | null;
	stopLoss: number | null;
	qty: number;
};

export interface OpenOrder extends Order {
	margin: number,
	leverage: number,
	openPrice: number
   
};

export interface ClosedOrder extends OpenOrder {
	closePrice: number;
	pnl: number;
	cause: "takeProfit" | "stopLoss" | "liquidation";

};

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