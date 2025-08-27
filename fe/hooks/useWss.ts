"use client";
import { useEffect, useState, useRef } from "react";
import { AssetData } from "../store/priceStore";


export function useWss(url: string) {
	const [price, setPrice] = useState<Record<string, AssetData>>({});
	const prev = useRef<Record<string, AssetData>>({});
	useEffect(() => {
		const socket = new WebSocket(url);
		socket.onmessage = (event) => {
			const message = JSON.parse(event.data);
			const asset = message?.asset;
			const price = message?.price;
			const ts = message?.ts;
			const ask = message?.ask;
			const bid = message?.bid;


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


			setPrice((prev) => ({
				...prev,
				[asset]: curr
			}));

			prev.current = {
				...prev.current,
				[asset]: curr
			};
		};

		return () => {
			socket.close();
		};
	}, [url]);
	return price;
}

