import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { BalanceState, UserstoreState } from "../lib/types";

export const useUserStore = create<UserstoreState>()(
	persist(
		(set) => ({
			username: "",
			setUsername: (username) => set({ username }),
		}),
		{
			name: "user-storage",
			storage: createJSONStorage(() => localStorage),
		}
	)
)