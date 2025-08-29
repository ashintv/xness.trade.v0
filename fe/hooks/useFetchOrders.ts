import { Balance } from "./../lib/types";
import { useEffect } from "react";
import { useOrderStore } from "../store/orderStore";
import axios from "axios";

export function useFetchOrders({
	username,
}: {
	username: string | null;
	balance: Balance;
}) {
	const setOrders = useOrderStore((state) => state.setOrders);
	const fetchData = async () => {
		if (!username) {
			alert("No username provided");
			return;
		}
		const res = await axios.get(`http://localhost:3000/api/orders/${username}`);
		setOrders(res.data.orders);
	};

	useEffect(() => {
		const interval = setInterval(() => {
			fetchData();
		}, 1000);
		return () => clearInterval(interval);
	}, []);
}
