"use client";
import { useEffect, useState, useRef } from "react";

export function useWss(url: string) {
	const [data, setData] = useState<Record<string, AssetData>>({});
	const prev = useRef<Record<string, AssetData>>({});

	useEffect(() => {
		const socket = new WebSocket(url);

		socket.onmessage = (event) => {
			const message = JSON.parse(event.data);
			const asset = message?.asset;
			const price = message?.price;
			const ts = message?.ts;

			const previousPrice = prev.current[asset]?.price || 0;

			setData((old) => ({
				...old,
				[asset]: {
					time: new Date(ts).toLocaleTimeString(),
					asset,
					price,
					profit: previousPrice ? price - previousPrice : 0,
				},
			}));

			// update the ref so it's persistent
			prev.current = {
				...prev.current,
				[asset]: message,
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
	profit: number;
}

interface WsData {
	BTCUSDT: AssetData;
	ETHUSDT: AssetData;
	BNBUSDT: AssetData;
	XRPUSDT: AssetData;
	ADAUSDT: AssetData;
}
