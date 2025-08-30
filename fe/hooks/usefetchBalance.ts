import axios from "axios";
import { useEffect, useState } from "react";
import { useUserStore } from "../store/userStore";
import { useBalanceStore } from "../store/orderStore";
import toast from "react-hot-toast";

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
			const  notification  = response.data.notification;
			setBalance(response.data.balance);
			notification.map(
				(item: { type: "error" | "info" | "success"; message: string }) => {
					if (item.type === "error") {
						toast.error(item.message);
					} else if (item.type === "info") {
						toast(item.message);
					} else if (item.type === "success") {
						toast.success(item.message);
					}
				}
			);
		}
		fetchData();
		const interval = setInterval(fetchData, 1000);
		return () => clearInterval(interval);
	}, [username]);
}
