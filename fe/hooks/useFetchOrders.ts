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
	const url = process.env.BACKEND_URL || `http://localhost:3000/api`;
	const fetchData = async () => {
		const res = await axios.get(`${url}/orders`, {
			headers: {
				Authorization: localStorage.getItem("token"),
			},
		});
		setOrders(res.data.orders);
	};

	useEffect(() => {
		if (!username) return;
		const interval = setInterval(() => {
			fetchData();
		}, 1000);
		return () => clearInterval(interval);
	}, [username]);
}
