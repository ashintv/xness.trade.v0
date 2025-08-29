import { create } from "zustand";
import { Balance, BalanceState, OrderStoreState } from "../lib/types";


export const useOrderStore = create<OrderStoreState>()(
	(set) => ({
		orders: [],
		setOrders: (orders) => set({ orders }),
	})
);


export const useBalanceStore = create<BalanceState>()(
	(set) => ({
		balance: {
			tradable: 0,
			locked: 0,
		},
		setBalance: (balance: Balance) => set({ balance }),
	})
);