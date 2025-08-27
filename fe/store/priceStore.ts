import {create} from "zustand";



interface PriceStoreState {
    prices: Record<string, AssetData>;
    setPrice: (symbol: string, data: AssetData) => void;
}

export const usePriceStore = create<PriceStoreState>()((set) => ({
    prices: {
        BTCUSDT: { time: "", asset: "BTCUSDT", price: 0, ask: 0, bid: 0, profitBid: 0, profitAsk: 0 },
        ETHUSDT: { time: "", asset: "ETHUSDT", price: 0, ask: 0, bid: 0, profitBid: 0, profitAsk: 0 },
        BNBUSDT: { time: "", asset: "BNBUSDT", price: 0, ask: 0, bid: 0, profitBid: 0, profitAsk: 0 },
        XRPUSDT: { time: "", asset: "XRPUSDT", price: 0, ask: 0, bid: 0, profitBid: 0, profitAsk: 0 },
        ADAUSDT: { time: "", asset: "ADAUSDT", price: 0, ask: 0, bid: 0, profitBid: 0, profitAsk: 0 },
    },
    setPrice: (symbol, data) => set((state) => ({
        prices: {
            ...state.prices,
            [symbol]: data
        }
    }))
}))

export interface AssetData {
	time: string;
	asset: string;
	price: number;
	ask: number;
	bid: number;
	profitBid: number;
	profitAsk: number;
}

interface WsData {
	BTCUSDT: AssetData;
	ETHUSDT: AssetData;
	BNBUSDT: AssetData;
	XRPUSDT: AssetData;
	ADAUSDT: AssetData;
}
