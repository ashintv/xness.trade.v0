import { create } from "zustand";
import { OrderStoreState } from "../lib/types";


export const useOrderStore = create<OrderStoreState>()(
	(set) => ({
		orders: [],
		setOrders: (orders) => set({ orders }),
	})
);
