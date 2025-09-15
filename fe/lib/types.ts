import { Balance } from "../componets/balance";

export interface OpenOrder {
	id: number;
	asset: string;
	type: "buy" | "sell";
	qty: number;
	price: number;
	OpenPrice: number;
	takeProfit: number | null;
	stopLoss: number | null;
}

interface ClosedOrder extends OpenOrder {
	ClosePrice: number;
	pl: number;
}

export interface Balance {
	tradable: number;
	locked: number;
}

export interface UserstoreState {
	username: string;
	setUsername: (username: string) => void;
}

export interface BalanceState {
	balance: Balance;
	setBalance: (balance: Balance) => void;
}

export interface OpenOrderState {
	orders: OpenOrder[];
	setOrders: (orders: OpenOrder[]) => void;
}

export interface ClosedOrderState {
	orders: ClosedOrder[];
	setOrders: (orders: ClosedOrder[]) => void;
}

export interface AssetData {
	time: string;
	asset: string;
	price: number;
	ask: number;
	bid: number;
	profitBid: number;
	profitAsk: number;
}

export interface Trade {
	BTCUSDT?: AssetData;
	ETHUSDT?: AssetData;
	BNBUSDT?: AssetData;
	XRPUSDT?: AssetData;
	ADAUSDT?: AssetData;
}
