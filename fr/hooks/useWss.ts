'use client'
import { profile } from "console";
import { useEffect, useState } from "react";

export function useWss(url: string) {
	const [data, setData] = useState< any >(null);
    let prev:any  = null;
	useEffect(() => {
		const socket = new WebSocket(url);
		socket.onmessage = (event) => {
			const message = JSON.parse(event.data);
			setData({
				time: new Date(message?.ts).toLocaleTimeString(),
				asset: message?.asset,
				price: message?.price,
                profit: message?.price - (prev?.price || 0)
			});
            prev = message;
		};
		return () => {
			socket.close();
		};
	}, [url]);
	return data;
}
