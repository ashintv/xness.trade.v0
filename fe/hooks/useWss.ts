'use client'
import { restoreValue } from "../lib/utils/RoundN";
import { Trade } from "./../lib/types";
import { useEffect, useState, useRef } from "react";

export function useWss() {
	const [price, setPrice] = useState<Trade>({});
	const prev = useRef<Trade>({});
	useEffect(() => {
		const socket = new WebSocket(process.env.WSS_URL || "ws://localhost:8081");
		socket.onmessage = (event) => {
			const message = JSON.parse(event.data);
			const asset = message?.asset;
			const price = restoreValue(message?.price, message.decimal);
			const ts = restoreValue(message?.ts, message.decimal);
			const ask = restoreValue(message?.ask, message.decimal);
			const bid = restoreValue(message?.bid, message.decimal);
			const previousAsk = restoreValue(prev.current?.[asset as keyof Trade]?.ask || 0, message.decimal);
			const previousBid = restoreValue(prev.current?.[asset as keyof Trade]?.bid || 0, message.decimal);
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
				[asset]: curr,
			}));

			prev.current = {
				...prev.current,
				[asset]: curr,
			};
		};

		return () => {
			socket.close();
		};
	}, []);
	return price;
}
