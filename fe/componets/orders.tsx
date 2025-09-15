import { useEffect, useState } from "react";
import { useUserStore } from "../store/userStore";
import axios from "axios";
import { AssetData, OpenOrder, Trade } from "../lib/types";
import { useBalanceStore, useCloseOrderStore, useOpenOrderStore } from "../store/orderStore";
import toast from "react-hot-toast";
import { useEventListener } from "../hooks/useEventLister";

export function Orders({ trade }: { trade: Trade }) {
	const orders:any = [];
	const balance = useBalanceStore((state) => state.balance);
	const username = useUserStore((state) => state.username);
	
	const OpenOrders = useOpenOrderStore((state) => state.orders);
	const closedOrders = useCloseOrderStore((state) => state.orders);
	const [filter, setFilter] = useState<"open" | "closed" | "all">("open");
	const now = useEventListener();



	function calculatePL(order: OpenOrder): number {
		const tradeData = trade[order.asset as keyof Trade];
		if (!tradeData) return 0;
		const currentPrice = tradeData.bid;
		const qty = order.qty;
		if (order.type === "buy") {
			return (currentPrice - order.OpenPrice) * qty;
		} else if (order.type === "sell") {
			return (order.OpenPrice - currentPrice) * qty;
		}
		return 0;
	}
	return (
		<div className="rounded-xl mt-10 shadow-lg w-full border-black border  ">
			<div className="flex items-center  p-2 rounded-md text-xs px-5 text-blue-400">
				<div className="text-bold  w-1/9">ASSET</div>
				<div className="text-bold w-1/9">QT</div>
				<div className="text-bold w-1/9">TYPE</div>
				<div className="text-bold w-1/9">OP</div>
				<div className="text-bold w-1/9">CP</div>
				<div className="text-bold w-1/9">TP</div>
				<div className="text-bold w-1/9">SL</div>
				<div className="text-bold w-1/9">P/L</div>
				<div
					className={`text-bold w-1/7 text-underline hover:cursor-pointer hover:text-yellow-300 ${
						filter === "open" ? "text-blue-500" : "text-gray-500"
					}`}>
					<select value={filter} onChange={(e) => setFilter(e.target.value as "open" | "closed" | "all")}>
						<option value="open">Opened</option>
						<option value="closed">Closed</option>
						<option value="all">All</option>
					</select>
				</div>
			</div>

			<div className="h-[200px] overflow-y-auto space-y-1 ">
				{OpenOrders
					.map((order, index) => (
						<OrderRow
							key={index}
							status={"open"}
							id={order.id}
							asset={order.asset}
							qty={Number(order.qty.toString().slice(0,3))}
							OpenPrice={order.OpenPrice}
							type={order.type === "buy" ? "long" : "short"}
							takeProfit={order.takeProfit}
							stopLoss={order.stopLoss}
							CurrentPrice={order.OpenPrice}
							pl={calculatePL(order)}
						/>
					))}
			</div>
		</div>
	);
}

function OrderRow({
	id,
	asset,
	qty,
	OpenPrice,
	CurrentPrice,
	pl,
	type,
	status,
	takeProfit,
	stopLoss,
}: {
	id: number;
	asset: string;
	qty: number;
	OpenPrice: number;
	CurrentPrice: number;
	pl: number;
	type: "long" | "short";
	status: "open" | "closed";
	takeProfit: number | null;
	stopLoss: number | null;
}) {
	const username = useUserStore((state) => state.username);
	const setBalance = useBalanceStore((state) => state.setBalance);
	async function handleClose(id: number) {
		const url = process.env.BACKEND_URL || `http://localhost:3000/api`;
		try {
			const res = await axios.post(
				`${url}/order/close`,
				{
					orderID: id,
					username,
				},
				{
					headers: {
						Authorization: localStorage.getItem("token"),
					},
				}
			);
			setBalance(res.data.user.balance);
			toast.success("Order closed successfully!");
		} catch (err) {
			console.error(err);
		}
		// Close the order
	}
	return (
		<div className="flex items-center  p-2 border-b border-gray-950 text-xs px-5 ">
			<div className="text-bold text-yellow-300 w-1/9">{asset}</div>
			<div className="text-bold w-1/9">{qty}</div>
			<div className="text-bold w-1/9">{type == "long" ? "Long" : "Short"}</div>
			<div className="text-bold w-1/9">{OpenPrice}</div>
			<div className="text-bold w-1/9">{CurrentPrice}</div>
			<div className="text-bold w-1/9">{takeProfit ? takeProfit : "N/A"}</div>
			<div className="text-bold w-1/9">{stopLoss ? stopLoss : "N/A"}</div>
			<div className={`text-bold w-1/9 ${pl < 0 ? "text-red-500" : "text-green-500"}`}>
				{Math.round(pl * 1000) / 1000}
			</div>
			<div className=" w-1/7  text-black ">
				<button
					disabled={status === "closed"}
					className=" bg-red-500 rounded px-2 disabled:bg-gray-600 disabled:cursor-not-allowed"
					onClick={() => handleClose(id)}>
					Close
				</button>
			</div>
		</div>
	);
}
