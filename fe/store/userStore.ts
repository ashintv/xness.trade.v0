import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface Balance {
	USD: number;
	BTCUSDT: number;
	ETHUSDT: number;
	BNBUSDT: number;
	XRPUSDT: number;
	ADAUSDT: number;
}

interface UserstoreState {
	username: string | null;
	setUsername: (username: string) => void;
	balance: Balance;
	setBalance: (balance: Balance) => void;
}

export const useUserStore = create<UserstoreState>()(
	persist(
		(set) => ({
			username: null,
			setUsername: (username) => set({ username }),
			balance: {
				USD: 0,
				BTCUSDT: 0,
				ETHUSDT: 0,
				BNBUSDT: 0,
				XRPUSDT: 0,
				ADAUSDT: 0,
			},
			setBalance: (balance) => set({ balance }),
		}),
		{
			name: "user-storage", // ⚡ better naming than "food-storage"
			storage: createJSONStorage(() => sessionStorage),
		}
	)
);
