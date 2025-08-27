
export interface WsData {
	BTCUSDT: number | null;
	ETHUSDT: number | null;
	BNBUSDT: number | null;
	XRPUSDT: number | null;
	ADAUSDT: number | null;
}


export interface Orders {
    id: number;
    username: string;
    type: "buy" | "sell";
    qty: number;
    asset: string;
    status: "open" | "closed";
    createdAt: Date;
    updatedAt: Date;
}
