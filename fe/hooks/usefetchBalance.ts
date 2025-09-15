import { useEffect, useState } from "react";
import { useUserStore } from "../store/userStore";
import { useBalanceStore } from "../store/orderStore";
import app_api from "../lib/config";

export function useFetchBalance() {
	const setBalance = useBalanceStore((state) => state.setBalance);
	useEffect(() => {
		async function fetchData() {
			const response = await app_api.get(`user/balance`, {
				headers: {
					Authorization: localStorage.getItem("token"),
				},
			});

			setBalance({
				tradable: response.data.balance.usd_balance,
				locked: response.data.balance.locked_balance,
			});
			console.log("Fetched balance:", response.data);
		}
		fetchData();
	}, []);
}
