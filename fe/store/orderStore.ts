import { create } from "zustand";
import { Balance, BalanceState, ClosedOrderState, OpenOrderState } from "../lib/types";


export const useOpenOrderStore = create<OpenOrderState>()(
	(set) => ({
		orders: [],
		setOrders: (orders) => set({ orders }),
	})
);

export const useCloseOrderStore = create<ClosedOrderState>()(
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