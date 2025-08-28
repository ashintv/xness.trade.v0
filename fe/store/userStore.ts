import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { UserstoreState } from "../lib/types";




export const useUserStore = create<UserstoreState>()(
	persist(
		(set) => ({
			username: null,
			setUsername: (username) => set({ username }),
			balance: {
				tradable: 0,
				locked: 0,
			},
			setBalance: (balance) => set({ balance }),
		}),
		{
			name: "user-storage", // ⚡ better naming than "food-storage"
			storage: createJSONStorage(() => sessionStorage),
		}
	)
);
