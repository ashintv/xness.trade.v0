import { useBalanceStore, useCloseOrderStore, useOpenOrderStore } from "./../store/orderStore";
import { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { useEventStore } from "../store/useEventStore";
import app_api from "../lib/config";

export function useEventListener() {
	const setBalance = useBalanceStore((state) => state.setBalance);
	const setOpenOrders = useOpenOrderStore((state) => state.setOrders);
	const setClosedOrders = useCloseOrderStore((state) => state.setOrders);;
	useEffect(() => {
		async function callBack() {
			console.log("Refect due to evnt");
			const response = await app_api.get(`user/balance`, {
				headers: {
					Authorization: localStorage.getItem("token"),
				},
			});
			setBalance({
				tradable: 0,
				locked: 0,
			});

			const closed =await app_api.get(`trades/closed`, {
				headers:{
					Authorization: localStorage.getItem("token"),
				}
			})

			const opened = await app_api.get(`trades/open`, {
				headers:{
					Authorization: localStorage.getItem("token"),
				}
			})
			setOpenOrders(opened.data.trades );
			setClosedOrders(closed.data.trades);
			console.log("Refect compleates");
			console.log(opened.data);
			console.log(closed.data);
			return;

		}
		if (typeof window === "undefined") return;
		const token = localStorage.getItem("token");
		const evtSource = new EventSource(`http://localhost:3005/api/v1/events?token=${token}`);
		evtSource.onmessage = (onmessage) => {
			const data = JSON.parse(onmessage.data);
			toast.success(data.message);
			callBack().then(() => {
				console.log("Call vack compleates");
			});
		};
		evtSource.onerror = (err) => {
			console.error("SSE error:", err);
			evtSource.close();
		};
		return () => {
			evtSource.close();
		};
	}, []);
}
