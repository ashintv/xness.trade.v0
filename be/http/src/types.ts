
export interface WsData {
	BTCUSDT: price 
	ETHUSDT: price 
	BNBUSDT: price 
	XRPUSDT: price 
	ADAUSDT: price 
}

interface price {
    ask: number | null,
    bid:number | null
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
    OpenPrice: number;
    ClosePrice?: number;
    pl?: number;
    margin: number;
}
