import { Balance } from "../componets/balance";

export interface Order {
	id: number;
	asset: string;
	status: "open" | "closed";
	type: "long" | "short";
	qty: number;
	price: number;
	OpenPrice: number;
	ClosePrice: number;
	pl: number;
	takeProfit: number | null;
	stopLoss: number | null;
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

export interface OrderStoreState {
	orders: Order[];
	setOrders: (orders: Order[]) => void;
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
