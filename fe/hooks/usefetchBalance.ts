import axios from "axios";
import { useEffect } from "react";
import { useUserStore } from "../store/userStore";

export function useFetchBalance() {
    const username = useUserStore((state) => state.username);
    const setBalance = useUserStore((state) => state.setBalance);
    async function fetchData() {
        const response = await axios.get(`http://localhost:3000/api/balance/${username}`);
        setBalance(response.data.balance);
    }
    useEffect(() => {
        const interval = setInterval(() => {
            fetchData();
        }, 1000);
        return () => clearInterval(interval);
    }, []);
}