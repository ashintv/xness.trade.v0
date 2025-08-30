import axios from "axios";
import { useEffect } from "react";
import { useUserStore } from "../store/userStore";
import { useBalanceStore } from "../store/orderStore";

export function useFetchBalance() {
	const username = useUserStore((state) => state.username);
	const setBalance = useBalanceStore((state) => state.setBalance);
	const backend_url = process.env.BACKEND_URL || "http://localhost:3000/api";
	useEffect(() => {
		if (!username) return;
		async function fetchData() {
			const response = await axios.get(`${backend_url}/balance`, {
				headers: {
					Authorization: localStorage.getItem("token"),
				},
			});
			setBalance(response.data.balance);
		}
		fetchData();
		const interval = setInterval(fetchData, 1000);
		return () => clearInterval(interval);
	}, [username]);
}
