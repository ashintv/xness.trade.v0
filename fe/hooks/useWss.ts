"use client";
import { useEffect, useState, useRef } from "react";

export function useWss(url: string) {
	const [data, setData] = useState<Record<string, AssetData>>({});
	const prev = useRef<Record<string, AssetData>>({});

	const round2 = (num: number) => Math.round(num * 100) / 100;

	useEffect(() => {
		const socket = new WebSocket(url);
		socket.onmessage = (event) => {
			const message = JSON.parse(event.data);
			const asset = message?.asset;
			const price = message?.price;
			const ts = message?.ts;

			// calculate bid/ask (5% spread just as example)
			const ask = round2(price + 0.05 * price);
			const bid = round2(price - 0.05 * price);

			const previousAsk = prev.current[asset]?.ask || 0;
			const previousBid = prev.current[asset]?.bid || 0;

			const curr = {
				time: new Date(ts).toLocaleTimeString(),
				asset,
				price,
				ask,
				bid,
				profitAsk: previousAsk ? ask - previousAsk : 0,
				profitBid: previousBid ? bid - previousBid : 0,
			};

			setData((old) => ({
				...old,
				[asset]: curr,
			}));

			// store calculated values for next tick
			prev.current = {
				...prev.current,
				[asset]: curr
			};
		};

		return () => {
			socket.close();
		};
	}, [url]);

	return data;
}

interface AssetData {
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
